import Link from "next/link";
import {
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  HandHeart,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/home/reveal";

const PLANS = [
  {
    days: "2 days / week",
    price: "£25",
    note: "per child · per month",
    bestValue: false,
    pace: "A gentle, steady pace for young beginners or busy weeks.",
  },
  {
    days: "3 days / week",
    price: "£35",
    note: "per child · per month",
    bestValue: false,
    pace: "The balanced rhythm most families choose for steady progress.",
  },
  {
    days: "5 days / week",
    price: "£50",
    note: "per child · per month",
    bestValue: true,
    pace: "Daily lessons — the classic madrasa rhythm, and the best value per lesson.",
  },
] as const;

const INCLUDED = [
  "30-minute one-to-one lessons",
  "Written learning plan",
  "1 / 3 / 7 / 14-day revision cycle",
  "Regular parent updates",
  "Make-up for missed classes",
] as const;

const POLICIES = [
  {
    icon: HandHeart,
    title: "First trial class free",
    body: "Every child begins with a free assessment and a free trial class. You only pay once you are content to continue.",
  },
  {
    icon: RotateCcw,
    title: "Missed-class make-up policy",
    body: "If a lesson is missed, it is made up — we reschedule rather than let your child fall behind.",
  },
  {
    icon: CalendarDays,
    title: "Monthly, cancel any month",
    body: "Plans run month to month. You can stop at the end of any month — no long contracts, no exit fees.",
  },
  {
    icon: CircleDollarSign,
    title: "Refunds pro-rata",
    body: "If you leave part-way through a paid month, unused lessons are refunded pro-rata. Plain and fair.",
  },
  {
    icon: ShieldCheck,
    title: "Sibling discount",
    body: "A 10% discount for each additional sibling enrolled — one invoice, straightforward to read.",
  },
] as const;

export function PricingSection() {
  return (
    <section id="pricing" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple monthly plans, shown in full"
          description="One-to-one, 30-minute lessons with a qualified teacher — priced per child, per month. No hidden fees, ever."
        />

        <Tabs defaultValue="plans" className="mt-10">
          <TabsList className="grid w-full grid-cols-2 sm:w-fit">
            <TabsTrigger value="plans">Lesson plans</TabsTrigger>
            <TabsTrigger value="policies">Policies &amp; fairness</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-8">
            <div className="grid gap-6 md:grid-cols-3">
              {PLANS.map((plan, i) => (
                <Reveal key={plan.days} delay={i * 0.08}>
                  <Card
                    className={
                      plan.bestValue
                        ? "relative h-full border-primary/50 shadow-md"
                        : "relative h-full"
                    }
                  >
                    {plan.bestValue ? (
                      <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 border-transparent bg-gold font-semibold text-foreground">
                        Best value
                      </Badge>
                    ) : null}
                    <CardHeader>
                      <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                        {plan.days}
                      </p>
                      <p className="mt-2 flex items-baseline gap-1.5">
                        <span className="font-serif text-5xl font-bold tracking-tight text-foreground">
                          {plan.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / month
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">{plan.note}</p>
                    </CardHeader>
                    <CardContent className="mt-2 flex h-full flex-col">
                      <p className="min-h-10 text-sm leading-relaxed text-muted-foreground">
                        {plan.pace}
                      </p>
                      <ul className="mt-5 space-y-2.5">
                        {INCLUDED.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-sm text-foreground/90"
                          >
                            <span
                              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                              aria-hidden
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Button
                        asChild
                        className="mt-6 w-full"
                        variant={plan.bestValue ? "default" : "outline"}
                      >
                        <Link href="/book-assessment">
                          <CalendarCheck aria-hidden />
                          Start with a free trial
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.15}>
              <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-muted-foreground">
                Prices are shown in GBP. Families in the USA and Canada are
                invoiced the equivalent amount in USD or CAD. First trial class
                free · 10% sibling discount · cancel at the end of any month.
              </p>
            </Reveal>
          </TabsContent>

          <TabsContent value="policies" className="mt-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {POLICIES.map((policy, i) => (
                <Reveal key={policy.title} delay={(i % 3) * 0.08}>
                  <Card className="h-full">
                    <CardHeader>
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                        <policy.icon className="h-5 w-5 text-primary" aria-hidden />
                      </span>
                      <h3 className="mt-2 font-serif text-lg font-bold text-foreground">
                        {policy.title}
                      </h3>
                    </CardHeader>
                    <CardContent className="mt-1">
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {policy.body}
                      </p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}

              <Reveal delay={0.16}>
                <Card className="h-full border-primary/40 bg-primary/5">
                  <CardContent className="flex h-full flex-col justify-center gap-3">
                    <p className="font-serif text-lg font-bold text-foreground">
                      A question about any of this?
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Ask us before you commit — we would rather answer
                      questions now than surprise you later.
                    </p>
                    <Link
                      href="/#contact"
                      className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Contact us
                    </Link>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
