import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-options";

// GET /api/portal/notifications — my notifications
export async function GET() {
  const session = await requireRole(["TEACHER", "PARENT", "STUDENT", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await db.notification.findMany({
    where: { userId: session.user!.id! },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return NextResponse.json({ notifications });
}

// PATCH — mark read
const patchSchema = z.object({ id: z.string().optional(), all: z.boolean().optional() });

export async function PATCH(req: NextRequest) {
  const session = await requireRole(["TEACHER", "PARENT", "STUDENT", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  if (parsed.data.all) {
    await db.notification.updateMany({
      where: { userId: session.user!.id!, read: false },
      data: { read: true },
    });
  } else if (parsed.data.id) {
    await db.notification.updateMany({
      where: { id: parsed.data.id, userId: session.user!.id! },
      data: { read: true },
    });
  }
  return NextResponse.json({ ok: true });
}
