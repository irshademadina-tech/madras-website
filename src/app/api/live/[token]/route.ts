import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth-options";
import type { LiveHighlight } from "@/lib/live-types";

// /api/live/[token] — realtime channel for a single live lesson.
// No login: possession of the unguessable share token is the access grant.
// Clients poll GET (every ~900ms) and send small PATCH deltas; state
// converges near-instantly between teacher and student screens.

interface Params {
  params: Promise<{ token: string }>;
}

function parseHighlights(raw: string): LiveHighlight[] {
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function serialize(token: string) {
  const live = await db.liveSession.findUnique({
    where: { token },
    include: { lesson: { include: { student: true } } },
  });
  if (!live) return null;
  const teacher = await db.user.findUnique({
    where: { id: live.teacherUserId },
    select: { name: true },
  });
  return {
    sessionId: live.id,
    token: live.token,
    title: live.title,
    teacherName: teacher?.name ?? "Teacher",
    studentName: live.lesson?.student?.name ?? null,
    startAyah: live.startAyah,
    endAyah: live.endAyah,
    active: live.active,
    highlights: parseHighlights(live.highlights),
    scrollAyah: live.scrollAyah,
    updatedAt: live.updatedAt.toISOString(),
  };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  const state = await serialize(token);
  if (!state) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(state, { headers: { "Cache-Control": "no-store" } });
}

const patchSchema = z.object({
  kind: z.enum(["presence", "highlight", "meta"]),
  role: z.enum(["teacher", "student"]).optional(),
  name: z.string().max(60).optional(),
  // presence (teacher pushes their scroll position to all viewers)
  scrollAyah: z.number().int().min(1).max(6236).nullable().optional(),
  // highlight toggling (ayah + optional word index + kind)
  ayah: z.number().int().min(1).max(6236).optional(),
  wordIdx: z.number().int().min(0).max(500).optional(),
  hlKind: z.enum(["correct", "mistake"]).optional(),
  // meta updates — teacher only
  title: z.string().max(120).optional(),
  startAyah: z.number().int().min(1).max(6236).nullable().optional(),
  endAyah: z.number().int().min(1).max(6236).nullable().optional(),
  active: z.boolean().optional(),
  clearHighlights: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const d = parsed.data;

  const live = await db.liveSession.findUnique({ where: { token } });
  if (!live) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ---------- presence heartbeat ----------
  if (d.kind === "presence") {
    if (d.role === "teacher" && d.scrollAyah !== undefined) {
      await db.liveSession.update({
        where: { token },
        data: { scrollAyah: d.scrollAyah },
      });
    } else {
      // touch updatedAt so the room looks alive
      await db.liveSession.update({ where: { token }, data: { id: live.id } });
    }
    const state = await serialize(token);
    return NextResponse.json(state);
  }

  // ---------- highlight toggle (teacher AND student can write) ----------
  if (d.kind === "highlight") {
    if (d.ayah === undefined || !d.hlKind) {
      return NextResponse.json({ error: "Missing highlight fields" }, { status: 400 });
    }
    const list = parseHighlights(live.highlights);
    const sameTarget = (h: LiveHighlight) =>
      h.ayah === d.ayah && (h.wordIdx ?? undefined) === (d.wordIdx ?? undefined);
    const existing = list.find(sameTarget);

    let next: LiveHighlight[];
    if (existing && existing.kind === d.hlKind) {
      // clicking the same highlight again removes it (toggle off)
      next = list.filter((h) => !sameTarget(h));
    } else {
      next = list.filter((h) => !sameTarget(h));
      next.push({
        ayah: d.ayah,
        wordIdx: d.wordIdx,
        kind: d.hlKind,
        by: d.name || (d.role === "teacher" ? "Teacher" : "Student"),
        ts: Date.now(),
      });
    }
    await db.liveSession.update({
      where: { token },
      data: { highlights: JSON.stringify(next) },
    });
    const state = await serialize(token);
    return NextResponse.json(state);
  }

  // ---------- meta (range/title/end session) — teacher only ----------
  if (d.kind === "meta") {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.id !== live.teacherUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const data: Record<string, unknown> = {};
    if (d.title !== undefined) data.title = d.title;
    if (d.startAyah !== undefined) data.startAyah = d.startAyah;
    if (d.endAyah !== undefined) data.endAyah = d.endAyah;
    if (d.active !== undefined) data.active = d.active;
    if (d.clearHighlights) data.highlights = "[]";
    await db.liveSession.update({ where: { token }, data });
    const state = await serialize(token);
    return NextResponse.json(state);
  }

  return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
}
