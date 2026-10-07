"use client";

// Live Quran lesson room — shared by teacher and student over a link.
// - Both can click words to highlight them (correct = emerald, mistake = amber)
//   or click the ayah marker to highlight the whole ayah. Re-click removes it.
// - The teacher's scroll position syncs to every viewer in realtime.
// - Realtime is achieved with a ~800ms poll + optimistic local writes.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bookmark,
  Check,
  CircleAlert,
  Copy,
  Eraser,
  Loader2,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LiveHighlight, LiveState } from "@/lib/live-types";

export interface LiveChapterLite {
  number: number;
  arabicName: string;
  englishName: string;
  translation: string;
  ayahCount: number;
  firstGlobalId: number;
}

interface LiveReaderProps {
  role: "teacher" | "student";
  /** display name used for attribution of highlights */
  displayName: string;
  /** initial range to open (from the session / lesson) */
  initialStart: number;
  initialEnd: number;
  /** teacher-only: called when the range changes so meta can be persisted */
  onRangeChange?: (start: number, end: number) => void;
  className?: string;
}

interface AyahView {
  globalId: number;
  ayah: number;
  text: string;
  words: string[];
}

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNumber(n: number): string {
  return String(n).split("").map((d) => AR_DIGITS[Number(d)]).join("");
}

async function loadQuranData(): Promise<{
  chapters: LiveChapterLite[];
  texts: string[];
}> {
  const res = await fetch("/quran.json");
  const raw = await res.json();
  const chapters: LiveChapterLite[] = raw.chapters.map(
    (c: [number, string, string, string, number, number]) => ({
      number: c[0],
      arabicName: c[1],
      englishName: c[2],
      translation: c[3],
      ayahCount: c[4],
      firstGlobalId: c[5],
    })
  );
  return { chapters, texts: raw.texts };
}

