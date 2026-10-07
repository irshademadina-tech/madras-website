import Image from "next/image";
import { BookOpen, Info, Languages, Quote, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/home/reveal";

const TEACHERS = [
  {
    name: "Qari Muhammad Iqbal",
    role: "Founder & Lead Qur'an Teacher",
    image: "/images/teacher-male.png",
    alt: "Portrait illustration of Qari Muhammad Iqbal, founder and lead Qur'an teacher",
    bio: "Teaching the Qur'an for more than 25 years — from a child's first letters of Qaida to the finer points of Tajweed for fluent reciters. Patient, precise and unhurried.",
    sanad: "Carries the recitation and teaching of the line of Sheikh Sayyed Hafiz Irshad Hussain Naqshbandi.",
    languages: "Urdu · English",
    teaches: "Noorani Qaida · Nazra · Tajweed",
    teachesBest:
      "Building confident, correct recitation step by step — children and adults alike.",
  },
  {
    name: "Hafiza Ayesha Iqbal",
    role: "Qur'an Teacher for Girls & Children",
    image: "/images/teacher-female.png",
    alt: "Portrait illustration of Hafiza Ayesha Iqbal, Qur'an teacher for girls and children",
    bio: "A Hafiza of the Qur'an and the founder's daughter, teaching girls and young children with gentle, structured methods that keep little learners encouraged and steady.",
    sanad: "Hafiza of the Qur'an — the complete Book by heart, memorised under her father's instruction.",
    languages: "Urdu · English",
    teaches: "Qaida · Nazra · Daily revision",
    teachesBest:
      "Young children and girls — kind pacing, steady revision, plenty of encouragement.",
  },
] as const;

export function TeachersSection() {
  return (
    <section
      id="teachers"
      className="scroll-mt-20 border-y border-border/60 bg-secondary/50 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Our Teachers"
          title="Two teachers. Your child, known by name."
          description="Small by choice. Every student is taught directly by one of our two senior teachers — never handed to rotating assistants."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TEACHERS.map((teacher, i) => (
            <Reveal key={teacher.name} delay={i * 0.1}>
              <Card className="h-full overflow-hidden pt-0">
                <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]">
                  <Image
                    src={teacher.image}
                    alt={teacher.alt}
                    fill
                    sizes="(min-width: 768px) 42vw, 92vw"
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>
                <CardHeader className="pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-serif text-xl font-bold text-foreground">
                      {teacher.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className="border-primary/30 text-primary"
                    >
                      {teacher.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="mt-4 space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {teacher.bio}
                  </p>

                  <figure className="rounded-lg border border-gold/30 bg-secondary/70 p-3.5">
                    <div className="flex gap-2.5">
                      <Quote className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                      <figcaption className="text-xs leading-relaxed text-secondary-foreground">
                        {teacher.sanad}
                      </figcaption>
                    </div>
                  </figure>

                  <div className="flex flex-col gap-2 text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Languages className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="font-medium text-foreground">Languages:</span>{" "}
                      {teacher.languages}
                    </span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span className="font-medium text-foreground">Teaches:</span>{" "}
                      {teacher.teaches}
                    </span>
                    <span className="flex items-start gap-2 text-muted-foreground">
                      <Star className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                      <span>
                        <span className="font-medium text-foreground">
                          Teaches best:
                        </span>{" "}
                        {teacher.teachesBest}
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 flex max-w-2xl items-start justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
            Real teacher photos and credentials replace these at launch — we
            publish only verified credentials.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
