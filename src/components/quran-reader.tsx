"use client";

// Quran Reader — the core feature.
// Public mode: browse, jump, share. Assignment mode: tap start/end ayah to select.
// Displays the full Uthmani mushaf from /quran.json (static, versioned data).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Link2,
  Check,
  Search,
  X,
  Bookmark,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ChapterLite {
  number: number;
  arabicName: string;
  englishName: string;
  translation: string;
  ayahCount: number;
  firstGlobalId: number;
}

export interface QuranData {
  chapters: [number, string, string, string, number, number][];
  juzStarts: Record<string, number>;
  texts: string[];
}

export type AyahStatus = "assigned" | "needs-improvement" | "passed";

export interface ReaderAyahMeta {
  // global id -> status/corrections
  [globalId: number]: {
    status?: AyahStatus;
    correction?: string;
    isStart?: boolean;
    isEnd?: boolean;
  };
}

interface QuranReaderProps {
  /** initial global ayah id */
  initialAyah?: number;
  /** initial surah number (overrides initialAyah chapter placement as starting scroll target) */
  initialSurah?: number;
  /** mode: public browsing, or selecting a range (assignment) */
  mode?: "public" | "select" | "readonly-highlight";
  /** ayah metadata (statuses + corrections) keyed by global id */
  ayahMeta?: ReaderAyahMeta;
  /** selection range for readonly-highlight mode */
  highlightRange?: { start: number; end: number };
  /** initial selection in select mode */
  initialSelection?: { start: number; end: number } | null;
  /** fired when user taps an ayah in select mode */
  onAyahTap?: (globalId: number) => void;
  /** current selection for select mode (controlled) */
  selection?: { start: number; end: number } | null;
  /** compact (fewer chrome elements) for embedding in portal */
  compact?: boolean;
  /** title shown above reader */
  title?: string;
}

let cachedData: QuranData | null = null;
async function loadQuran(): Promise<QuranData> {
  if (cachedData) return cachedData;
  const res = await fetch("/quran.json");
  const raw = await res.json();
  cachedData = {
    chapters: raw.chapters.map(
      (c: [number, string, string, string, number, number]) => c
    ),
    juzStarts: raw.juzStarts,
    texts: raw.texts,
  };
  return cachedData;
}

