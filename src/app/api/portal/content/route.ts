import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-options";

// GET /api/portal/content — published content library items (for lesson forms)
export async function GET() {
  const session = await requireRole(["TEACHER", "PARENT", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await db.contentItem.findMany({
    where: { published: true },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });
  return NextResponse.json({ items });
}
