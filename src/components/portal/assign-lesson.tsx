"use client";

// Teacher: Assign Lesson dialog.
// Qur'an lessons: tap start & end ayah in the reader (auto-suggests from last lesson end).
// Islamic lessons: pick from content library. Range can cross surah boundaries.

import { useEffect, useMemo, useState } from "react";
import { BookOpen, ClipboardList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuranReader } from "@/components/quran-reader";
import { formatRange, globalToSurahAyah } from "@/lib/quran";
import type { LessonLite, StudentOverview } from "@/lib/portal-types";
import { useToast } from "@/hooks/use-toast";

interface ContentItemLite {
  id: string;
  category: string;
  title: string;
  arabic: string | null;
}

export function AssignLessonDialog({
  student,
  open,
  onOpenChange,
  onAssigned,
}: {
  student: StudentOverview;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onAssigned: () => void;
}) {
  const { toast } = useToast();
  const [tab, setTab] = useState("quran");
  const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
  const [instructions, setInstructions] = useState("");
  const [title, setTitle] = useState("");
  const [contentRef, setContentRef] = useState<string>("");
  const [contentItems, setContentItems] = useState<ContentItemLite[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-suggest: continue from where the last Qur'an lesson ended
  const suggestion = useMemo(() => {
    const quranLessons = student.lessons
      .filter((l: LessonLite) => l.type === "QURAN" && l.endAyah)
      .sort((a, b) => (b.endAyah ?? 0) - (a.endAyah ?? 0));
    if (quranLessons.length === 0) return 1; // Al-Fatiha 1:1
    return Math.min(quranLessons[0].endAyah! + 1, 6236);
  }, [student]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setSelection(null);
      setInstructions("");
      setTitle("");
      setContentRef("");
      setError(null);
    }, 0);
    fetch("/api/portal/content")
      .then((r) => r.json())
      .then((d) => setContentItems(d.items ?? []))
      .catch(() => {});
    return () => clearTimeout(t);
  }, [open]);

  function handleAyahTap(globalId: number) {
    setSelection((prev) => {
      if (!prev) return { start: globalId, end: globalId };
      // if tapping inside current range -> restart selection
      if (globalId >= prev.start && globalId <= prev.end) return { start: globalId, end: globalId };
      if (globalId > prev.start) return { ...prev, end: globalId };
      return { start: globalId, end: prev.end };
    });
  }

  async function assign() {
    setBusy(true);
    setError(null);
    const body =
      tab === "quran"
        ? {
            studentId: student.id,
            type: "QURAN",
            startAyah: selection?.start,
            endAyah: selection?.end,
            title: title || undefined,
            instructions: instructions || undefined,
            dueInDays: 2,
          }
        : {
            studentId: student.id,
            type: "ISLAMIC",
            contentRef,
            title: title || contentRef,
            instructions: instructions || undefined,
            dueInDays: 2,
          };
    const res = await fetch("/api/portal/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to assign");
      return;
    }
    toast({
      title: "Lesson assigned",
      description: `${student.name}: ${tab === "quran" ? (selection ? formatRange(selection.start, selection.end) : "") : contentRef}`,
    });
    onAssigned();
    onOpenChange(false);
  }

  const canAssign =
    tab === "quran" ? !!selection : contentRef.trim().length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Assign lesson — {student.name}</DialogTitle>
          <DialogDescription>
            Tap the start and end āyāt in the reader. The reader suggests continuing from
            where the last lesson ended. Lessons may cross surah boundaries.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quran" className="gap-1.5">
              <BookOpen className="h-4 w-4" aria-hidden /> Qur&apos;an
            </TabsTrigger>
            <TabsTrigger value="islamic" className="gap-1.5">
              <ClipboardList className="h-4 w-4" aria-hidden /> Islamic learning
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quran" className="mt-3">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2">
              <p className="text-sm">
                {selection ? (
                  <>
                    Selected:{" "}
                    <span className="font-semibold text-primary">
                      {formatRange(selection.start, selection.end)}
                    </span>{" "}
                    <span className="text-xs text-muted-foreground">
                      ({selection.end - selection.start + 1} āyāt)
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">
                    Tap an āyah to set the start…
                  </span>
                )}
              </p>
              {selection && (
                <Button variant="ghost" size="sm" onClick={() => setSelection(null)}>
                  Clear
                </Button>
              )}
            </div>
            <ScrollArea className="h-[46vh] rounded-lg border">
              <div dir="rtl" lang="ar" className="p-4">
                <QuranReader
                  mode="select"
                  selection={selection}
                  onAyahTap={handleAyahTap}
                  compact
                />
              </div>
            </ScrollArea>
            <p className="mt-2 text-xs text-muted-foreground">
              Suggested start:{" "}
              {(() => {
                const { surah, ayah } = globalToSurahAyah(suggestion);
                return `${surah}:${ayah}`;
              })()}{" "}
              (from the last lesson)
            </p>
          </TabsContent>

          <TabsContent value="islamic" className="mt-3">
            <ScrollArea className="h-[46vh] rounded-lg border p-2">
              {["KALIMA", "DUA", "NAMAZ", "QAIDA", "SURAH", "ADAB", "OTHER"].map((cat) => {
                const items = contentItems.filter((i) => i.category === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat} className="mb-3">
                    <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {cat === "NAMAZ" ? "Namaz" : cat === "DUA" ? "Duas" : cat}
                    </p>
                    <div className="space-y-1">
                      {items.map((i) => (
                        <button
                          key={i.id}
                          onClick={() => setContentRef(i.title)}
                          className={
                            contentRef === i.title
                              ? "w-full rounded-lg border-2 border-primary bg-primary/5 px-3 py-2 text-left text-sm"
                              : "w-full rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-secondary"
                          }
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span>{i.title}</span>
                            {i.arabic && (
                              <span className="font-arabic text-lg text-foreground/70">
                                {i.arabic.slice(0, 24)}
                                {i.arabic.length > 24 ? "…" : ""}
                              </span>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {contentItems.length === 0 && (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  Loading content library…
                </p>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="lesson-title">Title (optional)</Label>
            <Input
              id="lesson-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                tab === "quran"
                  ? selection
                    ? `Nazra — ${formatRange(selection.start, selection.end)}`
                    : "e.g. Nazra — Surah Al-Baqarah"
                  : "e.g. Kalimas — First Kalima"
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lesson-instructions">Instructions (optional)</Label>
            <Textarea
              id="lesson-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Focus points, tajweed rules, revision notes…"
              rows={2}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={assign} disabled={!canAssign || busy} className="gap-1.5">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Assign lesson
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
