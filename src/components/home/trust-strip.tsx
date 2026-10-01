import { Award, Eye, Globe, HeartHandshake } from "lucide-react";
import { Reveal } from "@/components/home/reveal";

const ITEMS = [
  {
    icon: Globe,
    label: "Since 2011 · Lahore to the world",
  },
  {
    icon: Award,
    label: "Qualified teachers with ijazah",
  },
  {
    icon: Eye,
    label: "Full parent visibility",
  },
  {
    icon: HeartHandshake,
    label: "Female teacher option for girls",
  },
] as const;

export function TrustStrip() {
  return (
    <section
      className="border-y border-primary/20 bg-primary text-primary-foreground"
      aria-label="Why families trust us"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-x-6 gap-y-4 px-4 py-6 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:py-7">
        {ITEMS.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.06}>
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                <item.icon className="h-4.5 w-4.5 text-gold" aria-hidden />
              </span>
              <p className="text-sm font-medium leading-snug">{item.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
