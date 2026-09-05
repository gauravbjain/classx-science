"use client";

const KEY = "classx.progress.v3";
const OLD_KEY = "classx.progress.v2";

/** Per-question record. w = times wrong, c = times right, streak = current consecutive-correct run. */
export type QStat = { w: number; c: number; streak: number };

/** Leitner spaced-repetition state for one flashcard. */
export type SrsCard = { box: number; due: number };

export type Progress = {
  read: Record<string, number>;                                   // "subject/slug" -> timestamp
  quiz: Record<string, { best: number; total: number; at: number }>;
  cards: Record<string, string[]>;
  q: Record<string, QStat>;          // "subject/slug#q3" / "#ar1" -> per-question stats
  srs: Record<string, SrsCard>;      // "subject/slug#c3" -> spaced-repetition schedule
  days: Record<string, number>;      // "YYYY-MM-DD" -> questions answered that day
  xp: number;
  life: { answered: number; correct: number };
  badges: Record<string, number>;    // badgeId -> earned timestamp
  exams: Record<string, string>;     // subject slug -> "YYYY-MM-DD" exam date
};

const EMPTY: Progress = { read: {}, quiz: {}, cards: {}, q: {}, srs: {}, days: {}, xp: 0, life: { answered: 0, correct: 0 }, badges: {}, exams: {} };
const key = (subject: string, slug: string) => `${subject}/${slug}`;
const MASTER = 2; // answer a mistake right this many times in a row to clear it

