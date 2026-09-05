import type { SimId } from "./sim-ids";

export type NoteKind = "idea" | "real" | "exam" | "trap" | "why" | "memory";

export type Block =
  | { t: "h"; text: string; id?: string }
  | { t: "p"; html: string }
  | { t: "list"; items: string[]; ordered?: boolean }
  | { t: "note"; kind: NoteKind; title?: string; html: string }
  | { t: "formula"; expr: string; name?: string; where?: string[] }
  | { t: "table"; head: string[]; rows: string[][]; caption?: string }
  | { t: "sim"; id: SimId; title?: string; caption?: string }
  | { t: "steps"; title?: string; intro?: string; steps: string[]; answer?: string }
  | { t: "eq"; lines: string[]; caption?: string }
  | { t: "compare"; left: { title: string; items: string[] }; right: { title: string; items: string[] } };

/** How heavily the board tests this. Drives badges and the "most-asked" filter. */
export type Importance = "high" | "medium" | "low";

export type Quiz = {
  q: string;
  options: string[];
  answer: number;
  why: string;
  importance?: Importance;
  years?: string;   // e.g. "2023, 2020, 2018" — years this has appeared in the board paper
};
export type Flashcard = { q: string; a: string };
export type FormulaRef = { name: string; expr: string; note?: string };

/** A written (subjective) board-style question, 1-5 marks, with a model answer. */
export type WrittenQ = {
  q: string;
  marks: number;
  answer: string;                                     // model answer (HTML)
  kind?: "short" | "long" | "numerical" | "diagram";  // defaults to short/long by marks
  importance?: Importance;
  years?: string;
  hint?: string;
};

/**
 * Assertion-Reason — the standard CBSE four-option format. The options are
 * fixed and rendered by the component; `answer` indexes into them:
 *   0  Both A and R true, and R is the correct explanation of A
 *   1  Both A and R true, but R is not the correct explanation of A
 *   2  A is true but R is false
 *   3  A is false but R is true
 */
export type AssertionReasonQ = {
  assertion: string;
  reason: string;
  answer: 0 | 1 | 2 | 3;
  why: string;
  importance?: Importance;
  years?: string;
};

/** Case- / source-based question: a passage, source or data set with sub-parts. */
export type CaseStudyQ = {
  title?: string;
  source: string;      // the passage / source / data (HTML)
  caption?: string;
  parts: { q: string; marks?: number; answer: string }[];
  importance?: Importance;
  years?: string;
};

/** A syllabus topic tagged with how heavily the board weights it. */
export type KeyTopic = { name: string; importance: Importance; note?: string };

/** A unit / theme within a subject. Each subject defines its own set. */
export type UnitMeta = {
  name: string;      // full syllabus name of the unit
  short: string;     // label used in the UI
  marks: string;     // e.g. "25 marks"
  marksValue: number;// numeric, for the marks-split bar
  hue: string;       // any CSS colour; tints are derived from it
};

/** Unit keys are plain strings so a new subject never has to edit a shared type. */
export type UnitKey = string;

export type Chapter = {
  slug: string;
  num: number;
  title: string;
  unit: UnitKey;
  unitName: string;
  marks: string;
  formative?: boolean;
  formativeLabel?: string;   // short badge text, e.g. "project work"; defaults to "formative only"
  minutes: number;
  blurb: string;
  bigIdea: string;
  syllabus: string[];
  blocks: Block[];
  formulas?: FormulaRef[];
  examFocus: string[];
  flashcards: Flashcard[];
  quiz: Quiz[];

  // ---- exam practice (all optional; chapters are filled in progressively) ----
  keyTopics?: KeyTopic[];            // syllabus topics rated by board weightage
  written?: WrittenQ[];              // 1-5 mark subjective questions with model answers
  assertionReason?: AssertionReasonQ[];
  caseStudies?: CaseStudyQ[];
};

export type Subject = {
  slug: string;              // URL segment, e.g. "science"
  name: string;              // "Science"
  tagline: string;           // one line shown on the library card
  headline: string;          // big line on the subject home page
  intro: string;             // paragraph under the headline
  className: string;         // "Class X"
  board: string;             // "CBSE"
  session: string;           // "2026-27"
  accent: string;            // subject accent colour
  paperMarks: number;        // theory marks, for the split bar (e.g. 80)
  paperNote: string;         // one line about the paper pattern
  status: "live" | "planned";
  units: Record<UnitKey, UnitMeta>;
  unitOrder: UnitKey[];
  chapters: Chapter[];
};
