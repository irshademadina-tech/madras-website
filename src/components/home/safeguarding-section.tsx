import {
  Flag,
  HeartHandshake,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/home/reveal";

const POINTS = [
  {
    icon: Users,
    title: "A parent present for young children",
    body: "For young learners, we ask a parent to be present or nearby during the lesson. You hear every word said to your child, in every class.",
  },
  {
    icon: ScrollText,
    title: "A written code of conduct",
    body: "Every teacher follows a written code of conduct — professional language, appropriate manner and clear boundaries, in every lesson and every message.",
  },
  {
    icon: HeartHandshake,
    title: "A female teacher for girls",
    body: "Daughters can be taught by our female teacher, Hafiza Ayesha Iqbal. Many families prefer this, and it is always your choice.",
  },
  {
    icon: Flag,
    title: "A clear complaint route",
    body: "If anything ever concerns you, raise it directly with the founder. Every complaint is read and answered personally — and you can stop lessons at any time.",
  },
] as const;

export function SafeguardingSection() {
  return (
    <section
      id="safeguarding"
      className="scroll-mt-20 border-y border-border/60 bg-secondary/50 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Safeguarding"
          title="Your child's safety and dignity come first"
          description="Teaching children is a trust — an amānah. We keep online the same protections a good madrasa keeps in person, and we keep parents close."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {POINTS.map((point, i) => (
            <Reveal key={point.title} delay={(i % 2) * 0.08}>
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <point.icon className="h-5 w-5 text-primary" aria-hidden />
                    </span>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      {point.title}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="mt-1">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {point.body}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <div className="mx-auto mt-10 flex max-w-2xl items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <p className="text-sm leading-relaxed text-foreground/90">
              We ask every family to read our safeguarding expectations before
              lessons begin — the same rules protect your child, our teachers
              and the barakah of the lesson. If anything is ever unclear, ask
              us before you enrol.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
