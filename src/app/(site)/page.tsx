import { HeroSection } from "@/components/home/hero-section";
import { TrustStrip } from "@/components/home/trust-strip";
import { StorySection } from "@/components/home/story-section";
import { TeachersSection } from "@/components/home/teachers-section";
import { ProgramsSection } from "@/components/home/programs-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { PricingSection } from "@/components/home/pricing-section";
import { SafeguardingSection } from "@/components/home/safeguarding-section";
import { FaqSection } from "@/components/home/faq-section";
import { ContactSection } from "@/components/home/contact-section";
import { CtaBand } from "@/components/home/cta-band";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustStrip />
      <StorySection />
      <TeachersSection />
      <ProgramsSection />
      <HowItWorksSection />
      <PricingSection />
      <SafeguardingSection />
      <FaqSection />
      <ContactSection />
      <CtaBand />
    </>
  );
}
