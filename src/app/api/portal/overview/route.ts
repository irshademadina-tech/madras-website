import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, type RoleSession } from "@/lib/auth-options";
import { accessibleStudentIds, canAccessStudent } from "@/lib/access";

// GET /api/portal/overview — role-aware dashboard payload
export async function GET() {
  const session = await requireRole(["TEACHER", "PARENT", "STUDENT", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user!.role!;
  const studentIds = await accessibleStudentIds(session as RoleSession);

  const students = await db.student.findMany({
    where: { id: { in: studentIds } },
    include: {
      teacher: { include: { user: { select: { name: true } } } },
      lessons: {
        orderBy: { assignedAt: "desc" },
        take: 50,
        include: { corrections: true, revisions: true },
      },
      progressUpdates: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });

  return NextResponse.json({
    role,
    user: { name: session.user!.name, email: session.user!.email },
    students: students.map((s) => ({
      id: s.id,
      name: s.name,
      age: s.age,
      level: s.level,
      timezone: s.timezone,
      status: s.status,
      teacher: s.teacher ? { name: s.teacher.user.name, title: s.teacher.title } : null,
      lessons: s.lessons,
      progressUpdates: s.progressUpdates,
    })),
  });
}
