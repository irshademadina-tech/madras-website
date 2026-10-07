"use client";

// The Portal — role-aware application.
// TEACHER: live lessons, my students, revision queue.
// PARENT: children progress + invoices. ADMIN: full management.
// There is no student portal any more — pupils join the teacher's live link.

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CalendarClock, Check, Copy, Loader2, Plus, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PortalShell,
  SectionTitle,
  StatusBadge,
  RefreshButton,
} from "@/components/portal/shell";
import { LessonCard } from "@/components/portal/lesson-card";
import { AssignLessonDialog } from "@/components/portal/assign-lesson";
import type { OverviewData, Revision, StudentOverview } from "@/lib/portal-types";
import { Providers } from "@/components/providers";
import { formatRange } from "@/lib/quran";

export default function PortalPage() {
  return (
    <Providers>
      <PortalInner />
    </Providers>
  );
}

function PortalInner() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<OverviewData | null>(null);
  const [revisions, setRevisions] = useState<{ due: Revision[]; upcoming: Revision[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignFor, setAssignFor] = useState<StudentOverview | null>(null);
  const [hash, setHash] = useState("");

  const role = session?.user?.role as string | undefined;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, r] = await Promise.all([
        fetch("/api/portal/overview").then((x) => x.json()),
        fetch("/api/portal/revisions").then((x) => x.json()),
      ]);
      setData(o);
      setRevisions({ due: r.due ?? [], upcoming: r.upcoming ?? [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") load();
  }, [status, load]);

  useEffect(() => {
    const onHash = () => setHash(window.location.hash.replace("#", ""));
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const activeTab =
    hash ||
    (role === "TEACHER"
      ? "live"
      : role === "PARENT"
        ? "children"
        : role === "ADMIN"
          ? "overview"
          : "today");

  if (status === "loading" || (loading && !data)) {
    return (
      <PortalShell active="">
        <div className="space-y-4">
          <Skeleton className="h-8 w-56" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </PortalShell>
    );
  }

  if (!role) {
    return (
      <PortalShell active="">
        <p className="text-center text-sm text-muted-foreground">Not authorized.</p>
      </PortalShell>
    );
  }

  return (
    <PortalShell active={activeTab}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold">
            {role === "TEACHER"
              ? "Teacher Portal"
              : role === "PARENT"
                ? "Parent Portal"
                : "Administration"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {role === "TEACHER" &&
              (data?.students.length ?? 0) + " students · " + (revisions?.due.length ?? 0) + " revisions due"}
            {role === "PARENT" && "Your children's learning, at a glance"}
            {role === "ADMIN" && "Madrasah operations"}
          </p>
        </div>
        <RefreshButton onClick={load} />
      </div>

      {/* ============ TEACHER VIEW ============ */}
      {role === "TEACHER" && (
        <Tabs value={activeTab} onValueChange={(v) => (window.location.hash = v)}>
          <TabsList className="mb-4">
            <TabsTrigger value="live">Live Lessons</TabsTrigger>
            <TabsTrigger value="students">My Students</TabsTrigger>
            <TabsTrigger value="revisions">Revision Queue</TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="space-y-6">
            <LiveLessonsView />
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {(data?.students ?? []).length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No students assigned yet. The admin will match students to you after their
                  assessments.
                </CardContent>
              </Card>
            )}
            {(data?.students ?? []).map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-lg">{s.name}</CardTitle>
                      <CardDescription>
                        {s.level} · {s.age ? `${s.age} years · ` : ""}
                        {s.timezone.replace("_", " ")} · {s.lessons.length} lessons
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setAssignFor(s)}
                    >
                      <Plus className="h-4 w-4" aria-hidden /> Assign lesson
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {s.lessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No lessons yet. Assign the first lesson — the reader will suggest
                      starting from Al-Fatiha.
                    </p>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {s.lessons.slice(0, 6).map((l) => (
                        <LessonCard
                          key={l.id}
                          lesson={l}
                          studentName={s.name}
                          onChanged={load}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="revisions">
            <SectionTitle
              title="Revision Queue"
              subtitle="Spaced repetition: 1 · 3 · 7 · 14 days after passing. Mark done after hearing the revision."
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarClock className="h-4 w-4 text-primary" aria-hidden /> Due now
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-2">
                      {(revisions?.due ?? []).map((r) => (
                        <RevisionRow key={r.id} rev={r} onDone={load} />
                      ))}
                      {(revisions?.due ?? []).length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          Nothing due right now.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Upcoming</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="max-h-96">
                    <div className="space-y-2">
                      {(revisions?.upcoming ?? []).map((r) => (
                        <RevisionRow key={r.id} rev={r} onDone={load} future />
                      ))}
                      {(revisions?.upcoming ?? []).length === 0 && (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          No upcoming revisions.
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* ============ PARENT VIEW ============ */}
      {role === "PARENT" && (
        <Tabs value={activeTab} onValueChange={(v) => (window.location.hash = v)}>
          <TabsList className="mb-4">
            <TabsTrigger value="children">My Children</TabsTrigger>
            <TabsTrigger value="invoices">Invoices &amp; Receipts</TabsTrigger>
          </TabsList>

          <TabsContent value="children" className="space-y-6">
            {(data?.students ?? []).map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    {s.name}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      · {s.level} · teacher: {s.teacher?.name ?? "to be assigned"}
                    </span>
                  </CardTitle>
                  <CardDescription>
                    {s.lessons.filter((l) => ["PASSED", "MASTERED"].includes(l.status)).length}{" "}
                    of {s.lessons.length} lessons passed
                  </CardDescription>
                  <Progress
                    className="mt-2 h-2"
                    value={
                      s.lessons.length === 0
                        ? 0
                        : (s.lessons.filter((l) => ["PASSED", "MASTERED"].includes(l.status)).length /
                            s.lessons.length) *
                          100
                    }
                    aria-label={`${s.name} progress`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2">
                    {s.lessons.slice(0, 6).map((l) => (
                      <LessonCard key={l.id} lesson={l} studentName={s.name} onChanged={load} />
                    ))}
                  </div>
                  {s.progressUpdates.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-semibold">Recent updates</p>
                      <div className="space-y-2">
                        {s.progressUpdates.slice(0, 3).map((p) => (
                          <div
                            key={p.id}
                            className="rounded-lg border border-border bg-secondary/40 p-3 text-sm"
                          >
                            <p>{p.summary}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {new Date(p.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "long",
                              })}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="invoices">
            <ParentInvoices />
          </TabsContent>
        </Tabs>
      )}

      {/* ============ ADMIN VIEW ============ */}
      {role === "ADMIN" && <AdminView activeTab={activeTab} />}

      {/* Assign dialog */}
      {assignFor && (
        <AssignLessonDialog
          student={assignFor}
          open={!!assignFor}
          onOpenChange={(v) => !v && setAssignFor(null)}
          onAssigned={load}
        />
      )}
    </PortalShell>
  );
}

function RevisionRow({ rev, onDone, future }: { rev: Revision; onDone: () => void; future?: boolean }) {
  const [busy, setBusy] = useState(false);
  const label = rev.lesson
    ? rev.lesson.title ?? (rev.lesson.startAyah ? formatRange(rev.lesson.startAyah, rev.lesson.endAyah!) : rev.lesson.contentRef)
    : "Lesson";
  const stageLabel = ["1 day", "3 days", "7 days", "14 days"][rev.stage] ?? "";

  async function done() {
    setBusy(true);
    await fetch("/api/portal/revisions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ revisionId: rev.id, action: "DONE" }),
    });
    setBusy(false);
    onDone();
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">
          revision stage: {stageLabel} ·{" "}
          {new Date(rev.dueAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
        </p>
      </div>
      {!future && (
        <Button size="sm" variant="outline" onClick={done} disabled={busy}>
          {busy ? "…" : "Done"}
        </Button>
      )}
    </div>
  );
}

// Parent invoices
function ParentInvoices() {
  const [invoices, setInvoices] = useState<
    { id: string; number: string; amountCents: number; currency: string; period: string | null; status: string; paidAt: string | null; createdAt: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-40" />;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Invoices &amp; receipts</CardTitle>
        <CardDescription>
          Card payments are taken on a hosted checkout — we never see your card details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No invoices yet. Your first invoice arrives after the trial month begins.
          </p>
        ) : (
          <div className="space-y-2">
            {invoices.map((i) => (
              <div
                key={i.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm"
              >
                <div>
                  <p className="font-medium">{i.number}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.period} ·{" "}
                    {new Date(i.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">
                    £{(i.amountCents / 100).toFixed(2)}
                  </span>
                  <StatusBadge status={i.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- Live lessons (teacher) ----------
interface LiveSessionLite {
  id: string;
  token: string;
  title: string;
  startAyah: number | null;
  endAyah: number | null;
  active: boolean;
  highlights: number;
  updatedAt: string;
}

function LiveLessonsView() {
  const [sessions, setSessions] = useState<LiveSessionLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetch("/api/live").then((r) => r.json());
      setSessions(d.sessions ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function createFor(
    studentId: string,
    lesson?: { id: string; start: number; end: number; name: string }
  ) {
    setCreating(studentId);
    const res = await fetch("/api/live", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId: lesson?.id,
        title: lesson ? `Live lesson — ${lesson.name}` : "Live Qur'an Lesson",
        startAyah: lesson?.start,
        endAyah: lesson?.end,
      }),
    });
    setCreating(null);
    if (res.ok) {
      const d = await res.json();
      await load();
      // open the room so the teacher can start presenting immediately
      window.open(`/live/${d.session.token}`, "_blank");
    }
  }

  async function copyLink(s: LiveSessionLite) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/live/${s.token}`);
      setCopiedId(s.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <SectionTitle
        title="Live Interactive Lessons"
        subtitle="Start a live room and share its link with your student — no login needed for them. Both of you highlight words together, and your scrolling mirrors to their screen."
      />

      {loading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Radio className="h-4 w-4 text-primary" aria-hidden /> Go live with a student
              </CardTitle>
              <CardDescription>
                The room opens at the student&apos;s current Quran lesson range.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {(data?.students ?? []).length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No students assigned yet.
                </p>
              )}
              {(data?.students ?? []).map((s) => {
                const quranLessons = s.lessons.filter(
                  (l) => l.type === "QURAN" && l.startAyah && l.endAyah
                );
                const current =
                  quranLessons.find((l) =>
                    ["ASSIGNED", "PRACTICING", "READY_FOR_REVIEW", "NEEDS_IMPROVEMENT"].includes(l.status)
                  ) ?? quranLessons[0];
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {current
                          ? `Current: ${formatRange(current.startAyah!, current.endAyah!)}`
                          : "No Quran lesson yet — opens at Al-Fatiha"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="shrink-0 gap-1.5"
                      disabled={creating !== null}
                      onClick={() =>
                        createFor(
                          s.id,
                          current
                            ? {
                                id: current.id,
                                start: current.startAyah!,
                                end: current.endAyah!,
                                name: s.name,
                              }
                            : undefined
                        )
                      }
                    >
                      {creating === s.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : (
                        <Radio className="h-4 w-4" aria-hidden />
                      )}
                      Go live
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Your live rooms</CardTitle>
              <CardDescription>
                Send the link over WhatsApp or Zoom chat — one tap and the student is with you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No live rooms yet. Start one on the left.
                </p>
              ) : (
                <ScrollArea className="max-h-[26rem]">
                  <div className="space-y-2 pe-2">
                    {sessions.map((s) => (
                      <div
                        key={s.id}
                        className="rounded-lg border border-border p-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-medium">{s.title}</p>
                          <span
                            className={
                              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold " +
                              (s.active
                                ? "bg-emerald-600/10 text-emerald-700"
                                : "bg-neutral-500/10 text-neutral-600")
                            }
                          >
                            {s.active ? "LIVE" : "ENDED"}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {s.startAyah && s.endAyah
                            ? formatRange(s.startAyah, s.endAyah)
                            : "Full mushaf"}{" "}
                          · {s.highlights} highlights ·{" "}
                          {new Date(s.updatedAt).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => copyLink(s)}>
                            {copiedId === s.id ? (
                              <Check className="h-4 w-4 text-primary" aria-hidden />
                            ) : (
                              <Copy className="h-4 w-4" aria-hidden />
                            )}
                            {copiedId === s.id ? "Copied" : "Copy link"}
                          </Button>
                          <Button size="sm" asChild>
                            <a href={`/live/${s.token}`} target="_blank" rel="noreferrer">
                              Open room
                            </a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Admin placeholder — full admin components loaded in admin-view.tsx
import { AdminView } from "@/components/portal/admin-view";
