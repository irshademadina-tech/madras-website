"use client";

// Admin console — enrollments pipeline, students, teachers, content library, payments, audit.

import { useCallback, useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  Plus,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionTitle, StatusBadge } from "@/components/portal/shell";
import { useToast } from "@/hooks/use-toast";
import { formatRange } from "@/lib/quran";

interface EnrollmentRow {
  id: string;
  studentName: string;
  studentAge: number | null;
  level: string;
  parentName: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  timezone: string;
  country: string;
  program: string;
  preferredTeacherGender: string | null;
  message: string | null;
  trialAt: string | null;
  trialStatus: string;
  trialMeetingUrl: string | null;
  status: string;
  planSummary: string | null;
  createdAt: string;
  student: { id: string; name: string } | null;
}

interface TeacherRow {
  id: string;
  name: string;
  email: string;
  title: string | null;
  gender: string;
  published: boolean;
  active: boolean;
  studentCount: number;
}

interface StudentRow {
  id: string;
  name: string;
  age: number | null;
  level: string;
  status: string;
  timezone: string;
  teacherId: string | null;
  parent: { name: string; email: string } | null;
  lessonCount: number;
}

interface InvoiceRow {
  id: string;
  number: string;
  amountCents: number;
  currency: string;
  period: string | null;
  status: string;
  method: string | null;
  createdAt: string;
  paidAt: string | null;
}

interface ContentRow {
  id: string;
  category: string;
  title: string;
  arabic: string | null;
  transliteration: string | null;
  translation: string | null;
  notes: string | null;
  order: number;
  published: boolean;
}

interface AuditRow {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  detail: string | null;
  createdAt: string;
  user: { name: string; email: string; role: string } | null;
}

export function AdminView({ activeTab }: { activeTab: string }) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => (window.location.hash = v)}>
      <TabsList className="mb-4 flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        <TabsTrigger value="students">Students</TabsTrigger>
        <TabsTrigger value="teachers">Teachers</TabsTrigger>
        <TabsTrigger value="content">Content Library</TabsTrigger>
        <TabsTrigger value="invoices">Payments</TabsTrigger>
        <TabsTrigger value="audit">Audit Log</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <AdminOverview />
      </TabsContent>
      <TabsContent value="enrollments">
        <EnrollmentsTab />
      </TabsContent>
      <TabsContent value="students">
        <StudentsTab />
      </TabsContent>
      <TabsContent value="teachers">
        <TeachersTab />
      </TabsContent>
      <TabsContent value="content">
        <ContentTab />
      </TabsContent>
      <TabsContent value="invoices">
        <PaymentsTab />
      </TabsContent>
      <TabsContent value="audit">
        <AuditTab />
      </TabsContent>
    </Tabs>
  );
}

