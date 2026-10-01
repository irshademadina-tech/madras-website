"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, CheckCircle2, Clock, Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const TIMEZONES = [
  "Europe/London",
  "Europe/Dublin",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Vancouver",
  "Asia/Karachi",
  "Europe/Berlin",
  "Europe/Paris",
  "Australia/Sydney",
];

const LEVELS = [
  { value: "BEGINNER", label: "Complete beginner" },
  { value: "QAIDA", label: "Learning Qaida" },
  { value: "NAZRA", label: "Reads Nazra (fluent reading)" },
  { value: "TAJWEED", label: "Knows some Tajweed" },
  { value: "HIFZ", label: "Doing Hifz" },
];

const PROGRAMS = [
  { value: "QAIDA", label: "Noorani Qaida" },
  { value: "NAZRA", label: "Nazra (Qur'an reading)" },
  { value: "TAJWEED", label: "Tajweed" },
  { value: "ISLAMIC_STUDIES", label: "Daily Islamic learning" },
  { value: "HIFZ", label: "Hifz (memorization)" },
  { value: "NOT_SURE", label: "Not sure — assess first" },
];

function nextDays(count: number): string[] {
  const days: string[] = [];
  const d = new Date();
  for (let i = 1; days.length < count; i++) {
    const cand = new Date(d.getTime() + i * 24 * 3600 * 1000);
    // skip nothing; families choose any day
    days.push(cand.toISOString().slice(0, 10));
  }
  return days;
}