export function LiveReader({
  role,
  displayName,
  initialStart,
  initialEnd,
  onRangeChange,
  className,
}: LiveReaderProps) {
  const [chapters, setChapters] = useState<LiveChapterLite[]>([]);
  const [texts, setTexts] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [highlights, setHighlights] = useState<LiveHighlight[]>([]);
  const [scrollAyah, setScrollAyah] = useState<number | null>(null);
  const [active, setActive] = useState(true);
  const [connected, setConnected] = useState(false);

  const [brush, setBrush] = useState<"correct" | "mistake">("mistake");
  const [name, setName] = useState(displayName);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<string | null>(null);
  const lastPushedScroll = useRef(0);
  const highlightsRef = useRef<LiveHighlight[]>([]);
  highlightsRef.current = highlights;

  // ---------- data ----------
  useEffect(() => {
    let cancelled = false;
    loadQuranData().then((d) => {
      if (cancelled) return;
      setChapters(d.chapters);
      setTexts(d.texts);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- resolve share token from URL (/live/<token>) ----------
  useEffect(() => {
    const m = window.location.pathname.match(/\/live\/([A-Za-z0-9]+)/);
    tokenRef.current = m ? m[1] : null;
  }, []);

  const fetchState = useCallback(async (): Promise<LiveState | null> => {
    const token = tokenRef.current;
    if (!token) return null;
    try {
      const res = await fetch(`/api/live/${token}`, { cache: "no-store" });
      if (!res.ok) return null;
      return (await res.json()) as LiveState & { studentName?: string | null };
    } catch {
      return null;
    }
  }, []);
  void fetchState; // initial state arrives via the presence heartbeat below

  const applyRemote = useCallback((st: LiveState | null) => {
    if (!st) return;
    setConnected(true);
    setActive(st.active);
    setHighlights(st.highlights ?? []);
    setScrollAyah(st.scrollAyah ?? null);
    if (role === "student") {
      // teacher owns the range — students follow
      if (st.startAyah && st.endAyah) {
        setStart((p) => (p !== st.startAyah! ? st.startAyah! : p));
        setEnd((p) => (p !== st.endAyah! ? st.endAyah! : p));
      }
    }
  }, [role]);

  // ---------- polling loop (realtime sync) ----------
  useEffect(() => {
    if (!ready) return;
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;

    async function tick() {
      // presence heartbeat: students just ping; teachers push scroll position
      const token = tokenRef.current;
      if (token) {
        try {
          const payload: Record<string, unknown> = { kind: "presence", role };
          if (role === "teacher") {
            payload.scrollAyah =
              lastPushedScroll.current || start || undefined;
          } else {
            payload.name = name;
          }
          const res = await fetch(`/api/live/${token}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            applyRemote(await res.json());
          } else {
            setConnected(false);
          }
        } catch {
          setConnected(false);
        }
      }
      if (!stop) timer = setTimeout(tick, 800);
    }
    tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [ready, role, name, start, applyRemote]);

  // ---------- verses of the visible window ----------
  const chapterOf = useCallback(
    (g: number): LiveChapterLite | undefined => {
      let ans: LiveChapterLite | undefined;
      for (const c of chapters) {
        if (c.firstGlobalId <= g) ans = c;
        else break;
      }
      return ans;
    },
    [chapters]
  );

  const verses: AyahView[] = useMemo(() => {
    if (!ready || !start || !end) return [];
    const out: AyahView[] = [];
    for (let g = start; g <= Math.min(end, 6236); g++) {
      const ch = chapterOf(g);
      if (!ch) continue;
      const text = texts[g - 1];
      if (text == null) continue;
      out.push({
        globalId: g,
        ayah: g - ch.firstGlobalId + 1,
        text,
        words: text.split(" ").filter(Boolean),
      });
    }
    return out;
  }, [ready, start, end, chapterOf, texts]);

  // ---------- student follows teacher's scroll position ----------
  useEffect(() => {
    if (role !== "student" || !scrollAyah) return;
    const el = document.getElementById(`live-ayah-${scrollAyah}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [scrollAyah, role]);

  // ---------- teacher pushes scroll position (throttled) ----------
  const handleScroll = useCallback(() => {
    if (role !== "teacher") return;
    const el = containerRef.current;
    if (!el) return;
    const mid = el.scrollTop + el.clientHeight / 2;
    let best = start;
    let bestDist = Infinity;
    for (const v of verses) {
      const node = document.getElementById(`live-ayah-${v.globalId}`);
      if (!node) continue;
      const c = node.offsetTop + node.offsetHeight / 2;
      const dist = Math.abs(c - mid);
      if (dist < bestDist) {
        bestDist = dist;
        best = v.globalId;
      }
    }
    lastPushedScroll.current = best;
  }, [role, start, verses]);

  // ---------- range editing ----------
  const commitRange = useCallback(
    (s: number, e: number) => {
      if (s > e) [s, e] = [e, s];
      s = Math.min(Math.max(s, 1), 6236);
      e = Math.min(Math.max(e, 1), 6236);
      setStart(s);
      setEnd(e);
      if (role === "teacher") onRangeChange?.(s, e);
    },
    [role, onRangeChange]
  );

  const shiftRange = (delta: number) => {
    const len = end - start;
    let s = start + delta;
    if (s < 1) s = 1;
    if (s + len > 6236) s = 6236 - len;
    commitRange(s, s + len);
  };

  // ---------- highlight writing ----------
  const writeHighlight = useCallback(
    async (ayah: number, wordIdx: number | undefined, kind: "correct" | "mistake") => {
      // optimistic update
      setHighlights((prev) => {
        const same = prev.find(
          (h) => h.ayah === ayah && (h.wordIdx ?? undefined) === (wordIdx ?? undefined)
        );
        const next = prev.filter(
          (h) => !(h.ayah === ayah && (h.wordIdx ?? undefined) === (wordIdx ?? undefined))
        );
        if (!(same && same.kind === kind)) {
          next.push({ ayah, wordIdx, kind, by: name, ts: Date.now() });
        }
        return next;
      });
      const token = tokenRef.current;
      if (!token) return;
      try {
        const res = await fetch(`/api/live/${token}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind: "highlight",
            role,
            name,
            ayah,
            wordIdx,
            hlKind: kind,
          }),
        });
        if (res.ok) applyRemote(await res.json());
      } catch {
        setConnected(false);
      }
    },
    [name, role, applyRemote]
  );

  const toggleWord = (ayah: number, wordIdx: number) => {
    const existing = highlightsRef.current.find(
      (h) => h.ayah === ayah && (h.wordIdx ?? undefined) === wordIdx
    );
    const kind =
      existing && existing.kind === brush ? existing.kind : brush;
    writeHighlight(ayah, wordIdx, kind);
  };

  const toggleAyah = (ayah: number) => {
    const existing = highlightsRef.current.find(
      (h) => h.ayah === ayah && h.wordIdx === undefined
    );
    const kind = existing && existing.kind === brush ? existing.kind : brush;
    writeHighlight(ayah, undefined, kind);
  };

  const clearAll = async () => {
    const token = tokenRef.current;
    if (!token) return;
    setHighlights([]);
    if (role === "teacher") {
      await fetch(`/api/live/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "meta", clearHighlights: true }),
      }).then(async (r) => r.ok && applyRemote(await r.json()));
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const hlFor = (ayah: number, wordIdx?: number) =>
    highlights.find(
      (h) => h.ayah === ayah && (h.wordIdx ?? undefined) === (wordIdx ?? undefined)
    );

  if (!ready) {
    return (
      <div className={cn("flex min-h-[50vh] items-center justify-center", className)}>
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading Qur'an" />
      </div>
    );
  }

  const firstChapter = chapterOf(start);
  const lastChapter = chapterOf(end);
  const mistakeCount = highlights.filter((h) => h.kind === "mistake").length;
  const correctCount = highlights.filter((h) => h.kind === "correct").length;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background/95 px-3 py-2 shadow-sm backdrop-blur">
        {/* brush selector */}
        <div className="flex items-center gap-1 rounded-lg bg-secondary p-1" role="radiogroup" aria-label="Highlight mode">
          <button
            role="radio"
            aria-checked={brush === "mistake"}
            onClick={() => setBrush("mistake")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              brush === "mistake"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CircleAlert className="h-3.5 w-3.5" aria-hidden /> Mistake
          </button>
          <button
            role="radio"
            aria-checked={brush === "correct"}
            onClick={() => setBrush("correct")}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              brush === "correct"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Check className="h-3.5 w-3.5" aria-hidden /> Correct
          </button>
        </div>

        {role === "teacher" && (
          <div className="flex items-center gap-1 text-xs">
            <Input
              value={String(start)}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/\D/g, ""));
                if (n >= 1 && n <= 6236) commitRange(n, Math.max(n, end));
              }}
              className="h-8 w-16 text-center text-xs"
              aria-label="Start global ayah id"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              value={String(end)}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/\D/g, ""));
                if (n >= 1 && n <= 6236) commitRange(start, Math.max(start, n));
              }}
              className="h-8 w-16 text-center text-xs"
              aria-label="End global ayah id"
            />
            <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => shiftRange(-1)} aria-label="Shift range back">
              ←
            </Button>
            <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => shiftRange(1)} aria-label="Shift range forward">
              →
            </Button>
          </div>
        )}

        <span className="hidden text-xs text-muted-foreground sm:inline">
          Surah {firstChapter?.englishName}
          {lastChapter && lastChapter.number !== firstChapter?.number
            ? ` – ${lastChapter.englishName}`
            : ""}{" "}
          · {end - start + 1} ayat
        </span>

        <div className="ms-auto flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            ✓{correctCount} · ⚠{mistakeCount}
          </span>
          <span
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              connected ? "bg-emerald-600/10 text-emerald-700" : "bg-neutral-500/10 text-neutral-600"
            )}
            title={connected ? "Live — synced" : "Reconnecting…"}
          >
            <Radio className={cn("h-3 w-3", connected && "animate-pulse")} aria-hidden />
            {connected ? "Live" : "Offline"}
          </span>
          {role === "teacher" && (
            <>
              <Button size="sm" variant="ghost" className="gap-1.5" onClick={clearAll}>
                <Eraser className="h-4 w-4" aria-hidden /> Clear
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy link"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Name entry for students */}
      {role === "student" && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <label htmlFor="live-name">You are joining as</label>
          <Input
            id="live-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8 w-40 text-xs"
            aria-label="Your name"
          />
          <span>· Follow the teacher — tap any word to highlight it too.</span>
        </div>
      )}

      {/* Scrollable mushaf */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="mt-3 flex-1 overflow-y-auto rounded-2xl border border-border bg-card shadow-sm"
      >
        {!active && (
          <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm font-medium text-amber-800">
            This live lesson has ended. Highlights are read-only.
          </div>
        )}
        <article dir="rtl" lang="ar" className="px-4 py-8 sm:px-10 sm:py-10">
          <header className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold/50 text-gold">
              <Bookmark className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="font-quran text-3xl">{firstChapter?.arabicName}</h2>
            <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
              Surah {firstChapter?.englishName} ({firstChapter?.translation})
            </p>
          </header>

          <div className="ayah-text space-y-4 text-right">
            {verses.map((v) => {
              const ayahHl = hlFor(v.globalId, undefined);
              const isFocused = scrollAyah === v.globalId;
              return (
                <div key={v.globalId} id={`live-ayah-${v.globalId}`} className="inline">
                  {v.words.map((w, i) => {
                    const hl = hlFor(v.globalId, i);
                    return (
                      <span
                        key={i}
                        role="button"
                        tabIndex={0}
                        title={hl ? `${hl.kind === "mistake" ? "Mistake" : "Correct"} — marked by ${hl.by}` : "Tap to highlight"}
                        onClick={() => toggleWord(v.globalId, i)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleWord(v.globalId, i);
                          }
                        }}
                        className={cn(
                          "live-word",
                          hl?.kind === "correct" && "live-correct",
                          hl?.kind === "mistake" && "live-mistake"
                        )}
                      >
                        {w}{" "}
                      </span>
                    );
                  })}
                  <span
                    role="button"
                    tabIndex={0}
                    title={
                      ayahHl
                        ? `Whole ayah marked ${ayahHl.kind} by ${ayahHl.by}`
                        : "Tap to highlight the whole ayah"
                    }
                    onClick={() => toggleAyah(v.globalId)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleAyah(v.globalId);
                      }
                    }}
                    className={cn(
                      "live-marker font-quran",
                      ayahHl?.kind === "correct" && "live-correct",
                      ayahHl?.kind === "mistake" && "live-mistake",
                      isFocused && "live-focused"
                    )}
                  >
                    {"۝"}
                    {toArabicNumber(v.ayah)}
                  </span>{" "}
                </div>
              );
            })}
          </div>
        </article>
      </div>

      {/* Legend */}
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Tap a word to highlight it with your brush · tap again to remove · the ayah marker
        ({" "}
        <span className="font-quran">۝</span> ) highlights the whole ayah ·{" "}
        {role === "teacher" ? "Your scrolling is mirrored to your student" : "Your screen follows the teacher"}
      </p>
    </div>
  );
}
