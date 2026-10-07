import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole, type RoleSession } from "@/lib/auth-options";
import { accessibleStudentIds } from "@/lib/access";

// GET /api/portal/revisions — due & upcoming revisions for the caller's students
export async function GET() {
  const session = await requireRole(["TEACHER", "PARENT", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const studentIds = await accessibleStudentIds(session as RoleSession);
  const revisions = await db.revision.findMany({
    where: { studentId: { in: studentIds } },
    include: { lesson: true },
    orderBy: { dueAt: "asc" },
    take: 100,
  });

  const now = new Date();
  return NextResponse.json({
    due: revisions.filter((r) => r.status === "PENDING" && r.dueAt <= now),
    upcoming: revisions.filter((r) => r.status === "PENDING" && r.dueAt > now),
    done: revisions.filter((r) => r.status === "DONE"),
  });
}

// PATCH /api/portal/revisions — mark a revision done/skipped (teacher override allowed)
const patchSchema = z.object({
  revisionId: z.string().min(1),
  action: z.enum(["DONE", "SKIP"]),
});

export async function PATCH(req: NextRequest) {
  const session = await requireRole(["TEACHER", "PARENT", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const revision = await db.revision.findUnique({ where: { id: parsed.data.revisionId } });
  if (!revision) return NextResponse.json({ error: "Revision not found" }, { status: 404 });

  if (!(await accessibleStudentIds(session as RoleSession)).includes(revision.studentId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.revision.update({
    where: { id: revision.id },
    data: {
      status: parsed.data.action === "DONE" ? "DONE" : "SKIPPED",
      doneAt: new Date(),
    },
  });

  await db.auditLog.create({
    data: {
      userId: session.user!.id,
      action: `REVISION_${parsed.data.action}`,
      entity: "Revision",
      entityId: revision.id,
    },
  });

  return NextResponse.json({ ok: true });
}
