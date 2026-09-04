"use client";

const KEY = "classx.progress.v2";

export type Progress = {
  read: Record<string, number>;                                   // "subject/slug" -> timestamp
  quiz: Record<string, { best: number; total: number; at: number }>;
  cards: Record<string, string[]>;
};

const EMPTY: Progress = { read: {}, quiz: {}, cards: {} };
const key = (subject: string, slug: string) => `${subject}/${slug}`;

export function load(): Progress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw);
    return { read: p.read ?? {}, quiz: p.quiz ?? {}, cards: p.cards ?? {} };
  } catch {
    return EMPTY;
  }
}

function save(p: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new Event("classx-progress"));
  } catch {
    /* storage unavailable — progress is a convenience, not a requirement */
  }
}

export function markRead(subject: string, slug: string) {
  const p = load();
  p.read[key(subject, slug)] = Date.now();
  save(p);
}

export function recordQuiz(subject: string, slug: string, score: number, total: number) {
  const p = load();
  const k = key(subject, slug);
  const prev = p.quiz[k];
  p.quiz[k] = { best: Math.max(score, prev?.best ?? 0), total, at: Date.now() };
  save(p);
}

/** Stats scoped to one subject. */
export function subjectStats(subject: string) {
  const p = load();
  const pre = `${subject}/`;
  const read = Object.keys(p.read).filter((k) => k.startsWith(pre)).length;
  const quizzes = Object.entries(p.quiz).filter(([k]) => k.startsWith(pre)).map(([, v]) => v);
  const avg = quizzes.length
    ? Math.round((quizzes.reduce((a, b) => a + b.best / b.total, 0) / quizzes.length) * 100)
    : 0;
  return { read, quizzes: quizzes.length, avg };
}

export function resetSubject(subject: string) {
  const p = load();
  const pre = `${subject}/`;
  for (const k of Object.keys(p.read)) if (k.startsWith(pre)) delete p.read[k];
  for (const k of Object.keys(p.quiz)) if (k.startsWith(pre)) delete p.quiz[k];
  for (const k of Object.keys(p.cards)) if (k.startsWith(pre)) delete p.cards[k];
  save(p);
}
