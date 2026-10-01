import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-options";

// GET /api/admin/students — all students (admin)
export async function GET() {
  const session = await requireRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const students = await db.student.findMany({
    include: {
      teacher: { select: { id: true } },
      parent: { select: { name: true, email: true } },
      _count: { select: { lessons: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const teachers = await db.teacher.findMany({
    where: { active: true },
    include: { user: { select: { name: true, email: true } } },
  });
  return NextResponse.json({
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      age: s.age,
      level: s.level,
      status: s.status,
      timezone: s.timezone,
      teacherId: s.teacher?.id ?? null,
      parent: s.parent ? { name: s.parent.name, email: s.parent.email } : null,
      lessonCount: s._count.lessons,
    })),
    teachers: teachers.map((t) => ({
      id: t.id,
      name: t.user.name,
      email: t.user.email,
      title: t.title,
      gender: t.gender,
      studentCount: 0,
    })),
  });
}

// PATCH — update student (assign teacher, level, status)
const patchSchema = z.object({
  id: z.string().min(1),
  teacherId: z.string().nullable().optional(),
  level: z.enum(["BEGINNER", "QAIDA", "NAZRA", "TAJWEED", "HIFZ"]).optional(),
  status: z.enum(["ACTIVE", "PAUSED", "WITHDRAWN", "TRIAL"]).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const { id, ...data } = parsed.data;

  const student = await db.student.update({ where: { id }, data }).catch(() => null);
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  await db.auditLog.create({
    data: {
      userId: session.user!.id,
      action: "STUDENT_UPDATED",
      entity: "Student",
      entityId: id,
      detail: JSON.stringify(data),
    },
  });

  return NextResponse.json({ ok: true });
}
