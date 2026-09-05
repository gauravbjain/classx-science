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

export type Quiz = { q: string; options: string[]; answer: number; why: string };
export type Flashcard = { q: string; a: string };
export type FormulaRef = { name: string; expr: string; note?: string };

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
