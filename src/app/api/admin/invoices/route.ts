import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-options";

// GET /api/admin/invoices — also visible to PARENT (their own invoices)
export async function GET() {
  const session = await requireRole(["ADMIN", "PARENT"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = session.user!.role!;

  let where = {};
  if (role === "PARENT") {
    // invoices tied to the parent user via enrollment contact, or unattached
    // demo invoices (no enrollment) are shown to parents with children
    const kids = await db.student.count({
      where: { OR: [{ parentUserId: session.user!.id! }, { guardianUserId: session.user!.id! }] },
    });
    where = kids > 0 ? {} : { enrollment: { contactUser: { id: session.user!.id! } } };
  }

  const invoices = await db.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ invoices });
}

// PATCH /api/admin/invoices — mark paid / waive / refund (ADMIN, manual approval only)
const patchSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["MARK_PAID", "WAIVE", "REFUND", "MARK_OVERDUE"]),
  method: z.string().max(40).optional(),
  notes: z.string().max(500).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const d = parsed.data;

  const statusMap: Record<string, string> = {
    MARK_PAID: "PAID",
    WAIVE: "WAIVED",
    REFUND: "REFUNDED",
    MARK_OVERDUE: "OVERDUE",
  };

  const inv = await db.invoice
    .update({
      where: { id: d.id },
      data: {
        status: statusMap[d.action],
        method: d.method,
        notes: d.notes,
        paidAt: d.action === "MARK_PAID" ? new Date() : undefined,
      },
    })
    .catch(() => null);
  if (!inv) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  await db.auditLog.create({
    data: {
      userId: session.user!.id,
      action: `INVOICE_${d.action}`,
      entity: "Invoice",
      entityId: d.id,
      detail: `${inv.number} -> ${statusMap[d.action]}`,
    },
  });

  return NextResponse.json({ ok: true, invoice: inv });
}

// POST — create invoice (ADMIN)
const createSchema = z.object({
  number: z.string().min(3).max(40),
  amountCents: z.number().int().min(0),
  currency: z.enum(["GBP", "USD", "CAD"]).default("GBP"),
  period: z.string().max(120).optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await requireRole(["ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

  const inv = await db.invoice.create({ data: parsed.data });
  await db.auditLog.create({
    data: {
      userId: session.user!.id,
      action: "INVOICE_CREATED",
      entity: "Invoice",
      entityId: inv.id,
      detail: inv.number,
    },
  });
  return NextResponse.json({ ok: true, invoice: inv });
}