function AdminOverview() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/students").then((r) => r.json()),
      fetch("/api/admin/enrollments").then((r) => r.json()),
      fetch("/api/admin/invoices").then((r) => r.json()),
    ])
      .then(([s, e, i]) => {
        setStudents(s.students ?? []);
        setEnrollments(e.enrollments ?? []);
        setInvoices(i.invoices ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );

  const paid = invoices.filter((i) => i.status === "PAID");
  const pending = invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE");
  const pipeline = enrollments.filter((e) => !["ENROLLED", "REJECTED", "WITHDRAWN"].includes(e.status));

  const stats = [
    { label: "Active students", value: students.filter((s) => s.status === "ACTIVE").length, icon: Users },
    { label: "Enrollment pipeline", value: pipeline.length, icon: GraduationCap },
    { label: "Paid invoices", value: paid.length, icon: BadgeCheck },
    { label: "Pending payments", value: pending.length, icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Trial lessons needing action</CardTitle>
          <CardDescription>Requested or scheduled trials in the pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-72">
            <div className="space-y-2">
              {pipeline
                .filter((e) => ["REQUESTED", "SCHEDULED"].includes(e.trialStatus))
                .map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {e.studentName} ({e.parentName})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e.country} · {e.timezone.replace("_", " ")}
                        {e.trialAt &&
                          ` · trial: ${new Date(e.trialAt).toLocaleString("en-GB", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`}
                      </p>
                    </div>
                    <StatusBadge status={e.trialStatus} />
                  </div>
                ))}
              {pipeline.filter((e) => ["REQUESTED", "SCHEDULED"].includes(e.trialStatus)).length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No pending trials.
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function EnrollmentsTab() {
  const { toast } = useToast();
  const [rows, setRows] = useState<EnrollmentRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState<EnrollmentRow | null>(null);
  const [enrolling, setEnrolling] = useState<EnrollmentRow | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/enrollments")
      .then((r) => r.json())
      .then((d) => {
        setRows(d.enrollments ?? []);
        setTeachers(d.teachers ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function act(id: string, action: string, extra: Record<string, unknown> = {}) {
    const res = await fetch("/api/admin/enrollments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, ...extra }),
    });
    const d = await res.json();
    if (res.ok) {
      toast({ title: "Done", description: action.replace("_", " ").toLowerCase() });
      load();
    } else {
      toast({ title: "Failed", description: d.error ?? "error", variant: "destructive" });
    }
    return res.ok;
  }

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-3">
      {rows.map((e) => (
        <Card key={e.id}>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">
                    {e.studentName}
                    {e.studentAge ? ` (${e.studentAge})` : ""}
                  </p>
                  <StatusBadge status={e.status} />
                  <StatusBadge status={e.trialStatus} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Parent: {e.parentName} · {e.email} · {e.country} ({e.timezone.replace("_", " ")})
                </p>
                <p className="text-xs text-muted-foreground">
                  Program: {e.program} · Level: {e.level} · Teacher pref: {e.preferredTeacherGender ?? "any"}
                  {e.trialAt &&
                    ` · Trial: ${new Date(e.trialAt).toLocaleString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })} (${e.timezone})`}
                </p>
                {e.message && (
                  <p className="mt-2 rounded-lg bg-secondary/60 p-2 text-sm italic">
                    “{e.message}”
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {e.trialStatus === "REQUESTED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() =>
                      act(e.id, "SCHEDULE_TRIAL", {
                        trialAt: e.trialAt ?? new Date(Date.now() + 2 * 24 * 3600e3).toISOString(),
                        trialMeetingUrl: "https://meet.google.com/demo-irshad",
                      })
                    }
                  >
                    <Clock className="h-4 w-4" aria-hidden /> Schedule trial
                  </Button>
                )}
                {e.trialStatus === "SCHEDULED" && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => act(e.id, "COMPLETE_TRIAL")}>
                    <CheckCircle2 className="h-4 w-4" aria-hidden /> Trial done
                  </Button>
                )}
                {e.trialStatus === "COMPLETED" && e.status !== "PLAN_SENT" && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAssessing(e)}>
                    <FileText className="h-4 w-4" aria-hidden /> Write assessment
                  </Button>
                )}
                {["NEW", "ASSESSMENT", "PLAN_SENT"].includes(e.status) && !e.student && (
                  <Button size="sm" className="gap-1.5" onClick={() => setEnrolling(e)}>
                    <GraduationCap className="h-4 w-4" aria-hidden /> Enroll
                  </Button>
                )}
                {e.student && (
                  <span className="self-center text-xs text-muted-foreground">
                    → student: {e.student.name}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {rows.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No enrollments yet.
          </CardContent>
        </Card>
      )}

      {assessing && (
        <AssessmentDialog
          enrollment={assessing}
          teachers={teachers}
          onClose={() => setAssessing(null)}
          onSaved={load}
        />
      )}
      {enrolling && (
        <EnrollDialog
          enrollment={enrolling}
          teachers={teachers}
          onClose={() => setEnrolling(null)}
          onSaved={load}
        />
      )}
    </div>
  );
}

function AssessmentDialog({
  enrollment,
  teachers,
  onClose,
  onSaved,
}: {
  enrollment: EnrollmentRow;
  teachers: TeacherRow[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    strengths: "",
    weaknesses: "",
    startingPoint: "",
    plan: "",
    recommendation: "",
    teacherId: teachers.find((t) => t.gender === (enrollment.preferredTeacherGender === "female" ? "female" : "male"))?.id ?? teachers[0]?.id ?? "",
  });

  async function save() {
    setBusy(true);
    const ok = await (async () => {
      const res = await fetch("/api/admin/enrollments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: enrollment.id, action: "SAVE_ASSESSMENT", assessment: f }),
      });
      return res.ok;
    })();
    setBusy(false);
    if (ok) {
      toast({ title: "Assessment saved", description: "Learning plan recorded" });
      onSaved();
      onClose();
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assessment &amp; learning plan — {enrollment.studentName}</DialogTitle>
          <DialogDescription>
            The written summary parents receive after the trial. This becomes the learning plan.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-3">
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Strengths</Label>
                <Textarea
                  rows={2}
                  value={f.strengths}
                  onChange={(e) => setF({ ...f, strengths: e.target.value })}
                  placeholder="e.g. Confident with harakaat…"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Needs work</Label>
                <Textarea
                  rows={2}
                  value={f.weaknesses}
                  onChange={(e) => setF({ ...f, weaknesses: e.target.value })}
                  placeholder="e.g. Madd lengths, duas not memorised…"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Starting point</Label>
              <Input
                value={f.startingPoint}
                onChange={(e) => setF({ ...f, startingPoint: e.target.value })}
                placeholder="e.g. Qaida lesson 12, page 15"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Learning plan (sent to parent)</Label>
              <Textarea
                rows={4}
                value={f.plan}
                onChange={(e) => setF({ ...f, plan: e.target.value })}
                placeholder="e.g. 3 lessons/week Nazra from 2:21, one Islamic lesson/week (Kalimas then Namaz). Daily revision follows the 1-3-7-14 day cycle."
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Recommendation</Label>
                <Input
                  value={f.recommendation}
                  onChange={(e) => setF({ ...f, recommendation: e.target.value })}
                  placeholder="e.g. Nazra 3x/week + Islamic studies"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Match teacher</Label>
                <Select value={f.teacherId} onValueChange={(v) => setF({ ...f, teacherId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} {t.title ? `(${t.title})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy} className="gap-1.5">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Save assessment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EnrollDialog({
  enrollment,
  teachers,
  onClose,
  onSaved,
}: {
  enrollment: EnrollmentRow;
  teachers: TeacherRow[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    name: enrollment.studentName,
    age: enrollment.studentAge ?? undefined,
    level: enrollment.level,
    teacherId: teachers.find((t) => t.gender === (enrollment.preferredTeacherGender === "female" ? "female" : "male"))?.id ?? teachers[0]?.id ?? "",
  });

  async function enroll() {
    setBusy(true);
    const res = await fetch("/api/admin/enrollments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: enrollment.id,
        action: "ENROLL",
        student: { name: f.name, age: f.age, level: f.level, teacherId: f.teacherId || undefined },
      }),
    });
    setBusy(false);
    if (res.ok) {
      toast({
        title: "Enrolled",
        description: `${f.name} enrolled. Parent login created (${enrollment.email}) — password shared via WhatsApp.`,
      });
      onSaved();
      onClose();
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll {enrollment.studentName}</DialogTitle>
          <DialogDescription>
            Creates the student profile and a parent portal login for {enrollment.email}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Student name</Label>
            <Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Age</Label>
              <Input
                type="number"
                value={f.age ?? ""}
                onChange={(e) => setF({ ...f, age: e.target.value ? Number(e.target.value) : undefined })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Level</Label>
              <Select value={f.level} onValueChange={(v) => setF({ ...f, level: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["BEGINNER", "QAIDA", "NAZRA", "TAJWEED", "HIFZ"].map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Teacher</Label>
            <Select value={f.teacherId} onValueChange={(v) => setF({ ...f, teacherId: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Assign teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} {t.title ? `(${t.title})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={enroll} disabled={busy || !f.name} className="gap-1.5">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Enroll student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StudentsTab() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((d) => {
        setStudents(d.students ?? []);
        setTeachers(d.teachers ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function update(id: string, data: Record<string, unknown>) {
    await fetch("/api/admin/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    load();
  }

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-2">
      {students.map((s) => (
        <Card key={s.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{s.name}</p>
                <StatusBadge status={s.status} />
                <Badge variant="secondary">{s.level}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {s.age ? `${s.age}y · ` : ""}
                {s.lessonCount} lessons · parent: {s.parent?.name ?? "—"} ({s.parent?.email ?? "—"})
                {s.teacherId ? "" : " · no teacher"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={s.teacherId ?? "none"}
                onValueChange={(v) => update(s.id, { teacherId: v === "none" ? null : v })}
              >
                <SelectTrigger className="h-9 w-52" aria-label={`Teacher for ${s.name}`}>
                  <SelectValue placeholder="Assign teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No teacher</SelectItem>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={s.status} onValueChange={(v) => update(s.id, { status: v })}>
                <SelectTrigger className="h-9 w-36" aria-label={`Status for ${s.name}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["ACTIVE", "PAUSED", "TRIAL", "WITHDRAWN"].map((st) => (
                    <SelectItem key={st} value={st}>
                      {st}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
      {students.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No students yet. Enroll families from the Enrollments tab.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TeachersTab() {
  const [teachers, setTeachers] = useState<TeacherRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/teachers")
      .then((r) => r.json())
      .then((d) => setTeachers(d.teachers ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function update(id: string, data: Record<string, unknown>) {
    await fetch("/api/admin/teachers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...data }),
    });
    load();
  }

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-2">
      {teachers.map((t) => (
        <Card key={t.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">
                {t.name} {t.title ? `· ${t.title}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.email} · {t.studentCount} students
              </p>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={t.published}
                  onCheckedChange={(v) => update(t.id, { published: v })}
                  aria-label={`Publish ${t.name}`}
                />
                Published
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Switch
                  checked={t.active}
                  onCheckedChange={(v) => update(t.id, { active: v })}
                  aria-label={`Active ${t.name}`}
                />
                Active
              </label>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ContentTab() {
  const { toast } = useToast();
  const [items, setItems] = useState<ContentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ContentRow | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function remove(id: string) {
    await fetch(`/api/admin/content?id=${id}`, { method: "DELETE" });
    toast({ title: "Deleted" });
    load();
  }

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-3">
      <SectionTitle
        title="Content library"
        subtitle="Qaida steps, Kalimas, Duas, Namaz, Surahs — used by teachers when assigning Islamic lessons."
        action={
          <Button size="sm" className="gap-1.5" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" aria-hidden /> Add item
          </Button>
        }
      />
      {["KALIMA", "DUA", "NAMAZ", "QAIDA", "SURAH", "ADAB", "OTHER"].map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        if (catItems.length === 0) return null;
        return (
          <Card key={cat}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">
                {cat === "NAMAZ" ? "Namaz" : cat === "DUA" ? "Duas" : cat}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {catItems.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{i.title}</p>
                    {i.arabic && (
                      <p dir="rtl" lang="ar" className="truncate font-arabic text-lg text-foreground/80">
                        {i.arabic}
                      </p>
                    )}
                    {i.translation && (
                      <p className="truncate text-xs text-muted-foreground">{i.translation}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(i)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(i.id)}
                      aria-label={`Delete ${i.title}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      {(creating || editing) && (
        <ContentDialog
          item={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={load}
        />
      )}
    </div>
  );
}

function ContentDialog({
  item,
  onClose,
  onSaved,
}: {
  item: ContentRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    category: item?.category ?? "DUA",
    title: item?.title ?? "",
    arabic: item?.arabic ?? "",
    transliteration: item?.transliteration ?? "",
    translation: item?.translation ?? "",
    notes: item?.notes ?? "",
    order: item?.order ?? 0,
    published: item?.published ?? true,
  });

  async function save() {
    setBusy(true);
    const res = await fetch("/api/admin/content", {
      method: item ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item ? { id: item.id, ...f } : f),
    });
    setBusy(false);
    if (res.ok) {
      toast({ title: item ? "Updated" : "Created" });
      onSaved();
      onClose();
    }
  }

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Edit content item" : "New content item"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["QAIDA", "NAMAZ", "KALIMA", "DUA", "SURAH", "ADAB", "OTHER"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Order</Label>
              <Input
                type="number"
                value={f.order}
                onChange={(e) => setF({ ...f, order: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Arabic</Label>
            <Textarea
              dir="rtl"
              lang="ar"
              className="font-arabic text-lg"
              rows={2}
              value={f.arabic}
              onChange={(e) => setF({ ...f, arabic: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Transliteration</Label>
            <Input
              value={f.transliteration}
              onChange={(e) => setF({ ...f, transliteration: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Translation</Label>
            <Textarea
              rows={2}
              value={f.translation}
              onChange={(e) => setF({ ...f, translation: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Teaching notes</Label>
            <Textarea
              rows={2}
              value={f.notes}
              onChange={(e) => setF({ ...f, notes: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={f.published}
              onChange={(e) => setF({ ...f, published: e.target.checked })}
              className="h-4 w-4"
            />
            Published (visible to teachers)
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={busy || !f.title} className="gap-1.5">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {item ? "Save" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PaymentsTab() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newInv, setNewInv] = useState({ number: "", amount: "", period: "" });

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/invoices")
      .then((r) => r.json())
      .then((d) => setInvoices(d.invoices ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { const t = setTimeout(load, 0); return () => clearTimeout(t); }, [load]);

  async function act(id: string, action: string) {
    await fetch("/api/admin/invoices", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, method: action === "MARK_PAID" ? "manual" : undefined }),
    });
    toast({ title: "Updated" });
    load();
  }

  async function create() {
    const res = await fetch("/api/admin/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        number: newInv.number,
        amountCents: Math.round(Number(newInv.amount) * 100),
        period: newInv.period || undefined,
      }),
    });
    if (res.ok) {
      toast({ title: "Invoice created" });
      setCreating(false);
      setNewInv({ number: "", amount: "", period: "" });
      load();
    }
  }

  if (loading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-3">
      <SectionTitle
        title="Payments"
        subtitle="Manual methods are admin-approved — never auto-marked as paid. Card payments run on hosted checkout only."
        action={
          <Button size="sm" className="gap-1.5" onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" aria-hidden /> New invoice
          </Button>
        }
      />
      {invoices.map((i) => (
        <Card key={i.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">
                {i.number} · {(i.amountCents / 100).toFixed(2)} {i.currency}
              </p>
              <p className="text-xs text-muted-foreground">
                {i.period ?? "—"} · created{" "}
                {new Date(i.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                {i.paidAt &&
                  ` · paid ${new Date(i.paidAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}`}
                {i.method ? ` · ${i.method}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={i.status} />
              {i.status !== "PAID" && (
                <Button size="sm" variant="outline" onClick={() => act(i.id, "MARK_PAID")}>
                  Mark paid
                </Button>
              )}
              {i.status === "PAID" && (
                <Button size="sm" variant="outline" onClick={() => act(i.id, "REFUND")}>
                  Refund
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      {invoices.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No invoices yet.
          </CardContent>
        </Card>
      )}

      {creating && (
        <Dialog open onOpenChange={(v) => !v && setCreating(false)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>New invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Number</Label>
                <Input
                  value={newInv.number}
                  onChange={(e) => setNewInv({ ...newInv, number: e.target.value })}
                  placeholder="INV-2026-003"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Amount (GBP)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newInv.amount}
                  onChange={(e) => setNewInv({ ...newInv, amount: e.target.value })}
                  placeholder="40.00"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Period</Label>
                <Input
                  value={newInv.period}
                  onChange={(e) => setNewInv({ ...newInv, period: e.target.value })}
                  placeholder="Monthly — 5 lessons/week"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreating(false)}>
                Cancel
              </Button>
              <Button onClick={create} disabled={!newInv.number || !newInv.amount}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AuditTab() {
  const [logs, setLogs] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit")
      .then((r) => r.json())
      .then((d) => setLogs(d.logs ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-64" />;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Audit log</CardTitle>
        <CardDescription>Key actions: lessons, reviews, enrollments, payments, content</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-1.5">
            {logs.map((l) => (
              <div
                key={l.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-2.5 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {l.action}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {l.user?.name ?? "system"} · {l.entity}
                    {l.detail ? ` · ${l.detail.slice(0, 80)}` : ""}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(l.createdAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No audit entries.</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
