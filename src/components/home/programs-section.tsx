import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  BookA,
  BookOpen,
  BookOpenText,
  Brain,
  MoonStar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/home/reveal";

const PROGRAMS = [
  {
    icon: BookA,
    stage: "Foundation",
    title: "Noorani Qaida",
    description:
      "The first steps of reading: Arabic letters, their shapes and sounds, joining and correct pronunciation — taught patiently until each step is secure.",
  },
  {
    icon: BookOpen,
    stage: "Fluent reading",
    title: "Nazra",
    description:
      "Reading the whole Qur'an fluently, from short surahs to the full mushaf, with guided daily practice and gentle correction.",
  },
  {
    icon: AudioLines,
    stage: "Recitation",
    title: "Tajweed",
    description:
      "The rules of beautiful, correct recitation — pronunciation and its qualities, applied and refined lesson by lesson.",
  },
  {
    icon: MoonStar,
    stage: "Every day",
    title: "Daily Islamic Learning",
    description:
      "Namaz, Kalimas, Duas and short Surahs, woven into the daily lesson — small, consistent learning that builds a living practice.",
  },
  {
    icon: Brain,
    stage: "Secondary track",
    title: "Hifz",
    description:
      "Memorisation of the Qur'an with a disciplined revision cycle — 1, 3, 7 and 14 days — offered to students whose reading is already strong.",
  },
] as const;

export function ProgramsSection() {
  return (
    <section id="programs" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Programs"
          title="A clear path, from the first letter to fluent recitation"
          description="Every child follows the classical sequence — Qaida, then Nazra, then Tajweed — at their own pace. Islamic learning runs alongside, and Hifz opens for those who are ready."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PROGRAMS.map((program, i) => (
            <Reveal key={program.title} delay={(i % 3) * 0.08}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <program.icon className="h-5.5 w-5.5 text-primary" aria-hidden />
                    </span>
                    <Badge
                      variant="outline"
                      className="border-gold/40 bg-gold/10 text-foreground"
                    >
                      {program.stage}
                    </Badge>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    {program.title}
                  </h3>
                </CardHeader>
                <CardContent className="mt-1">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {program.description}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}

          {/* Qur'an Reader teaser */}
          <Reveal delay={0.16}>
            <Card className="h-full border-primary/40 bg-primary text-primary-foreground">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                    <BookOpenText className="h-5.5 w-5.5 text-gold" aria-hidden />
                  </span>
                  <Badge className="border-transparent bg-gold font-semibold text-foreground">
                    Free · No login
                  </Badge>
                </div>
                <h3 className="font-serif text-lg font-bold">
                  The Qur&apos;an Reader
                </h3>
              </CardHeader>
              <CardContent className="mt-1 flex h-full flex-col">
                <p className="text-sm leading-relaxed text-primary-foreground/85">
                  Free for everyone. No login. No ads. The full Uthmani mushaf
                  with lesson highlighting for enrolled students.
                </p>
                <Link
                  href="/quran"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold underline-offset-4 hover:underline"
                >
                  Open the Qur&apos;an Reader
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Not sure where your child should start?{" "}
            <Link
              href="/book-assessment"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Book a free assessment
            </Link>{" "}
            — we will tell you honestly.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