function todayStr(d = new Date()) {
  return d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

export function load(): Progress {
  if (typeof window === "undefined") return EMPTY;
  try {
    let raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const old = window.localStorage.getItem(OLD_KEY);      // one-time migration from v2
      if (old) {
        const o = JSON.parse(old);
        return { ...EMPTY, read: o.read ?? {}, quiz: o.quiz ?? {}, cards: o.cards ?? {} };
      }
      return { ...EMPTY };
    }
    const p = JSON.parse(raw);
    return {
      read: p.read ?? {}, quiz: p.quiz ?? {}, cards: p.cards ?? {},
      q: p.q ?? {}, srs: p.srs ?? {}, days: p.days ?? {}, xp: p.xp ?? 0,
      life: p.life ?? { answered: 0, correct: 0 }, badges: p.badges ?? {}, exams: p.exams ?? {},
    };
  } catch {
    return { ...EMPTY };
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

/**
 * Records one attempt at a single question. Drives the mistake bank, the weak-spot
 * dashboard, the daily streak and XP. `kind` is "q" for a quiz MCQ, "ar" for an
 * assertion-reason. Safe to call on every answer.
 */
export function recordAnswer(subject: string, slug: string, kind: "q" | "ar", index: number, correct: boolean) {
  const p = load();
  const qk = `${key(subject, slug)}#${kind}${index}`;
  const st = p.q[qk] ?? { w: 0, c: 0, streak: 0 };
  if (correct) { st.c += 1; st.streak += 1; } else { st.w += 1; st.streak = 0; }
  p.q[qk] = st;

  const d = todayStr();
  p.days[d] = (p.days[d] ?? 0) + 1;
  p.xp += correct ? 10 : 2;
  p.life.answered += 1;
  if (correct) p.life.correct += 1;

  awardBadges(p);
  save(p);
}

/**
 * Records an attempt for XP / streak / daily-goal only, without per-question
 * tracking. Used by the mixed test, where a question can't be mapped back to a
 * specific chapter slug + index.
 */
export function recordAttempt(correct: boolean) {
  const p = load();
  const d = todayStr();
  p.days[d] = (p.days[d] ?? 0) + 1;
  p.xp += correct ? 10 : 2;
  p.life.answered += 1;
  if (correct) p.life.correct += 1;
  awardBadges(p);
  save(p);
}

// ---- exam date & daily plan ------------------------------------------------
export function setExamDate(subject: string, date: string) {
  const p = load();
  if (date) p.exams[subject] = date; else delete p.exams[subject];
  save(p);
}
export function getExamDate(subject: string): string | null {
  return load().exams[subject] ?? null;
}
/** Whole days from today until the exam (negative if past). null if unset. */
export function daysToExam(subject: string): number | null {
  const d = getExamDate(subject);
  if (!d) return null;
  const exam = new Date(d + "T00:00:00");
  const today = new Date(todayStr() + "T00:00:00");
  return Math.round((exam.getTime() - today.getTime()) / 86400000);
}

// ---- spaced repetition (flashcards) ---------------------------------------
/** Days a card waits at each Leitner box after a "Got it". Box 0 is due now. */
const SRS_DAYS = [0, 1, 3, 7, 16];
const cardKey = (subject: string, slug: string, index: number) => `${subject}/${slug}#c${index}`;

/** Rate a flashcard in review. `good` promotes it a box; a miss sends it back to box 0. */
export function rateCard(subject: string, slug: string, index: number, good: boolean) {
  const p = load();
  const k = cardKey(subject, slug, index);
  const cur = p.srs[k] ?? { box: 0, due: 0 };
  const box = good ? Math.min(cur.box + 1, SRS_DAYS.length - 1) : 0;
  const due = Date.now() + (good ? SRS_DAYS[box] * 86400000 : 10 * 60000); // a miss returns in ~10 min
  p.srs[k] = { box, due };
  const d = todayStr();
  p.days[d] = (p.days[d] ?? 0) + 1;      // reviewing keeps the streak alive
  p.xp += good ? 3 : 1;
  awardBadges(p);
  save(p);
}

/** SRS map for one subject, keyed by "slug#c3". */
export function subjectSrs(subject: string, p: Progress = load()) {
  const pre = `${subject}/`;
  const out: Record<string, SrsCard> = {};
  for (const [k, v] of Object.entries(p.srs)) if (k.startsWith(pre)) out[k.slice(pre.length)] = v;
  return out;
}

/**
 * Given the full list of card ids ("slug#c3") for a subject, returns those due
 * for review now — never seen, or past their due date. New cards come last so a
 * session leads with things the learner is about to forget.
 */
export function dueCards(subject: string, allIds: string[]): string[] {
  const srs = subjectSrs(subject);
  const now = Date.now();
  const seen: string[] = [], fresh: string[] = [];
  for (const id of allIds) {
    const s = srs[id];
    if (!s) fresh.push(id);
    else if (s.due <= now) seen.push(id);
  }
  seen.sort((a, b) => (srs[a].due - srs[b].due));
  return [...seen, ...fresh];
}

// ---- streak ----------------------------------------------------------------
export function streakInfo(p: Progress = load()) {
  const days = Object.keys(p.days).filter((d) => (p.days[d] ?? 0) > 0).sort();
  const set = new Set(days);
  // current: count back from today (or yesterday) while consecutive days exist
  let current = 0;
  const probe = new Date();
  if (!set.has(todayStr(probe))) probe.setDate(probe.getDate() - 1); // today not done yet? allow yesterday
  while (set.has(todayStr(probe))) { current += 1; probe.setDate(probe.getDate() - 1); }
  // longest
  let longest = 0, run = 0; let prev: Date | null = null;
  for (const d of days) {
    const cur = new Date(d + "T00:00:00");
    if (prev && (cur.getTime() - prev.getTime()) === 86400000) run += 1; else run = 1;
    longest = Math.max(longest, run);
    prev = cur;
  }
  return { current, longest };
}

// ---- levels ----------------------------------------------------------------
/** Gentle curve: level N needs 50·N² XP. Level 1 at 0, 2 at 200, 3 at 450… */
export function levelInfo(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const floor = 50 * (level - 1) * (level - 1);
  const ceil = 50 * level * level;
  return { level, into: xp - floor, span: ceil - floor, pct: Math.round(((xp - floor) / (ceil - floor)) * 100) };
}

// ---- badges ----------------------------------------------------------------
export type BadgeDef = { id: string; name: string; blurb: string; icon: string; test: (p: Progress) => boolean };

function masteredCount(p: Progress) {
  return Object.values(p.q).filter((s) => s.w > 0 && s.streak >= MASTER).length;
}

export const BADGES: BadgeDef[] = [
  { id: "first-steps", name: "First Steps", blurb: "Answered your first question", icon: "🌱", test: (p) => p.life.answered >= 1 },
  { id: "ton-up", name: "Century", blurb: "Answered 100 questions", icon: "💯", test: (p) => p.life.answered >= 100 },
  { id: "500-club", name: "500 Club", blurb: "Answered 500 questions", icon: "🏅", test: (p) => p.life.answered >= 500 },
  { id: "sharp", name: "Sharpshooter", blurb: "80%+ accuracy over 50+ questions", icon: "🎯", test: (p) => p.life.answered >= 50 && p.life.correct / p.life.answered >= 0.8 },
  { id: "streak-3", name: "On a Roll", blurb: "3-day study streak", icon: "🔥", test: (p) => streakInfo(p).longest >= 3 },
  { id: "streak-7", name: "Week Warrior", blurb: "7-day study streak", icon: "⚡", test: (p) => streakInfo(p).longest >= 7 },
  { id: "streak-30", name: "Unstoppable", blurb: "30-day study streak", icon: "🚀", test: (p) => streakInfo(p).longest >= 30 },
  { id: "comeback", name: "Comeback Kid", blurb: "Fixed 20 questions you once got wrong", icon: "🛠️", test: (p) => masteredCount(p) >= 20 },
  { id: "scholar", name: "Scholar", blurb: "Reached level 5", icon: "🎓", test: (p) => levelInfo(p.xp).level >= 5 },
];

function awardBadges(p: Progress) {
  for (const b of BADGES) {
    if (!p.badges[b.id] && b.test(p)) p.badges[b.id] = Date.now();
  }
}

export function earnedBadges(p: Progress = load()) {
  // `earned` is evaluated live so the trophy case is always correct, even if a
  // criterion was met outside a recorded answer. `earnedAt` is the first-earned
  // timestamp (stamped during recordAnswer), kept for future "new!" cues.
  return BADGES.map((b) => ({ ...b, earnedAt: p.badges[b.id] ?? null, earned: !!p.badges[b.id] || b.test(p) }));
}

export const DAILY_GOAL = 20;

/** One-call summary for the header chip and the trophy-case panel. */
export function dashboard() {
  const p = load();
  const { level, into, span, pct } = levelInfo(p.xp);
  const { current, longest } = streakInfo(p);
  const today = p.days[todayStr()] ?? 0;
  const accuracy = p.life.answered ? Math.round((p.life.correct / p.life.answered) * 100) : 0;
  const badges = earnedBadges(p);
  return {
    xp: p.xp, level, into, span, pct,
    streak: current, longest,
    today, goal: DAILY_GOAL,
    answered: p.life.answered, correct: p.life.correct, accuracy,
    badges, earnedCount: badges.filter((b) => b.earned).length,
  };
}

// ---- weak spots & mistake bank --------------------------------------------
/** Raw per-question map for one subject, keyed by "slug#q3". */
export function subjectQStats(subject: string, p: Progress = load()) {
  const pre = `${subject}/`;
  const out: Record<string, QStat> = {};
  for (const [k, v] of Object.entries(p.q)) if (k.startsWith(pre)) out[k.slice(pre.length)] = v;
  return out;
}

/** Question keys the learner has got wrong and not yet mastered, for one subject. */
export function dueMistakeKeys(subject: string, p: Progress = load()): string[] {
  const pre = `${subject}/`;
  return Object.entries(p.q)
    .filter(([k, v]) => k.startsWith(pre) && v.w > 0 && v.streak < MASTER)
    .sort((a, b) => b[1].w - a[1].w)
    .map(([k]) => k.slice(pre.length));
}

/** Global stats scoped to one subject (used by the strips and dashboard). */
export function subjectStats(subject: string) {
  const p = load();
  const pre = `${subject}/`;
  const read = Object.keys(p.read).filter((k) => k.startsWith(pre)).length;
  const quizzes = Object.entries(p.quiz).filter(([k]) => k.startsWith(pre)).map(([, v]) => v);
  const avg = quizzes.length
    ? Math.round((quizzes.reduce((a, b) => a + b.best / b.total, 0) / quizzes.length) * 100)
    : 0;
  const due = dueMistakeKeys(subject, p).length;
  return { read, quizzes: quizzes.length, avg, due };
}

export function resetSubject(subject: string) {
  const p = load();
  const pre = `${subject}/`;
  for (const k of Object.keys(p.read)) if (k.startsWith(pre)) delete p.read[k];
  for (const k of Object.keys(p.quiz)) if (k.startsWith(pre)) delete p.quiz[k];
  for (const k of Object.keys(p.cards)) if (k.startsWith(pre)) delete p.cards[k];
  for (const k of Object.keys(p.q)) if (k.startsWith(pre)) delete p.q[k];
  for (const k of Object.keys(p.srs)) if (k.startsWith(pre)) delete p.srs[k];
  save(p);
}
