"use client";

// Lesson card with integrated reader dialogs for all roles.
// - Student: opens reader at lesson range (highlighted), Practice / Mark Ready buttons
// - Parent: read-only reader view + WhatsApp share card
// - Teacher: review mode with ayah-level corrections

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  CheckCheck,
  ClipboardList,
  Loader2,
  MessageCircle,
  PlayCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StatusBadge } from "@/components/portal/shell";
import { QuranReader, type ReaderAyahMeta } from "@/components/quran-reader";
import { formatRange, globalToSurahAyah } from "@/lib/quran";
import type { LessonLite } from "@/lib/portal-types";

async function lessonAction(
  lessonId: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; error?: string; lesson?: LessonLite }> {
  const res = await fetch(`/api/portal/lessons/${lessonId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export function LessonCard({
  lesson,
  studentName,
  onChanged,
}: {
  lesson: LessonLite;
  studentName: string;
  onChanged: () => void;
}) {
  const { data: session } = useSession();
  const role = session?.user?.role as string | undefined;
  const [busy, setBusy] = useState(false);
  const [readerOpen, setReaderOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [feedback, setFeedback] = useState(lesson.feedback ?? "");
  const [verdict, setVerdict] = useState<"NEEDS_IMPROVEMENT" | "PASSED" | "MASTERED">("PASSED");
  const [error, setError] = useState<string | null>(null);

  const isQuran = lesson.type === "QURAN" && lesson.startAyah && lesson.endAyah;
  const rangeLabel = isQuran ? formatRange(lesson.startAyah!, lesson.endAyah!) : lesson.contentRef ?? "";

  // ayah metadata for reader: corrections + status coloring
  const ayahMeta: ReaderAyahMeta = {};
  if (isQuran) {
    for (let g = lesson.startAyah!; g <= lesson.endAyah!; g++) {
      ayahMeta[g] = {
        status:
          lesson.status === "PASSED" || lesson.status === "MASTERED"
            ? "passed"
            : lesson.status === "NEEDS_IMPROVEMENT"
              ? "needs-improvement"
              : "assigned",
      };
    }
    for (const c of lesson.corrections) {
      ayahMeta[c.ayah] = { ...(ayahMeta[c.ayah] ?? {}), correction: c.note };
    }
  }

  async function act(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const res = await lessonAction(lesson.id, body);
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Action failed");
    else onChanged();
    return res.ok;
  }

  async function submitReview() {
    const ok = await act({ action: "REVIEW", status: verdict, feedback });
    if (ok) setReviewOpen(false);
  }

  const canPractice = role === "STUDENT" || role === "PARENT";
  const canReview = role === "TEACHER" || role === "ADMIN";

  const status = lesson.status;
  const showPractice =
    canPractice && ["ASSIGNED", "NEEDS_IMPROVEMENT"].includes(status);
  const showReady =
    canPractice && ["PRACTICING", "ASSIGNED", "NEEDS_IMPROVEMENT"].includes(status);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={
                "flex h-9 w-9 items-center justify-center rounded-lg " +
                (lesson.type === "QURAN"
                  ? "bg-primary/10 text-primary"
                  : "bg-gold/15 text-gold")
              }
            >
              {lesson.type === "QURAN" ? (
                <BookOpen className="h-5 w-5" aria-hidden />
              ) : (
                <ClipboardList className="h-5 w-5" aria-hidden />
              )}
            </span>
            <div>
              <CardTitle className="text-base leading-tight">
                {lesson.title ?? rangeLabel}
              </CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {studentName} · {rangeLabel}
                {lesson.dueAt &&
                  ` · due ${new Date(lesson.dueAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
              </p>
            </div>
          </div>
          <StatusBadge status={lesson.status} />
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {lesson.instructions && (
          <p className="text-sm text-muted-foreground">{lesson.instructions}</p>
        )}
        {lesson.feedback && (
          <div className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <p className="text-xs font-semibold text-amber-700">Teacher feedback</p>
            <p className="mt-1 text-sm">{lesson.feedback}</p>
          </div>
        )}
        {lesson.corrections.length > 0 && (
          <div className="mt-2 space-y-1">
            {lesson.corrections.map((c) => {
              const { surah, ayah } = globalToSurahAyah(c.ayah);
              return (
                <p key={c.id} className="text-xs text-muted-foreground">
                  <span className="font-semibold text-amber-700">
                    {surah}:{ayah}
                  </span>{" "}
                  — {c.note}
                </p>
              );
            })}
          </div>
        )}
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2 pt-0">
        {isQuran && (
          <Button
            variant={status === "READY_FOR_REVIEW" ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setReaderOpen(true)}
          >
            <BookOpen className="h-4 w-4" aria-hidden />
            Open Reader
          </Button>
        )}

        {showPractice && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={busy}
            onClick={() => act({ action: "START_PRACTICE" })}
          >
            <PlayCircle className="h-4 w-4" aria-hidden />
            Practice
          </Button>
        )}
        {showReady && (
          <Button
            size="sm"
            className="gap-1.5"
            disabled={busy}
            onClick={() => act({ action: "MARK_READY" })}
          >
            <Send className="h-4 w-4" aria-hidden />
            Mark Ready
          </Button>
        )}

        {canReview && ["READY_FOR_REVIEW", "PRACTICING", "ASSIGNED"].includes(status) && (
          <Button size="sm" className="gap-1.5" onClick={() => setReviewOpen(true)}>
            <CheckCheck className="h-4 w-4" aria-hidden />
            Review
          </Button>
        )}

        {status === "PASSED" && lesson.revisions.length > 0 && (
          <p className="ms-auto self-center text-xs text-muted-foreground">
            <Sparkles className="me-1 inline h-3.5 w-3.5 text-gold" aria-hidden />
            In revision cycle ({lesson.revisions.filter((r) => r.status === "DONE").length}/
            {lesson.revisions.length} done)
          </p>
        )}
      </CardFooter>

      {/* Reader dialog */}
      <Dialog open={readerOpen} onOpenChange={setReaderOpen}>
        <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden p-0 sm:max-w-4xl">
          <ScrollArea className="max-h-[92vh]">
            <div className="pt-2">
              {isQuran && (
                <QuranReader
                  initialAyah={lesson.startAyah!}
                  mode={canReview ? "select" : "readonly-highlight"}
                  highlightRange={
                    canReview ? undefined : { start: lesson.startAyah!, end: lesson.endAyah! }
                  }
                  initialSelection={
                    canReview ? { start: lesson.startAyah!, end: lesson.endAyah! } : null
                  }
                  ayahMeta={ayahMeta}
                  compact
                  title={`${lesson.title ?? "Lesson"} — ${studentName}`}
                />
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Review lesson</DialogTitle>
            <DialogDescription>
              {lesson.title ?? rangeLabel} — {studentName}. Passed adds the lesson to the
              revision cycle (1, 3, 7, 14 days).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["NEEDS_IMPROVEMENT", "Needs improvement"],
                  ["PASSED", "Passed"],
                  ["MASTERED", "Mastered"],
                ] as const
              ).map(([v, label]) => (
                <button
                  key={v}
                  onClick={() => setVerdict(v)}
                  className={
                    verdict === v
                      ? "rounded-lg border-2 border-primary bg-primary/10 px-2 py-2 text-xs font-semibold"
                      : "rounded-lg border border-border px-2 py-2 text-xs hover:bg-secondary"
                  }
                >
                  {label}
                </button>
              ))}
            </div>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Feedback for the student and parent — what was good, what to fix…"
              rows={4}
              aria-label="Feedback"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReview} disabled={busy} className="gap-1.5">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Save review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Parent share card — WhatsApp share of today's lesson
export function ShareWhatsAppButton({
  studentName,
  lesson,
}: {
  studentName: string;
  lesson: LessonLite;
}) {
  const rangeLabel =
    lesson.type === "QURAN" && lesson.startAyah
      ? formatRange(lesson.startAyah, lesson.endAyah!)
      : (lesson.contentRef ?? "lesson");
  const text = encodeURIComponent(
    `📚 ${studentName}'s Qur'an lesson today: ${rangeLabel}${
      lesson.feedback ? `\nTeacher's feedback: ${lesson.feedback}` : ""
    }\n— shared from Madrasah Irshad-e-Madina`
  );
  return (
    <Button variant="outline" size="sm" className="gap-1.5" asChild>
      <a
        href={`https://wa.me/?text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" aria-hidden />
        Share
      </a>
    </Button>
  );
}
