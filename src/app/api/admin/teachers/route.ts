import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-options";

// GET /api/admin/teachers
export async function GET() {
  const session = await requireRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const teachers = await db.teacher.findMany({
    include: {
      user: { select: { name: true, email: true } },
      _count: { select: { students: true } },
    },
  });
  return NextResponse.json({
    teachers: teachers.map((t) => ({
      id: t.id,
      name: t.user.name,
      email: t.user.email,
      title: t.title,
      bio: t.bio,
      ijazah: t.ijazah,
      experience: t.experience,
      languages: t.languages,
      teachesBest: t.teachesBest,
      gender: t.gender,
      published: t.published,
      active: t.active,
      studentCount: t._count.students,
    })),
  });
}

// PATCH — toggle publish / active
const patchSchema = z.object({
  id: z.string().min(1),
  published: z.boolean().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const { id, ...data } = parsed.data;

  await db.teacher.update({ where: { id }, data }).catch(() => null);
  await db.auditLog.create({
    data: {
      userId: session.user!.id,
      action: "TEACHER_UPDATED",
      entity: "Teacher",
      entityId: id,
      detail: JSON.stringify(data),
    },
  });
  return NextResponse.json({ ok: true });
}
