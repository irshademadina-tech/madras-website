// Qur'an reference helpers — global ayah id scheme (surah-major, 1..6236)
// chapters data mirrors public/quran.json (static, versioned reference data)

export interface ChapterInfo {
  number: number;
  arabicName: string;
  englishName: string;
  translation: string;
  ayahCount: number;
  firstGlobalId: number;
  juzAtStart: number;
}

// Minimal static table generated from the verified dataset (see /quran-data)
// [number, arName, enName, translation, ayahCount, firstGlobalId, juzAtStart]
import chaptersRaw from "@/data/chapters.json";

const chaptersTyped = (chaptersRaw as unknown as (string | number)[][]).map((c) => ({
  number: c[0] as number,
  arabicName: c[1] as string,
  englishName: c[2] as string,
  translation: c[3] as string,
  ayahCount: c[4] as number,
  firstGlobalId: c[5] as number,
  juzAtStart: c[6] as number,
}));

export const CHAPTERS: ChapterInfo[] = chaptersTyped;

export function chapterByNumber(n: number): ChapterInfo | undefined {
  return CHAPTERS.find((c) => c.number === n);
}

export function chapterOfGlobalAyah(g: number): ChapterInfo {
  // binary search over firstGlobalId
  let lo = 0,
    hi = CHAPTERS.length - 1,
    ans = CHAPTERS[0];
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (CHAPTERS[mid].firstGlobalId <= g) {
      ans = CHAPTERS[mid];
      lo = mid + 1;
    } else hi = mid - 1;
  }
  return ans;
}

export function globalToSurahAyah(g: number): { surah: number; ayah: number } {
  const ch = chapterOfGlobalAyah(g);
  return { surah: ch.number, ayah: g - ch.firstGlobalId + 1 };
}

export function surahAyahToGlobal(surah: number, ayah: number): number {
  const ch = chapterByNumber(surah);
  if (!ch) return 1;
  return ch.firstGlobalId + ayah - 1;
}

export function formatRef(g: number): string {
  const { surah, ayah } = globalToSurahAyah(g);
  return `${surah}:${ayah}`;
}

export function formatRange(start: number, end: number): string {
  if (!start || !end) return "—";
  const s = globalToSurahAyah(start);
  const e = globalToSurahAyah(end);
  if (s.surah === e.surah) {
    const ch = chapterByNumber(s.surah);
    return `${ch?.englishName ?? "Surah"} ${s.surah}: ${s.ayah === e.ayah ? s.ayah : `${s.ayah}–${e.ayah}`}`;
  }
  return `${formatRef(start)} – ${formatRef(end)}`;
}

// Juz start boundaries in global ayah ids (standard 30-juz division)
export const JUZ_STARTS: number[] = [
  1, 149, 260, 385, 517, 641, 751, 900, 1042, 1201, 1328, 1479, 1649, 1803, 2030, 2215, 2484,
  2674, 2876, 3215, 3386, 3564, 3733, 4090, 4265, 4511, 4706, 5105, 5242, 5673,
];

export function juzOfGlobalAyah(g: number): number {
  let j = 1;
  for (const start of JUZ_STARTS) {
    if (g >= start) j = JUZ_STARTS.indexOf(start) + 1;
    else break;
  }
  return j;
}
