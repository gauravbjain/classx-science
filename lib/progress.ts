"use client";

const KEY = "classx.progress.v1";

export type Progress = {
  read: Record<string, number>;          // chapter slug -> timestamp
  quiz: Record<string, { best: number; total: number; at: number }>;
  cards: Record<string, string[]>;       // chapter slug -> mastered card indices
};

const EMPTY: Progress = { read: {}, quiz: {}, cards: {} };

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

export function save(p: Progress) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
    window.dispatchEvent(new Event("classx-progress"));
  } catch {
    /* storage unavailable — progress is a convenience, not a requirement */
  }
}

export function markRead(slug: string) {
  const p = load();
  p.read[slug] = Date.now();
  save(p);
}

export function recordQuiz(slug: string, score: number, total: number) {
  const p = load();
  const prev = p.quiz[slug];
  p.quiz[slug] = { best: Math.max(score, prev?.best ?? 0), total, at: Date.now() };
  save(p);
}

export function toggleCard(slug: string, idx: number) {
  const p = load();
  const list = new Set(p.cards[slug] ?? []);
  const k = String(idx);
  if (list.has(k)) list.delete(k); else list.add(k);
  p.cards[slug] = Array.from(list);
  save(p);
}

export function resetAll() {
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("classx-progress"));
  } catch { /* ignore */ }
}
