import type { Metadata } from "next";
import { PageHeader } from "@/components/home/page-header";
import { FaqSection } from "@/components/home/faq-section";
import { ContactSection } from "@/components/home/contact-section";

export const metadata: Metadata = {
  title: "FAQ & Contact",
  description:
    "Honest answers about timings and time zones, the free trial, teacher matching, female teachers, equipment, siblings, progress and payments. Message us on WhatsApp or email — we reply within one working day.",
};

export default function FaqPage() {
  return (
    <>
      <PageHeader
        eyebrow="FAQ & Contact"
        title="Questions families ask us"
        description="And a real person to answer anything else — usually within the day."
      />
      <FaqSection />
      <ContactSection />
    </>
  );
}
