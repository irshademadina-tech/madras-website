import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-options";

// GET /api/admin/content — content library (admin, editable)
export async function GET() {
  const session = await requireRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await db.contentItem.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });
  return NextResponse.json({ items });
}

// POST — create item
const itemSchema = z.object({
  category: z.enum(["QAIDA", "NAMAZ", "KALIMA", "DUA", "SURAH", "ADAB", "OTHER"]),
  title: z.string().min(1).max(160),
  arabic: z.string().max(2000).optional(),
  transliteration: z.string().max(2000).optional(),
  translation: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
  order: z.number().int().min(0).default(0),
  published: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = itemSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const item = await db.contentItem.create({ data: parsed.data });
  await db.auditLog.create({
    data: {
      userId: session.user!.id,
      action: "CONTENT_CREATED",
      entity: "ContentItem",
      entityId: item.id,
      detail: item.title,
    },
  });
  return NextResponse.json({ ok: true, item });
}

// PATCH — update item (by id in body)
export async function PATCH(req: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...rest } = body;
  const parsed = itemSchema.partial().safeParse(rest);
  if (!parsed.success || !id) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const item = await db.contentItem
    .update({ where: { id }, data: parsed.data })
    .catch(() => null);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.auditLog.create({
    data: {
      userId: session.user!.id,
      action: "CONTENT_UPDATED",
      entity: "ContentItem",
      entityId: id,
      detail: item.title,
    },
  });
  return NextResponse.json({ ok: true, item });
}

// DELETE — by id query
export async function DELETE(req: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await db.contentItem.delete({ where: { id } }).catch(() => null);
  await db.auditLog.create({
    data: {
      userId: session.user!.id,
      action: "CONTENT_DELETED",
      entity: "ContentItem",
      entityId: id,
    },
  });
  return NextResponse.json({ ok: true });
}
