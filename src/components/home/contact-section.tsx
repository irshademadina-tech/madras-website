import { Clock, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/home/reveal";
import { ContactForm } from "@/components/home/contact-form";

const WHATSAPP_URL = "https://wa.me/442079460958";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="scroll-mt-20 border-y border-border/60 bg-secondary/50 py-20 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Contact"
          title="Talk to a real person, today"
          description="A question about timings, teachers or where your child should start? Message us — a real person answers, not a bot."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Reach us directly */}
          <div className="flex flex-col gap-6">
            <Reveal>
              <Card className="flex-1">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <MessageCircle className="h-5 w-5 text-primary" aria-hidden />
                    </span>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      WhatsApp — fastest
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="mt-1 flex flex-1 flex-col">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Message us any time on WhatsApp — for enrolment questions,
                    timings, or to arrange your child&apos;s free assessment.
                  </p>
                  <p className="mt-4 font-serif text-xl font-bold text-foreground">
                    +44 20 7946 0958
                  </p>
                  <Button asChild className="mt-5 w-full sm:mt-auto sm:w-auto">
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle aria-hidden />
                      Message us on WhatsApp
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.08}>
              <Card className="flex-1">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" aria-hidden />
                    </span>
                    <h3 className="font-serif text-lg font-bold text-foreground">
                      Email
                    </h3>
                  </div>
                </CardHeader>
                <CardContent className="mt-1">
                  <a
                    href="mailto:info@irshademadina.com"
                    className="font-serif text-xl font-bold text-primary underline-offset-4 hover:underline"
                  >
                    info@irshademadina.com
                  </a>
                  <p className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                    We reply within one working day — usually much sooner.
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          </div>

          {/* Quick form */}
          <Reveal delay={0.12}>
            <Card className="h-full">
              <CardHeader>
                <h3 className="font-serif text-lg font-bold text-foreground">
                  Or leave a message here
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tell us your child&apos;s age and what you are hoping for —
                  we will suggest where to begin.
                </p>
              </CardHeader>
              <CardContent className="mt-2">
                <ContactForm />
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
