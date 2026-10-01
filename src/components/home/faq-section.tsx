import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/home/reveal";

const FAQS = [
  {
    question: "What lesson times are available in the UK, USA and Canada?",
    answer:
      "Our teachers are based in Lahore and teach across time zones, with slots in the afternoons and evenings of UK, USA and Canada time. In your free assessment we agree a weekly slot that fits around school and work — and then we keep it consistent, because routine is half of learning.",
  },
  {
    question: "Is the first class really free?",
    answer:
      "Yes — completely. The assessment and the first trial class are free, with no card details taken. If you decide not to continue after the trial, there is nothing to pay and nothing to cancel.",
  },
  {
    question: "How will you match my child with a teacher?",
    answer:
      "In the free assessment we listen to your child read and talk with you about goals and temperament. We then match your child with the teacher best suited to their stage and personality — and you will always know who that teacher is before lessons begin.",
  },
  {
    question: "Do you have female teachers for girls?",
    answer:
      "Yes. Hafiza Ayesha Iqbal, a Hafiza of the Qur'an, teaches girls and young children, and many of our families choose her. The choice is always yours — and for young children we ask a parent to be present or nearby either way.",
  },
  {
    question: "What equipment do we need for online lessons?",
    answer:
      "Any device with a camera, a microphone and a stable internet connection — a laptop or tablet works best. Add a quiet corner and the Qur'an or Qaida your child is using, and you are ready. There is no special software to buy.",
  },
  {
    question: "Can siblings learn together, or at the same time?",
    answer:
      "Lessons are strictly one-to-one, so each child gets the teacher's full attention. Siblings usually take back-to-back slots on the same days — each with their own plan, pace and progress record. And there is a 10% sibling discount on every additional child.",
  },
  {
    question: "How will I know what my child is actually learning?",
    answer:
      "Three ways: the written learning plan you receive at the start, the regular parent updates from the teacher, and full visibility of the record — lessons, corrections and revision — in your parent view. You never have to guess how your child is doing.",
  },
  {
    question: "What happens if we miss a lesson?",
    answer:
      "Tell us as early as you can. Missed lessons are rescheduled within the month under our make-up policy — a missed day never means lost learning, and it does not cost extra.",
  },
  {
    question: "How do payments and cancellation work?",
    answer:
      "Simple monthly plans, priced per child. You can cancel at the end of any month — no long contracts or exit fees — and if you leave part-way through a paid month, unused lessons are refunded pro-rata. Families in the USA and Canada are invoiced the equivalent in USD or CAD.",
  },
] as const;

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions families ask us"
          description="Honest answers to the things parents want to know before they enrol. If your question is not here, message us — we reply within one working day."
        />

        <Reveal delay={0.1}>
          <Accordion
            type="single"
            collapsible
            className="mt-10 rounded-xl border border-border/60 bg-card px-6 shadow-sm"
          >
            {FAQS.map((faq, i) => (
              <AccordionItem key={faq.question} value={`item-${i}`}>
                <AccordionTrigger className="rounded-md py-5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-secondary/40 hover:no-underline sm:text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
