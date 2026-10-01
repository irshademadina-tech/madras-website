import Image from "next/image";
import { MapPin, Quote } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/home/reveal";

export function StorySection() {
  return (
    <section id="story" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image collage */}
          <Reveal className="relative mx-auto w-full max-w-md lg:mx-0">
            <div className="relative">
              {/* Arch ornament backdrop */}
              <div
                className="absolute -left-6 -top-8 -z-10 h-full w-1/2 opacity-30 sm:-left-10 sm:-top-10"
                aria-hidden
              >
                <Image
                  src="/images/arch-ornament.png"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 20vw, 40vw"
                  className="object-contain object-top"
                />
              </div>

              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border/60 shadow-lg">
                <Image
                  src="/images/story-madrasa.png"
                  alt="A traditional wooden Qur'an stand (rehal) with an open book, in the quiet of the madrasa"
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
                <div className="absolute bottom-5 right-5 w-[42%] overflow-hidden rounded-xl border-4 border-background shadow-xl">
                  <div className="relative aspect-square">
                    <Image
                      src="/images/story-madrasa2.png"
                      alt="An open book resting on a stand — still-life from the madrasa's study corner"
                      fill
                      sizes="(min-width: 1024px) 18vw, 40vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 left-4 sm:-top-5 sm:left-6">
                <Badge className="gap-1.5 border-primary/20 bg-background px-3 py-1.5 text-foreground shadow-md">
                  <MapPin className="h-3.5 w-3.5 text-gold" aria-hidden />
                  Since 2011 · Lahore
                </Badge>
              </div>
            </div>
          </Reveal>

          {/* Narrative */}
          <div>
            <SectionHeading
              align="left"
              eyebrow="Our Story"
              title="From a small madrasa in Lahore to an online Qur'an school"
            />

            <Reveal delay={0.1}>
              <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground">
                <p>
                  Madrasah Irshad-e-Madina began in{" "}
                  <strong className="font-semibold text-foreground">2011</strong>,
                  in a couple of modest rooms in Gulshan Ali Colony, Lahore. It
                  was founded by Qari Muhammad Iqbal, a teacher of the
                  Qur&apos;an, together with his daughter — a Hafiza of the
                  Qur&apos;an — carrying the teaching of the late Sheikh Sayyed
                  Hafiz Irshad Hussain Naqshbandi&apos;s line.
                </p>
                <p>
                  For years, children from the neighbourhood came to those
                  rooms after school to learn Qaida, then Nazra, then Tajweed —
                  the same patient sequence the Qur&apos;an has always been
                  taught in. When families we taught moved abroad, to the UK,
                  the USA and Canada, they asked whether the lessons could
                  continue online.
                </p>
                <p>
                  They could. So the madrasa opened its doors to the world —
                  same teachers, same standards, same personal attention — one
                  child, one teacher, one lesson at a time.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <figure className="mt-8 rounded-xl border border-gold/30 bg-secondary/70 p-6">
                <Quote className="h-5 w-5 text-gold" aria-hidden />
                <blockquote className="mt-3 font-serif text-lg italic leading-relaxed text-foreground">
                  The teacher stays at the centre. Technology adapts to how the
                  madrasa teaches.
                </blockquote>
                <figcaption className="mt-3 text-sm text-muted-foreground">
                  — the principle behind everything we do online
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
