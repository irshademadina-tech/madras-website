import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, type RoleSession } from "@/lib/auth-options";
import { canAccessStudent } from "@/lib/access";

// POST /api/portal/lessons — assign a lesson (TEACHER only)
const assignSchema = z.object({
  studentId: z.string().min(1),
  type: z.enum(["QURAN", "QAIDA", "ISLAMIC"]).default("QURAN"),
  title: z.string().max(120).optional(),
  startAyah: z.number().int().min(1).max(6236).optional(),
  endAyah: z.number().int().min(1).max(6236).optional(),
  contentRef: z.string().max(160).optional(),
  instructions: z.string().max(1000).optional(),
  dueInDays: z.number().int().min(0).max(30).default(2),
});

export async function POST(req: NextRequest) {
  const session = await requireRole(["TEACHER", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const d = parsed.data;

  if (!(await canAccessStudent(session as RoleSession, d.studentId))) {
    return NextResponse.json({ error: "Student not found for this teacher" }, { status: 404 });
  }
  if (d.type === "QURAN" && (!d.startAyah || !d.endAyah || d.startAyah > d.endAyah)) {
    return NextResponse.json({ error: "Quran lessons need a valid ayah range" }, { status: 400 });
  }
  if (d.type !== "QURAN" && !d.contentRef) {
    return NextResponse.json({ error: "Non-Quran lessons need a content reference" }, { status: 400 });
  }

  const teacher = await db.teacher.findUnique({ where: { userId: session.user!.id! } });

  const lesson = await db.lesson.create({
    data: {
      studentId: d.studentId,
      teacherId: teacher?.id,
      type: d.type,
      title: d.title || undefined,
      startAyah: d.startAyah,
      endAyah: d.endAyah,
      contentRef: d.contentRef,
      instructions: d.instructions,
      status: "ASSIGNED",
      dueAt: new Date(Date.now() + d.dueInDays * 24 * 3600 * 1000),
    },
  });

  // notify the parent
  const student = await db.student.findUnique({
    where: { id: d.studentId },
    include: { parent: true, guardian: true },
  });
  const parentUser = student?.parent ?? student?.guardian;
  if (parentUser) {
    await db.notification.create({
      data: {
        userId: parentUser.id,
        title: "New lesson assigned",
        body: `A new lesson was assigned to ${student!.name}: ${lesson.title ?? "lesson"}.`,
        link: "/portal",
      },
    });
  }

  await db.auditLog.create({
    data: {
      userId: session.user!.id,
      action: "LESSON_ASSIGNED",
      entity: "Lesson",
      entityId: lesson.id,
      detail: `${lesson.type} for student ${d.studentId}${lesson.startAyah ? ` ayahs ${lesson.startAyah}-${lesson.endAyah}` : ""}`,
    },
  });

  return NextResponse.json({ ok: true, lesson });
}
