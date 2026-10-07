import type { Metadata } from "next";
import { PageHeader } from "@/components/home/page-header";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { CtaBand } from "@/components/home/cta-band";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Five clear steps: a free assessment, a written learning plan, teacher matching, daily lessons with the 1/3/7/14-day revision cycle, and regular parent updates.",
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How It Works"
        title="From first message to daily lessons — simply and clearly"
        description="Everything is written down, matched to your child, and visible to you as a parent."
      />
      <HowItWorksSection />
      <CtaBand />
    </>
  );
}
