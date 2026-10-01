// Shared portal types (client-side)
export interface AyahCorrection {
  id: string;
  lessonId: string;
  ayah: number;
  note: string;
  createdAt: string;
}

export interface Revision {
  id: string;
  lessonId: string;
  studentId: string;
  stage: number;
  dueAt: string;
  status: string;
  doneAt: string | null;
  lesson?: LessonLite;
}

export interface LessonLite {
  id: string;
  title: string | null;
  type: string;
  startAyah: number | null;
  endAyah: number | null;
  contentRef: string | null;
  instructions: string | null;
  status: string;
  assignedAt: string;
  dueAt: string | null;
  completedAt: string | null;
  reviewedAt: string | null;
  feedback: string | null;
  teacherNotes: string | null;
  corrections: AyahCorrection[];
  revisions: Revision[];
  studentId: string;
}

export interface ProgressUpdate {
  id: string;
  studentId: string;
  lessonId: string | null;
  summary: string;
  rating: number | null;
  createdAt: string;
}

export interface StudentOverview {
  id: string;
  name: string;
  age: number | null;
  level: string;
  timezone: string;
  status: string;
  teacher: { name: string; title: string | null } | null;
  lessons: LessonLite[];
  progressUpdates: ProgressUpdate[];
}

export interface OverviewData {
  role: string;
  user: { name: string | null; email: string | null };
  students: StudentOverview[];
}
