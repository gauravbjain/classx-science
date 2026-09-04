/**
 * TEMPLATE — copy this folder to content/<your-subject>/ and edit.
 * Delete every "TODO" once filled in. See docs/ADDING-A-SUBJECT.md.
 */
import type { Subject, UnitMeta, UnitKey } from "@/lib/types";
// import { ch01 } from "./ch01";

export const UNITS: Record<UnitKey, UnitMeta> = {
  // Key can be anything; it just has to match `unit` on each chapter.
  algebra: {
    name: "Algebra",            // full syllabus name of the unit
    short: "Algebra",           // short label used in the UI
    marks: "20 marks",          // as printed in the curriculum
    marksValue: 20,             // numeric, drives the marks-split bar
    hue: "#f43f5e",             // any CSS colour; all tints derive from this
  },
};

export const UNIT_ORDER: UnitKey[] = ["algebra"];   // display order on the subject page

export const SUBJECT: Subject = {
  slug: "mathematics",                    // URL segment — /mathematics/... — never change it later
  name: "Mathematics",
  tagline: "One line for the card on the home page.",
  headline: "Maths, made obvious.",       // big line on the subject page
  intro: "A paragraph under the headline.",
  className: "Class X",
  board: "CBSE",
  session: "2026-27",
  accent: "#f43f5e",                      // subject colour, used in nav and progress bars
  paperMarks: 80,                         // theory marks — the marks bar is scaled to this
  paperNote: "One paragraph about how the paper is structured.",
  status: "live",                         // "planned" hides it behind a 'coming next' card
  units: UNITS,
  unitOrder: UNIT_ORDER,
  chapters: [/* ch01, ch02, … */],
};
