import Image from "next/image";
import Link from "next/link";
import { BookOpenText, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/home/reveal";

export function HeroSection() {
  return (
    <section
      className="relative isolate overflow-hidden bg-emerald-deep"
      aria-label="Welcome"
    >
      {/* Geometric pattern backdrop with emerald overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/pattern-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-deep/80 via-emerald-deep/85 to-emerald-deep/95" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-32">
        <Reveal>
          <p className="font-arabic text-2xl leading-relaxed text-gold sm:text-3xl" lang="ar">
            مدارس ارشاد مدینہ
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <p
            className="mt-6 font-quran text-2xl leading-relaxed text-cream/90 sm:text-3xl"
            lang="ar"
            aria-label="Bismillah ar-Rahman ar-Raheem"
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="mt-8 max-w-3xl font-serif text-4xl font-bold leading-[1.15] tracking-tight text-cream sm:text-5xl">
            Structured one-to-one Qur&apos;an learning, with your child at the
            centre
          </h1>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/80 sm:text-lg">
            Qualified teachers, daily revision and full parent visibility —
            gentle, disciplined one-to-one lessons online for families in the
            UK, USA and Canada, from a madrasa that has been teaching since
            2011.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
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
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-cream/40 bg-cream/10 text-cream backdrop-blur-sm hover:bg-cream/20 hover:text-cream sm:w-auto"
            >
              <Link href="/quran">
                <BookOpenText aria-hidden />
                Read the Qur&apos;an free
              </Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-cream/60">
            First trial class free · No card details
          </p>
        </Reveal>
      </div>
    </section>
  );
}