function formatDateLabel(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function BookAssessmentPage() {
  const [step, setStep] = useState(1);
  const [timezone, setTimezone] = useState("Europe/London");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    parentName: "",
    email: "",
    phone: "",
    whatsapp: "",
    studentName: "",
    studentAge: "",
    level: "BEGINNER",
    program: "NOT_SURE",
    preferredTeacherGender: "any",
    country: "UK",
    trialDate: "",
    trialTime: "17:00",
    message: "",
  });

  useEffect(() => {
    try {
      const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tz = Intl.supportedValuesOf("timeZone").includes(detectedTz)
        ? detectedTz
        : "Europe/London";
      const country = tz.startsWith("America/")
        ? tz.includes("Toronto") || tz.includes("Vancouver") || tz.includes("Edmonton") || tz.includes("Winnipeg")
          ? "Canada"
          : "USA"
        : "UK";
      // defer state updates to avoid cascading renders in the effect body
      const t = setTimeout(() => {
        setTimezone(tz);
        setForm((f) => ({ ...f, country }));
      }, 0);
      return () => clearTimeout(t);
    } catch {
      /* keep defaults */
    }
  }, []);

  const days = nextDays(14);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          studentAge: form.studentAge ? Number(form.studentAge) : undefined,
          timezone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed. Please try again.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }

  const canStep1 =
    form.parentName.trim().length > 1 &&
    /.+@.+\..+/.test(form.email) &&
    form.studentName.trim().length > 1;

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      <header className="border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BookOpen className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-serif text-sm font-bold">Madrasah Irshad-e-Madina</span>
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10">
        {done ? (
          <Card className="w-full max-w-lg text-center">
            <CardContent className="pt-8">
              <CheckCircle2 className="mx-auto h-14 w-14 text-primary" aria-hidden />
              <h1 className="mt-4 font-serif text-2xl font-bold">Assessment requested</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Thank you, {form.parentName.split(" ")[0]}. We&apos;ve received your request for{" "}
                <strong>{form.studentName}</strong>&apos;s free trial lesson on{" "}
                <strong>
                  {form.trialDate ? formatDateLabel(form.trialDate) : "your chosen day"} at{" "}
                  {form.trialTime}
                </strong>{" "}
                ({timezone}).
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                A teacher will confirm the exact time by WhatsApp or email within one working day,
                and you&apos;ll receive the meeting link before the lesson.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Button asChild>
                  <Link href="/quran">Explore the Qur&apos;an Reader</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/">Back to home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full max-w-2xl">
            <div className="mb-6 text-center">
              <h1 className="font-serif text-2xl font-bold sm:text-3xl">Book a Free Assessment</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                A friendly 20-minute trial lesson. No payment details needed.
              </p>
            </div>

            {/* Step indicator */}
            <div className="mb-6 flex items-center justify-center gap-3" aria-label="Progress">
              <Badge variant={step >= 1 ? "default" : "outline"}>1 · About you</Badge>
              <div className="h-px w-8 bg-border" />
              <Badge variant={step >= 2 ? "default" : "outline"}>2 · Pick a time</Badge>
            </div>

            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {step === 1 && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="parentName">Your name (parent/guardian) *</Label>
                          <Input
                            id="parentName"
                            required
                            value={form.parentName}
                            onChange={(e) => set("parentName", e.target.value)}
                            placeholder="e.g. Fatima Khan"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => set("email", e.target.value)}
                            placeholder="you@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone (optional)</Label>
                          <Input
                            id="phone"
                            value={form.phone}
                            onChange={(e) => set("phone", e.target.value)}
                            placeholder="+44 7700 900000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="whatsapp">WhatsApp (optional)</Label>
                          <Input
                            id="whatsapp"
                            value={form.whatsapp}
                            onChange={(e) => set("whatsapp", e.target.value)}
                            placeholder="+44 7700 900000"
                          />
                        </div>
                      </div>

                      <div className="pattern-divider" />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="studentName">Student&apos;s first name *</Label>
                          <Input
                            id="studentName"
                            required
                            value={form.studentName}
                            onChange={(e) => set("studentName", e.target.value)}
                            placeholder="e.g. Ayesha"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="studentAge">Student&apos;s age</Label>
                          <Input
                            id="studentAge"
                            type="number"
                            min={4}
                            max={80}
                            value={form.studentAge}
                            onChange={(e) => set("studentAge", e.target.value)}
                            placeholder="e.g. 9"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Current level</Label>
                          <Select value={form.level} onValueChange={(v) => set("level", v)}>
                            <SelectTrigger aria-label="Current level">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LEVELS.map((l) => (
                                <SelectItem key={l.value} value={l.value}>
                                  {l.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Program of interest</Label>
                          <Select value={form.program} onValueChange={(v) => set("program", v)}>
                            <SelectTrigger aria-label="Program">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {PROGRAMS.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                  {p.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Teacher preference</Label>
                        <Select
                          value={form.preferredTeacherGender}
                          onValueChange={(v) => set("preferredTeacherGender", v)}
                        >
                          <SelectTrigger aria-label="Teacher preference">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">No preference</SelectItem>
                            <SelectItem value="female">Female teacher (recommended for girls)</SelectItem>
                            <SelectItem value="male">Male teacher</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          disabled={!canStep1}
                          onClick={() => setStep(2)}
                        >
                          Next: pick a time
                        </Button>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="timezone">
                            <Globe className="me-1 inline h-4 w-4" aria-hidden />
                            Your timezone
                          </Label>
                          <Select value={timezone} onValueChange={setTimezone}>
                            <SelectTrigger aria-label="Timezone">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIMEZONES.map((tz) => (
                                <SelectItem key={tz} value={tz}>
                                  {tz.replace("_", " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-muted-foreground">
                            Auto-detected. All lesson times are shown in your timezone.
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>Country</Label>
                          <Select value={form.country} onValueChange={(v) => set("country", v)}>
                            <SelectTrigger aria-label="Country">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="UK">United Kingdom</SelectItem>
                              <SelectItem value="USA">United States</SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>
                          <Calendar className="me-1 inline h-4 w-4" aria-hidden />
                          Trial date
                        </Label>
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-7" role="radiogroup" aria-label="Trial date">
                          {days.map((d) => (
                            <button
                              key={d}
                              type="button"
                              role="radio"
                              aria-checked={form.trialDate === d}
                              className={
                                form.trialDate === d
                                  ? "rounded-lg border-2 border-primary bg-primary/10 px-2 py-2 text-xs font-medium"
                                  : "rounded-lg border border-border px-2 py-2 text-xs hover:bg-secondary"
                              }
                              onClick={() => set("trialDate", d)}
                            >
                              {formatDateLabel(d)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="trialTime">
                          <Clock className="me-1 inline h-4 w-4" aria-hidden />
                          Trial time (your timezone)
                        </Label>
                        <Input
                          id="trialTime"
                          type="time"
                          required
                          value={form.trialTime}
                          onChange={(e) => set("trialTime", e.target.value)}
                          className="sm:w-48"
                        />
                        <p className="text-xs text-muted-foreground">
                          Our teachers teach 6am–9pm UK time. We&apos;ll confirm the exact slot
                          after your request.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Anything we should know? (optional)</Label>
                        <Textarea
                          id="message"
                          value={form.message}
                          onChange={(e) => set("message", e.target.value)}
                          placeholder="e.g. My daughter has finished Qaida and reads a little Nazra. We prefer lessons after school at 5pm."
                          rows={3}
                        />
                      </div>

                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}

                      <div className="flex justify-between">
                        <Button type="button" variant="outline" onClick={() => setStep(1)}>
                          Back
                        </Button>
                        <Button type="submit" disabled={loading || !form.trialDate} className="gap-2">
                          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                          Request free assessment
                        </Button>
                      </div>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>

            <CardDescription className="mt-4 px-2 text-center text-xs text-muted-foreground">
              We collect only the minimum: student first name, age, level and parent contact.
              See our <Link href="/legal/privacy" className="underline">privacy policy</Link>.
              A parent must be present during lessons for young children.
            </CardDescription>
          </div>
        )}
      </main>

      <footer className="border-t border-border/60 bg-background py-4 text-center text-xs text-muted-foreground">
        Madrasah Irshad-e-Madina · Since 2011 · info@irshademadina.com
      </footer>
    </div>
  );
}
