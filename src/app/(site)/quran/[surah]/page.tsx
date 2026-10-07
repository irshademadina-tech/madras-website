import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuranReader } from "@/components/quran-reader";
import { CHAPTERS } from "@/lib/quran";

interface PageProps {
  params: Promise<{ surah: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { surah } = await params;
  const n = Number(surah);
  const ch = CHAPTERS.find((c) => c.number === n);
  if (!ch) return { title: "Qur'an Reader" };
  return {
    title: `Surah ${ch.englishName} (${ch.arabicName}) — Qur'an Reader`,
    description: `Read Surah ${ch.englishName} (${ch.translation}), chapter ${ch.number} of the Qur'an — ${ch.ayahCount} ayat in Uthmani text. Free, no login.`,
  };
}

export default async function QuranSurahPage({ params, searchParams }: PageProps) {
  const { surah } = await params;
  const { from, to } = await searchParams;
  const n = Number(surah);
  if (!Number.isInteger(n) || n < 1 || n > 114) notFound();
  const ch = CHAPTERS.find((c) => c.number === n)!;

  const fromAyah = from ? Math.min(Math.max(Number(from) || 1, 1), ch.ayahCount) : 1;
  const toAyah = to ? Math.min(Math.max(Number(to) || fromAyah, fromAyah), ch.ayahCount) : fromAyah;

  const initialGlobal = ch.firstGlobalId + fromAyah - 1;
  const range =
    toAyah > fromAyah
      ? {
          start: ch.firstGlobalId + fromAyah - 1,
          end: ch.firstGlobalId + toAyah - 1,
        }
      : undefined;

  return (
    <QuranReader
      key={`${n}-${fromAyah}`}
      initialSurah={n}
      initialAyah={initialGlobal}
      mode={range ? "readonly-highlight" : "public"}
      highlightRange={range}
      title={
        range
          ? `Shared passage: Surah ${ch.englishName} ${n}:${fromAyah}–${toAyah}`
          : undefined
      }
    />
  );
}
