import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-options";
import { hashPassword } from "@/lib/auth";
import { randomBytes } from "crypto";

// GET /api/admin/enrollments — pipeline list
export async function GET() {
  const session = await requireRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const enrollments = await db.enrollment.findMany({
    orderBy: { createdAt: "desc" },
    include: { student: { select: { id: true, name: true } } },
  });
  const teachers = await db.teacher.findMany({
    where: { active: true },
    include: { user: { select: { name: true } } },
  });
  return NextResponse.json({
    enrollments,
    teachers: teachers.map((t) => ({ id: t.id, name: t.user.name, gender: t.gender, title: t.title })),
  });
}

// PATCH /api/admin/enrollments — move through pipeline: schedule trial, record assessment, enroll
const patchSchema = z.object({
  id: z.string().min(1),
  action: z.enum([
    "SCHEDULE_TRIAL",
    "COMPLETE_TRIAL",
    "NOSHOW_TRIAL",
    "SAVE_ASSESSMENT",
    "ENROLL",
    "REJECT",
    "WITHDRAW",
  ]),
  // SCHEDULE_TRIAL
  trialAt: z.string().datetime().optional(),
  trialMeetingUrl: z.string().max(300).optional(),
  // SAVE_ASSESSMENT
  assessment: z
    .object({
      strengths: z.string().max(2000).optional(),
      weaknesses: z.string().max(2000).optional(),
      startingPoint: z.string().max(300).optional(),
      plan: z.string().max(4000).optional(),
      recommendation: z.string().max(300).optional(),
      teacherId: z.string().optional(),
    })
    .optional(),
  // ENROLL
  student: z
    .object({
      name: z.string().min(1).max(80),
      age: z.number().int().min(4).max(80).optional(),
      level: z.string().default("BEGINNER"),
      teacherId: z.string().optional(),
    })
    .optional(),
  notes: z.string().max(2000).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }
  const d = parsed.data;
  const enr = await db.enrollment.findUnique({ where: { id: d.id } });
  if (!enr) return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });

  switch (d.action) {
    case "SCHEDULE_TRIAL": {
      if (!d.trialAt) return NextResponse.json({ error: "trialAt required" }, { status: 400 });
      await db.enrollment.update({
        where: { id: d.id },
        data: {
          trialAt: new Date(d.trialAt),
          trialMeetingUrl: d.trialMeetingUrl,
          trialStatus: "SCHEDULED",
          status: "NEW",
        },
      });
      break;
    }
    case "COMPLETE_TRIAL": {
      await db.enrollment.update({
        where: { id: d.id },
        data: { trialStatus: "COMPLETED", status: "ASSESSMENT" },
      });
      break;
    }
    case "NOSHOW_TRIAL": {
      await db.enrollment.update({
        where: { id: d.id },
        data: { trialStatus: "NOSHOW" },
      });
      break;
    }
    case "SAVE_ASSESSMENT": {
      if (!d.assessment) return NextResponse.json({ error: "assessment required" }, { status: 400 });
      await db.assessment.create({
        data: {
          enrollmentId: d.id,
          reviewerId: session.user!.id,
          teacherId: d.assessment.teacherId,
          strengths: d.assessment.strengths,
          weaknesses: d.assessment.weaknesses,
          startingPoint: d.assessment.startingPoint,
          plan: d.assessment.plan,
          recommendation: d.assessment.recommendation,
        },
      });
      await db.enrollment.update({
        where: { id: d.id },
        data: {
          status: "PLAN_SENT",
          planSummary: d.assessment.plan,
        },
      });
      break;
    }
    case "ENROLL": {
      if (!d.student) return NextResponse.json({ error: "student required" }, { status: 400 });
      const student = await db.student.create({
        data: {
          name: d.student.name,
          age: d.student.age,
          level: d.student.level,
          teacherId: d.student.teacherId,
          timezone: enr.timezone,
          status: "ACTIVE",
        },
      });
      // create portal login for the parent
      const existing = await db.user.findUnique({ where: { email: enr.email } });
      if (!existing) {
        const tempPassword = "parent" + randomBytes(3).toString("hex");
        await db.user.create({
          data: {
            email: enr.email,
            name: enr.parentName,
            passwordHash: hashPassword(tempPassword),
            role: "PARENT",
            timezone: enr.timezone,
          },
        });
        // attach children by email
        const parentUser = await db.user.findUnique({ where: { email: enr.email } });
        if (parentUser) {
          await db.student.update({
            where: { id: student.id },
            data: { parentUserId: parentUser.id, guardianUserId: parentUser.id },
          });
        }
        // welcome notification + audit
        await db.notification.create({
          data: {
            userId: parentUser!.id,
            title: "Welcome to Madrasah Irshad-e-Madina",
            body: `${student.name} has been enrolled. Sign in with your email; a member of our team will share your password by WhatsApp. Today's Learning is ready in the portal.`,
            link: "/portal",
          },
        });
      }
      await db.enrollment.update({
        where: { id: d.id },
        data: { status: "ENROLLED", studentId: student.id },
      });
      break;
    }
    case "REJECT": {
      await db.enrollment.update({ where: { id: d.id }, data: { status: "REJECTED" } });
      break;
    }
    case "WITHDRAW": {
      await db.enrollment.update({ where: { id: d.id }, data: { status: "WITHDRAWN" } });
      break;
    }
  }

  await db.auditLog.create({
    data: {
      userId: session.user!.id,
      action: `ENROLLMENT_${d.action}`,
      entity: "Enrollment",
      entityId: d.id,
      detail: d.notes,
    },
  });

  const updated = await db.enrollment.findUnique({ where: { id: d.id } });
  return NextResponse.json({ ok: true, enrollment: updated });
}
