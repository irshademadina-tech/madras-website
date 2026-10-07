import type { Metadata } from "next";
import { PageHeader } from "@/components/home/page-header";
import { TeachersSection } from "@/components/home/teachers-section";
import { CtaBand } from "@/components/home/cta-band";

export const metadata: Metadata = {
  title: "Our Teachers",
  description:
    "Qari Muhammad Iqbal, teaching the Qur'an for more than 25 years in the line of Sheikh Sayyed Hafiz Irshad Hussain Naqshbandi, and Hafiza Ayesha Iqbal, teaching girls and young children. We publish only verified credentials.",
};

export default function TeachersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Teachers"
        title="Two teachers, one standard of teaching"
        description="Every student is taught directly by one of our two senior teachers — never handed to rotating assistants."
      />
      <TeachersSection />
      <CtaBand />
    </>
  );
}
