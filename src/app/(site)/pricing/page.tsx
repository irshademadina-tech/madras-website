import type { Metadata } from "next";
import { PageHeader } from "@/components/home/page-header";
import { PricingSection } from "@/components/home/pricing-section";
import { FaqSection } from "@/components/home/faq-section";
import { CtaBand } from "@/components/home/cta-band";

export const metadata: Metadata = {
  title: "Pricing & Policies",
  description:
    "Simple monthly plans shown in full: 2 days a week £25, 3 days £35, 5 days £50 — per child, 30-minute one-to-one lessons. First trial free, 10% sibling discount, monthly cancellation, pro-rata refunds.",
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing & Policies"
        title="Plans and policies, in plain words"
        description="Visible prices, no hidden fees, fair terms. This is what trust looks like on paper."
      />
      <PricingSection />
      <FaqSection />
      <CtaBand />
    </>
  );
}
