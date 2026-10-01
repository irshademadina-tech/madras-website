import Image from "next/image";
import {
  ClipboardList,
  Eye,
  MessagesSquare,
  Repeat,
  UserCheck,
} from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/home/reveal";

const STEPS = [
  {
    icon: MessagesSquare,
    title: "Free assessment",
    description:
      "A friendly first meeting where we listen to your child read and hear your hopes for them — no commitment, no card details.",
  },
  {
    icon: ClipboardList,
    title: "Written learning plan",
    description:
      "You receive a short written plan: where your child starts, what they will learn, and the weekly rhythm. Nothing is left vague.",
  },
  {
    icon: UserCheck,
    title: "Teacher matched",
    description:
      "Your child is matched with the right teacher for their stage and temperament — including a female teacher for girls, where preferred.",
  },
  {
    icon: Repeat,
    title: "Daily lessons & revision",
    description:
      "Short one-to-one lessons with a 1-day / 3-day / 7-day / 14-day revision cycle, so what is learned is truly kept — not just covered.",
  },
  {
    icon: Eye,
    title: "Parent updates",
    description:
      "Regular updates and full visibility — lessons, corrections and revision you can see, so you always know how your child is doing.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-border/60 bg-secondary/50 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How It Works"
          title="Starting is simple — everything is written down"
          description="Five clear steps from first contact to daily lessons. You always know what is happening and why."
        />

        <Reveal delay={0.05}>
          <div className="relative mx-auto mt-10 aspect-[7/4] max-h-64 w-full max-w-3xl overflow-hidden rounded-xl border border-border/60 shadow-sm sm:aspect-[21/9]">
            <Image
              src="/images/home-learning.png"
              alt="A quiet, cosy study desk at home — an open book, warm light, ready for a lesson"
              fill
              sizes="(min-width: 1024px) 48rem, 92vw"
              className="object-cover"
            />
            <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 text-left text-xs font-medium text-white">
              Learning at home, in your own quiet corner — the madrasa comes to you.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-14">
          {/* Connector line (desktop) */}
          <div
            className="absolute left-[10%] right-[10%] top-6 hidden border-t-2 border-dashed border-primary/25 lg:block"
            aria-hidden
          />
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <Reveal delay={i * 0.08} className="h-full">
                  <div className="flex h-full flex-col">
                    <div className="flex items-center gap-4 lg:flex-col lg:items-start">
                      <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-gold/60 bg-background shadow-sm">
                        <step.icon className="h-5 w-5 text-primary" aria-hidden />
                      </span>
                      <span className="font-serif text-4xl font-bold leading-none text-primary/30 lg:mt-3 lg:block">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-4 font-serif text-base font-bold text-foreground sm:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
