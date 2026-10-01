import type { Metadata } from "next";
import { PageHeader } from "@/components/home/page-header";
import { SafeguardingSection } from "@/components/home/safeguarding-section";
import { ContactSection } from "@/components/home/contact-section";

export const metadata: Metadata = {
  title: "Safeguarding",
  description:
    "Your child's safety and dignity come first: a parent present for young children, a written code of conduct, a female teacher option for girls, and a clear complaint route answered personally.",
};

export default function SafeguardingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Safeguarding"
        title="Teaching children is a trust — an amānah"
        description="We keep online the same protections a good madrasa keeps in person, and we keep parents close."
      />
      <SafeguardingSection />
      <ContactSection />
    </>
  );
}