function chapterOf(chapters: ChapterLite[], g: number): ChapterLite {
  let lo = 0,
    hi = chapters.length - 1,
    ans = chapters[0];
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (chapters[mid].firstGlobalId <= g) {
      ans = chapters[mid];
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans;
}

const AR_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
function toArabicNumber(n: number): string {
  return String(n)
    .split("")
    .map((d) => AR_DIGITS[Number(d)])
    .join("");
}

// ayah ending marker ۝ + number
function ayahMarker(n: number): string {
  return `\u06DD${toArabicNumber(n)}`;
}

export function QuranReader({
  initialAyah = 1,
  initialSurah,
  mode = "public",
  ayahMeta = {},
  highlightRange,
  initialSelection = null,
  onAyahTap,
  selection,
  compact = false,
  title,
}: QuranReaderProps) {
  const [data, setData] = useState<QuranData | null>(null);
  const [chapters, setChapters] = useState<ChapterLite[]>([]);
  const [curSurah, setCurSurah] = useState<number>(initialSurah ?? 1);
  const [jumpTo, setJumpTo] = useState("");
  const [copied, setCopied] = useState(false);
  const [browseOpen, setBrowseOpen] = useState(false);
  const [search, setSearch] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadQuran().then((d) => {
      setData(d);
      const chs: ChapterLite[] = d.chapters.map((c) => ({
        number: c[0],
        arabicName: c[1],
        englishName: c[2],
        translation: c[3],
        ayahCount: c[4],
        firstGlobalId: c[5],
      }));
      setChapters(chs);
      if (initialAyah > 1) {
        const ch = chapterOf(chs, initialAyah);
        setCurSurah(ch.number);
      }
    });
  }, [initialAyah]);

  const chapter = useMemo(
    () => chapters.find((c) => c.number === curSurah),
    [chapters, curSurah]
  );

  // verses of the current chapter with global ids
  const verses = useMemo(() => {
    if (!chapter || !data) return [];
    return data.texts
      .slice(chapter.firstGlobalId - 1, chapter.firstGlobalId - 1 + chapter.ayahCount)
      .map((text, i) => ({
        globalId: chapter.firstGlobalId + i,
        ayah: i + 1,
        text,
      }));
  }, [chapter, data]);

  // scroll to initial ayah once loaded
  useEffect(() => {
    if (!data || !initialAyah || initialAyah <= 1) return;
    const ch = chapterOf(chapters, initialAyah);
    if (ch.number !== curSurah) return;
    const t = setTimeout(() => {
      const el = document.getElementById(`ayah-${initialAyah}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    return () => clearTimeout(t);
  }, [data, curSurah, chapters]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const ch = chapters.find((c) => c.number === curSurah);
    if (!ch) return "";
    const from = (initialAyah && chapterOf(chapters, initialAyah).number === curSurah)
      ? initialAyah - ch.firstGlobalId + 1
      : 1;
    const params = new URLSearchParams();
    params.set("from", String(from));
    return `${window.location.origin}/quran/${ch.number}?${params.toString()}`;
  }, [curSurah, chapters, initialAyah]);

  const copyShare = useCallback(async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard unavailable
    }
  }, [shareUrl]);

  const filteredChapters = useMemo(() => {
    if (!search.trim()) return chapters;
    const q = search.trim().toLowerCase();
    return chapters.filter(
      (c) =>
        c.englishName.toLowerCase().includes(q) ||
        c.translation.toLowerCase().includes(q) ||
        String(c.number) === q
    );
  }, [chapters, search]);

  const navigate = (dir: 1 | -1) => {
    const next = curSurah + dir;
    if (next < 1 || next > 114) return;
    setCurSurah(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleAyahClick = (globalId: number) => {
    if (onAyahTap) onAyahTap(globalId);
  };

  const getStatusClass = (globalId: number): string => {
    // in select mode, selection range highlight
    if (mode === "select" && selection) {
      if (globalId >= selection.start && globalId <= selection.end)
        return "ayah-assigned ayah-selected";
    }
    if (mode === "select" && initialSelection) {
      const { start, end } = initialSelection;
      if (globalId >= start && globalId <= end) return "ayah-assigned";
    }
    if (mode === "readonly-highlight" && highlightRange) {
      if (globalId >= highlightRange.start && globalId <= highlightRange.end)
        return "ayah-assigned";
    }
    const meta = ayahMeta[globalId];
    if (meta?.status === "assigned") return "ayah-assigned";
    if (meta?.status === "needs-improvement") return "ayah-needs-improvement";
    if (meta?.status === "passed") return "ayah-passed";
    return "";
  };

  if (!data || !chapter) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading Qur'an" />
      </div>
    );
  }

  const juzNum = (() => {
    // find juz of the first verse of current chapter view (or initialAyah)
    const target = initialAyah > 1 && chapterOf(chapters, initialAyah).number === curSurah ? initialAyah : chapter.firstGlobalId;
    let j = 1;
    const entries = Object.entries(data.juzStarts).map(([k, v]) => [Number(k), v] as [number, number]).sort((a, b) => a[0] - b[0]);
    for (const [num, start] of entries) {
      if (target >= start) j = num;
      else break;
    }
    return j;
  })();

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6" ref={topRef}>
      {!compact && (
        <div className="mb-6 text-center">
          <h1 className="font-serif text-2xl font-bold sm:text-3xl">
            The Noble Qur&apos;an
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Uthmani text · {toArabicNumber(6236)} ayat · 114 surahs · 30 ajzaa
          </p>
        </div>
      )}

      {title && (
        <div className="mb-4 rounded-lg border border-border bg-secondary/40 px-4 py-3 text-center">
          <p className="text-sm font-medium">{title}</p>
        </div>
      )}

      {/* Chapter navigation bar */}
      <div className="sticky top-16 z-30 mb-6 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background/95 px-3 py-2.5 shadow-sm backdrop-blur">
        <div className="flex items-center gap-1">
          <Sheet open={browseOpen} onOpenChange={setBrowseOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">
                  Surah {curSurah} · Juz {juzNum}
                </span>
                <span className="sm:hidden">{curSurah}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 p-0 sm:w-96">
              <SheetTitle className="border-b border-border px-4 py-3 text-base">
                Browse the Qur&apos;an
              </SheetTitle>
              <div className="border-b border-border p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search surah name or number…"
                    className="pl-9"
                    aria-label="Search surah"
                  />
                  {search && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <ScrollArea className="h-[calc(100%-7.5rem)]">
                <div className="p-2">
                  <p className="px-2 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Juz
                  </p>
                  <div className="grid grid-cols-6 gap-1 p-1">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => {
                      const startG = data.juzStarts[String(j)];
                      const ch = chapterOf(chapters, startG);
                      return (
                        <button
                          key={j}
                          className="rounded-md border border-border px-2 py-1.5 text-xs hover:bg-secondary"
                          onClick={() => {
                            setCurSurah(ch.number);
                            setBrowseOpen(false);
                            topRef.current?.scrollIntoView({ behavior: "smooth" });
                          }}
                          aria-label={`Jump to juz ${j}`}
                        >
                          {j}
                        </button>
                      );
                    })}
                  </div>
                  <p className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Surahs
                  </p>
                  <div className="space-y-0.5">
                    {filteredChapters.map((c) => (
                      <button
                        key={c.number}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-secondary",
                          c.number === curSurah && "bg-secondary"
                        )}
                        onClick={() => {
                          setCurSurah(c.number);
                          setBrowseOpen(false);
                          topRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                      >
                        <span className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
                            {c.number}
                          </span>
                          <span>
                            <span className="block text-sm font-medium">{c.englishName}</span>
                            <span className="block text-xs text-muted-foreground">
                              {c.translation} · {c.ayahCount} ayat
                            </span>
                          </span>
                        </span>
                        <span className="font-arabic text-lg">{c.arabicName.replace("سُورَةُ ", "")}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 sm:flex">
            <Input
              value={jumpTo}
              onChange={(e) => setJumpTo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const m = jumpTo.match(/^(\d+)(?::(\d+))?$/);
                  if (m) {
                    const sn = Number(m[1]);
                    const ch = chapters.find((c) => c.number === sn);
                    if (ch) {
                      setCurSurah(sn);
                      if (m[2]) {
                        const g = ch.firstGlobalId + Number(m[2]) - 1;
                        setTimeout(() => {
                          document.getElementById(`ayah-${g}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }, 100);
                      }
                    }
                  }
                }
              }}
              placeholder="2:255"
              className="h-9 w-24 text-sm"
              aria-label="Jump to surah and ayah"
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={copyShare} aria-label="Copy share link">
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Link2 className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy link to this page</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            disabled={curSurah <= 1}
            aria-label="Previous surah"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(1)}
            disabled={curSurah >= 114}
            aria-label="Next surah"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mushaf page */}
      <article
        className="rounded-2xl border border-border bg-card px-4 py-8 shadow-sm sm:px-10 sm:py-12"
        dir="rtl"
        lang="ar"
        aria-label={`Surah ${chapter.englishName}, chapter ${chapter.number} of the Qur'an`}
      >
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gold/50 text-gold">
            <Bookmark className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="font-quran text-3xl">{chapter.arabicName}</h2>
          <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
            Surah {chapter.englishName} ({chapter.translation}) · {chapter.ayahCount} ayat · Juz {juzNum}
          </p>
        </header>

        {curSurah !== 1 && curSurah !== 9 && (
          <p className="ayah-text mb-8 text-center text-gold" dir="rtl">
            بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
          </p>
        )}

        <div className="ayah-text text-right">
          {verses.map((v) => {
            const meta = ayahMeta[v.globalId];
            return (
              <span
                key={v.globalId}
                id={`ayah-${v.globalId}`}
                role={mode === "public" ? undefined : "button"}
                tabIndex={mode === "public" ? undefined : 0}
                onClick={() => handleAyahClick(v.globalId)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAyahClick(v.globalId);
                  }
                }}
                className={cn("ayah-base", getStatusClass(v.globalId))}
                title={meta?.correction || undefined}
              >
                {v.text}{" "}
                <span className="font-quran text-[0.75em] text-primary" aria-hidden>
                  {ayahMarker(v.ayah)}
                </span>{" "}
                {meta?.correction && (
                  <span className="mx-1 inline-block align-middle" dir="ltr">
                    <Badge variant="outline" className="border-amber-500/60 bg-amber-500/10 text-[10px] text-amber-700">
                      correction
                    </Badge>
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </article>

      {/* Bottom navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)} disabled={curSurah <= 1}>
          <ChevronLeft className="me-1 h-4 w-4" /> Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          Surah {curSurah} of 114
        </span>
        <Button variant="outline" onClick={() => navigate(1)} disabled={curSurah >= 114}>
          Next <ChevronRight className="ms-1 h-4 w-4" />
        </Button>
      </div>

      {!compact && (
        <p className="mt-8 text-center text-xs text-muted-foreground">
          Qur&apos;an text: Uthmani script from Tanzil.net (public dataset), unedited. Fonts: Amiri
          Quran &amp; Scheherazade New (SIL OFL). This reader is free for everyone — no login, no
          ads, no reading tracked.
        </p>
      )}
    </div>
  );
}
