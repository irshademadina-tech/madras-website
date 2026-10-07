import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, type RoleSession } from "@/lib/auth-options";
import { canAccessStudent } from "@/lib/access";

const STATUSES = [
  "ASSIGNED",
  "PRACTICING",
  "READY_FOR_REVIEW",
  "NEEDS_IMPROVEMENT",
  "PASSED",
  "MASTERED",
] as const;

// PATCH /api/portal/lessons/[id] — update status / feedback / corrections
const patchSchema = z.object({
  action: z.enum(["REVIEW", "ADD_CORRECTION", "REMOVE_CORRECTION", "UPDATE_NOTES"]),
  status: z.enum(STATUSES).optional(),
  feedback: z.string().max(2000).optional(),
  teacherNotes: z.string().max(2000).optional(),
  correction: z
    .object({
      ayah: z.number().int().min(1).max(6236),
      note: z.string().min(1).max(300),
    })
    .optional(),
  correctionId: z.string().optional(),
});

const REVISION_STAGES_DAYS = [1, 3, 7, 14];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["TEACHER", "PARENT", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user!.role!;

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const d = parsed.data;

  const lesson = await db.lesson.findUnique({
    where: { id },
    include: { student: { include: { parent: true, guardian: true } } },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  if (!(await canAccessStudent(session as RoleSession, lesson.studentId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // --- Permission rules ---
  // Only teachers/admins act on lessons now (students learn live via share links).
  if (role === "PARENT") {
    return NextResponse.json({ error: "Only teachers can update lessons" }, { status: 403 });
  }

  switch (d.action) {
    case "REVIEW": {
      if (!d.status || !["NEEDS_IMPROVEMENT", "PASSED", "MASTERED"].includes(d.status)) {
        return NextResponse.json({ error: "Review needs a verdict status" }, { status: 400 });
      }
      if (lesson.status !== "READY_FOR_REVIEW" && lesson.status !== "PRACTICING" && lesson.status !== "ASSIGNED") {
        return NextResponse.json({ error: `Cannot review from status ${lesson.status}` }, { status: 400 });
      }
      await db.lesson.update({
        where: { id },
        data: {
          status: d.status,
          feedback: d.feedback ?? lesson.feedback,
          teacherNotes: d.teacherNotes ?? lesson.teacherNotes,
          reviewedAt: new Date(),
          completedAt: ["PASSED", "MASTERED"].includes(d.status) ? new Date() : null,
        },
      });

      // PASSED/MASTERED -> create revision queue entries (1d, 3d, 7d, 14d)
      if (["PASSED", "MASTERED"].includes(d.status)) {
        for (let stage = 0; stage < REVISION_STAGES_DAYS.length; stage++) {
          await db.revision.create({
            data: {
              lessonId: id,
              studentId: lesson.studentId,
              stage,
              dueAt: new Date(Date.now() + REVISION_STAGES_DAYS[stage] * 24 * 3600 * 1000),
              status: "PENDING",
            },
          });
        }
        // progress update for the parent
        await db.progressUpdate.create({
          data: {
            studentId: lesson.studentId,
            lessonId: id,
            summary: `Passed: ${lesson.title ?? "lesson"}${d.feedback ? ` — ${d.feedback}` : ""}. Added to the revision cycle (1, 3, 7, 14 days).`,
            rating: d.status === "MASTERED" ? 5 : 4,
          },
        });
        // notify parent
        const parentUser = lesson.student.parent ?? lesson.student.guardian;
        if (parentUser) {
          await db.notification.create({
            data: {
              userId: parentUser.id,
              title: "Lesson passed 🎉",
              body: `${lesson.student.name} passed ${lesson.title ?? "a lesson"} and it entered the revision cycle.`,
              link: "/portal",
            },
          });
        }
      } else if (d.status === "NEEDS_IMPROVEMENT") {
        const parentUser = lesson.student.parent ?? lesson.student.guardian;
        if (parentUser) {
          await db.notification.create({
            data: {
              userId: parentUser.id,
              title: "Lesson needs improvement",
              body: `${lesson.student.name}'s lesson needs another practice round: ${lesson.title ?? "lesson"}.${d.feedback ? ` Teacher's note: ${d.feedback}` : ""}`,
              link: "/portal",
            },
          });
        }
      }
      break;
    }
    case "ADD_CORRECTION": {
      if (!d.correction) return NextResponse.json({ error: "Correction missing" }, { status: 400 });
      if (lesson.type !== "QURAN") {
        return NextResponse.json({ error: "Corrections apply to Qur'an lessons" }, { status: 400 });
      }
      await db.ayahCorrection.create({
        data: { lessonId: id, ayah: d.correction.ayah, note: d.correction.note },
      });
      break;
    }
    case "REMOVE_CORRECTION": {
      if (!d.correctionId) return NextResponse.json({ error: "correctionId missing" }, { status: 400 });
      await db.ayahCorrection.deleteMany({ where: { id: d.correctionId, lessonId: id } });
      break;
    }
    case "UPDATE_NOTES": {
      await db.lesson.update({
        where: { id },
        data: { teacherNotes: d.teacherNotes ?? undefined, feedback: d.feedback ?? undefined },
      });
      break;
    }
  }

  await db.auditLog.create({
    data: {
      userId: session.user!.id,
      action: `LESSON_${d.action}`,
      entity: "Lesson",
      entityId: id,
      detail: d.status ? `-> ${d.status}` : undefined,
    },
  });

  const updated = await db.lesson.findUnique({ where: { id }, include: { corrections: true, revisions: true } });
  return NextResponse.json({ ok: true, lesson: updated });
}
