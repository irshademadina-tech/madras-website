"use client";

// LiveRoom — wrapper around the shared LiveReader.
// Decides the viewer's role: the owning teacher (or an admin) presents and
// controls the range/session; everyone else with the link joins as a student.

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, Radio, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LiveReader } from "@/components/live/live-reader";
import type { LiveState } from "@/lib/live-types";

interface LiveRoomProps {
  token: string;
  title: string;
  teacherName: string;
  studentName: string | null;
  startAyah: number;
  endAyah: number;
  canManage: boolean;
  viewerName: string;
  signedIn: boolean;
}

export function LiveRoom({
  token,
  title,
  teacherName,
  studentName,
  startAyah,
  endAyah,
  canManage,
  viewerName,
}: LiveRoomProps) {
  const role = canManage ? "teacher" : "student";
  const [ended, setEnded] = useState(false);

  const pushMeta = useCallback(
    async (data: Record<string, unknown>) => {
      const res = await fetch(`/api/live/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "meta", ...data }),
      });
      if (res.ok) {
        const st = (await res.json()) as LiveState;
        setEnded(!st.active);
      }
    },
    [token]
  );

  const pendingRange = useRef<{ t: ReturnType<typeof setTimeout> } | null>(null);
  const onRangeChange = useCallback(
    (s: number, e: number) => {
      // debounce so arrow-clicking doesn't hammer the API
      if (pendingRange.current) clearTimeout(pendingRange.current.t);
      const t = setTimeout(() => void pushMeta({ startAyah: s, endAyah: e }), 400);
      pendingRange.current = { t };
    },
    [pushMeta]
  );

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-serif text-sm font-bold">{title}</p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                {role === "teacher" ? "Presenting" : "Joining live"} · Qari {teacherName}
                {studentName ? ` · ${studentName}` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700 sm:flex">
              <Radio className="h-3.5 w-3.5 animate-pulse" aria-hidden /> LIVE
            </span>
            {role === "teacher" && !ended && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => pushMeta({ active: false })}
              >
                <VideoOff className="h-4 w-4" aria-hidden /> End lesson
              </Button>
            )}
            {role === "teacher" && ended && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => pushMeta({ active: true })}
              >
                <Radio className="h-4 w-4" aria-hidden /> Resume
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link href={role === "teacher" ? "/portal" : "/"}>
                {role === "teacher" ? "Back to portal" : "Home"}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-4 sm:px-6">
        {!canManage && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-2.5 text-sm">
            <GraduationCap className="h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span>
              Assalamu alaikum <b>{viewerName}</b>! Read along with {teacherName}. Tap any word
              you are unsure about — it highlights instantly for both of you.
            </span>
          </div>
        )}
        <LiveReader
          key={token}
          role={role}
          displayName={viewerName}
          initialStart={startAyah}
          initialEnd={endAyah}
          onRangeChange={role === "teacher" ? onRangeChange : undefined}
          className="min-h-[70vh]"
        />
      </main>

      <footer className="border-t border-border/60 bg-background py-2 text-center text-[11px] text-muted-foreground">
        Madrasah Irshad-e-Madina · Live Qur&apos;an lesson · Uthmani text from Tanzil.net
      </footer>
    </div>
  );
}
