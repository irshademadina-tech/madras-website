import type { Metadata } from "next";
import { QuranReader } from "@/components/quran-reader";

export const metadata: Metadata = {
  title: "Qur'an Reader — Free, No Login",
  description:
    "Read the full Qur'an online — 114 surahs, 6,236 ayat, Uthmani text. Free for everyone, no login, no ads. Browse by surah or juz, jump to any ayah, share links.",
};

export default function QuranPage() {
  return <QuranReader />;
}
