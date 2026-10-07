import Image from "next/image";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";

export function CtaBand() {
  return (
    <section
      className="relative isolate overflow-hidden bg-emerald-deep"
      aria-label="Book your free assessment"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/cta-wide.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-deep/90 via-emerald-deep/80 to-emerald-deep/60" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-20">
        <Reveal>
          <p className="font-arabic text-xl text-gold sm:text-2xl" lang="ar">
            وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
          </p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-5 max-w-2xl font-serif text-3xl font-bold leading-tight tracking-tight text-cream sm:text-4xl">
            Book your child&apos;s free assessment today
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-cream/80">
            A friendly first meeting, an honest reading of where your child
            stands, and a written plan — whether or not you decide to enrol.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full bg-gold font-semibold text-foreground hover:bg-gold/90 sm:w-auto"
            >
              <Link href="/book-assessment">
                <CalendarCheck aria-hidden />
                Book a Free Assessment
              </Link>
            </Button>
            <p className="text-xs uppercase tracking-[0.18em] text-cream/60">
              Free · No card details · No commitment
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
