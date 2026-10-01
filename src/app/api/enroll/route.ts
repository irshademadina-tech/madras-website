import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  studentName: z.string().min(2).max(80),
  studentAge: z.number().int().min(4).max(80).optional(),
  level: z.enum(["BEGINNER", "QAIDA", "NAZRA", "TAJWEED", "HIFZ"]).default("BEGINNER"),
  parentName: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  whatsapp: z.string().max(30).optional(),
  timezone: z.string().min(1).max(64),
  country: z.enum(["UK", "USA", "Canada", "Other"]).default("UK"),
  program: z.enum(["QAIDA", "NAZRA", "TAJWEED", "ISLAMIC_STUDIES", "HIFZ", "NOT_SURE"]).default("NOT_SURE"),
  preferredTeacherGender: z.enum(["any", "female", "male"]).default("any"),
  trialDate: z.string().min(4).max(10), // yyyy-mm-dd
  trialTime: z.string().min(3).max(8), // HH:mm (in the parent's tz)
  message: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const d = parsed.data;

    // store the trial time as an ISO instant derived from the parent's timezone
    let trialAt: Date | null = null;
    try {
      // interpret "yyyy-mm-dd HH:mm" in the parent's timezone
      const naive = `${d.trialDate}T${d.trialTime}:00`;
      // Convert zoned local time to UTC instant using Intl
      const guess = new Date(naive + "Z"); // first guess: treat as UTC
      const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: d.timezone,
        hour12: false,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
      const parts = fmt.formatToParts(guess);
      const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
      const asUTC = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour") % 24, get("minute"), get("second"));
      const offset = asUTC - guess.getTime(); // tz offset at that moment
      trialAt = new Date(guess.getTime() - offset);
    } catch {
      trialAt = new Date(`${d.trialDate}T${d.trialTime}:00Z`);
    }
    if (!trialAt || isNaN(trialAt.getTime()) || trialAt.getTime() < Date.now() - 3600_000) {
      return NextResponse.json(
        { error: "Please choose a future date and time for the trial." },
        { status: 400 }
      );
    }

    const enrollment = await db.enrollment.create({
      data: {
        studentName: d.studentName,
        studentAge: d.studentAge,
        level: d.level,
        parentName: d.parentName,
        email: d.email.toLowerCase(),
        phone: d.phone,
        whatsapp: d.whatsapp,
        timezone: d.timezone,
        country: d.country,
        program: d.program,
        preferredTeacherGender: d.preferredTeacherGender,
        message: d.message,
        trialAt,
        trialStatus: "REQUESTED",
        status: "NEW",
      },
    });

    // audit
    await db.auditLog.create({
      data: {
        action: "ENROLLMENT_CREATED",
        entity: "Enrollment",
        entityId: enrollment.id,
        detail: `Trial requested by ${d.parentName} for ${d.studentName} (${d.timezone})`,
      },
    });

    return NextResponse.json({ ok: true, id: enrollment.id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
