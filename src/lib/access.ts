import { db } from "@/lib/db";
import type { RoleSession } from "@/lib/auth-options";

// Role-based access: resolve which student ids a session may read/write.
// ADMIN: all. TEACHER: their assigned students. PARENT: their children.
// STUDENT: themselves (matched via parentUser's children by login email convention handled at query time).
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
  if (role === "STUDENT") {
    const me = await db.user.findUnique({ where: { id: uid } });
    if (!me) return [];
    // Students are matched by name to the parent's children record (demo convention)
    const kids = await db.student.findMany({
      where: { OR: [{ parentUserId: { not: null } }, { guardianUserId: { not: null } }], name: me.name },
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
