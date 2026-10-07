import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth-options";

// /api/live — teacher-managed live Quran lesson sessions.
// Students never log in: they join through the share link (/live/[token]).

const createSchema = z.object({
  lessonId: z.string().min(1).optional(),
  title: z.string().max(120).optional(),
  startAyah: z.number().int().min(1).max(6236).optional(),
  endAyah: z.number().int().min(1).max(6236).optional(),
});

export async function GET() {
  const session = await requireRole(["TEACHER", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where =
    session.user!.role === "ADMIN" ? {} : { teacherUserId: session.user!.id! };

  const sessions = await db.liveSession.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 50,
  });
  return NextResponse.json({
    sessions: sessions.map((s) => ({
      id: s.id,
      token: s.token,
      title: s.title,
      startAyah: s.startAyah,
      endAyah: s.endAyah,
      active: s.active,
      highlights: JSON.parse(s.highlights || "[]").length,
      updatedAt: s.updatedAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await requireRole(["TEACHER", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  let title = d.title?.trim();
  let lessonId: string | undefined;
  if (d.lessonId) {
    const lesson = await db.lesson.findUnique({
      where: { id: d.lessonId },
      include: { student: true },
    });
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    lessonId = lesson.id;
    title = title || `Live lesson — ${lesson.student.name}`;
  }

  const live = await db.liveSession.create({
    data: {
      token: randomBytes(8).toString("hex"),
      lessonId,
      teacherUserId: session.user!.id!,
      title: title || "Live Qur'an Lesson",
      startAyah: d.startAyah,
      endAyah: d.endAyah,
      highlights: "[]",
    },
  });

  return NextResponse.json({
    session: { id: live.id, token: live.token, title: live.title },
  });
}
