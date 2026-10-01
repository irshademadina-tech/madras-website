import type { Metadata } from "next";
import { PageHeader } from "@/components/home/page-header";
import { StorySection } from "@/components/home/story-section";
import { CtaBand } from "@/components/home/cta-band";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "How a small madrasa in Gulshan Ali Colony, Lahore — founded in 2011 by Qari Muhammad Iqbal and his Hafiza daughter — became an online Qur'an school for families in the UK, USA and Canada.",
};

export default function StoryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="A madrasa that grew, without changing what mattered"
        description="Founded in Lahore in 2011, teaching the children of families who later moved abroad — and asked if the lessons could continue online."
      />
      <StorySection />
      <CtaBand />
    </>
  );
}
