export type NoteKind = "idea" | "real" | "exam" | "trap" | "why" | "memory";

export type Block =
  | { t: "h"; text: string; id?: string }
  | { t: "p"; html: string }
  | { t: "list"; items: string[]; ordered?: boolean }
  | { t: "note"; kind: NoteKind; title?: string; html: string }
  | { t: "formula"; expr: string; name?: string; where?: string[] }
  | { t: "table"; head: string[]; rows: string[][]; caption?: string }
  | { t: "sim"; id: string; title?: string; caption?: string }
  | { t: "steps"; title?: string; intro?: string; steps: string[]; answer?: string }
  | { t: "eq"; lines: string[]; caption?: string }
  | { t: "compare"; left: { title: string; items: string[] }; right: { title: string; items: string[] } };

export type Quiz = {
  q: string;
  options: string[];
  answer: number;
  why: string;
};

export type Flashcard = { q: string; a: string };

export type FormulaRef = { name: string; expr: string; note?: string };

export type UnitKey = "chemistry" | "biology" | "light" | "current" | "environment";

export type Chapter = {
  slug: string;
  num: number;
  title: string;
  unit: UnitKey;
  unitName: string;
  marks: string;
  formative?: boolean;
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
  slug: string;
  name: string;
  className: string;
  board: string;
  session: string;
  chapters: Chapter[];
};
