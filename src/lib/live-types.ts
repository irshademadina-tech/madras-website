// Shared types for the Live Interactive Quran Lesson.
// A live session is a share-link page: the teacher presents an ayah range,
// both teacher and student can highlight words/ayat (correct = emerald,
// mistake = amber), and the teacher's scroll position syncs to every viewer.

export type HighlightKind = "correct" | "mistake";

export interface LiveHighlight {
  ayah: number; // global ayah id (1..6236)
  wordIdx?: number; // index of the word within the ayah text; undefined = whole ayah
  kind: HighlightKind;
  by: string; // display name of who highlighted it
  ts: number; // epoch ms
}

export interface LiveState {
  sessionId: string;
  token: string;
  title: string;
  teacherName: string;
  startAyah: number | null;
  endAyah: number | null;
  active: boolean;
  highlights: LiveHighlight[];
  scrollAyah: number | null; // where the teacher currently is
  updatedAt: string;
}

export function hlKey(h: { ayah: number; wordIdx?: number }) {
  return `${h.ayah}:${h.wordIdx ?? "a"}`;
}

export function findHighlight(
  list: LiveHighlight[],
  ayah: number,
  wordIdx?: number
): LiveHighlight | undefined {
  return list.find(
    (h) => h.ayah === ayah && (h.wordIdx ?? undefined) === (wordIdx ?? undefined)
  );
}
