import { db } from "@/lib/db";
import type { RoleSession } from "@/lib/auth-options";

// Role-based access: resolve which student ids a session may read/write.
// ADMIN: all. TEACHER: their assigned students. PARENT: their children.
// There is no STUDENT portal account — pupils join live lesson share links only.
export async function accessibleStudentIds(session: RoleSession): Promise<string[]> {
  const role = session.user!.role!;
  const uid = session.user!.id!;
  if (role === "ADMIN") {
    const all = await db.student.findMany({ select: { id: true } });
    return all.map((s) => s.id);
  }
  if (role === "TEACHER") {
    const t = await db.teacher.findUnique({ where: { userId: uid } });
    if (!t) return [];
    const students = await db.student.findMany({ where: { teacherId: t.id }, select: { id: true } });
    return students.map((s) => s.id);
  }
  if (role === "PARENT") {
    const kids = await db.student.findMany({
      where: { OR: [{ parentUserId: uid }, { guardianUserId: uid }] },
      select: { id: true },
    });
    return kids.map((s) => s.id);
  }
  return [];
}

export async function canAccessStudent(session: RoleSession, studentId: string): Promise<boolean> {
  const ids = await accessibleStudentIds(session);
  return ids.includes(studentId);
}
