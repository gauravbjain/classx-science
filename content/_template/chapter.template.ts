/**
 * TEMPLATE for one chapter. Copy to content/<subject>/chNN.ts.
 * Every field below is real — delete the ones you do not need.
 */
import type { Chapter } from "@/lib/types";

export const chNN: Chapter = {
  slug: "kebab-case-url",          // becomes /<subject>/kebab-case-url — do not change once published
  num: 1,
  title: "Chapter title",
  unit: "algebra",                 // must be a key in the subject's UNITS
  unitName: "Algebra",
  marks: "Unit I · 20 marks",
  formative: false,                // true adds a "not in the year-end paper" badge
  minutes: 20,
  blurb: "One sentence for the chapter card.",
  bigIdea: "The single sentence that, if he remembers nothing else, is worth remembering.",
  syllabus: ["Sub-topic as printed in the curriculum", "Another one"],

  blocks: [
    { t: "h", text: "A section heading" },                    // also builds the table of contents
    { t: "p", html: "A paragraph. <strong>HTML</strong> is allowed." },
    { t: "list", items: ["A bullet", "Another"], ordered: false },
    { t: "note", kind: "idea", html: "A coloured callout." },
    // kinds: idea | real | exam | trap | why | memory
    { t: "formula", name: "Name", expr: "a² + b² = c²", where: ["a, b = legs", "c = hypotenuse"] },
    { t: "eq", lines: ["2H₂ + O₂ → 2H₂O"], caption: "Optional caption." },
    { t: "table", head: ["Column", "Column"], rows: [["cell", "cell"]] },
    { t: "compare",
      left:  { title: "This", items: ["point", "point"] },
      right: { title: "That", items: ["point", "point"] } },
    { t: "sim", id: "punnett-square" },                       // id must exist in lib/sim-ids.ts
    { t: "steps",
      title: "A worked example",
      intro: "Optional lead-in.",
      steps: ["Step one", "Step two"],
      answer: "The final answer." },
  ],

  formulas: [{ name: "Name", expr: "a² + b² = c²", note: "Optional note." }],
  examFocus: ["What to revise if there is no time for anything else."],
  flashcards: [{ q: "Question?", a: "Answer." }],
  quiz: [
    {
      q: "Question text (HTML allowed)?",
      options: ["A", "B", "C", "D"],
      answer: 1,                    // zero-based index into options
      why: "Why that is right — shown after he answers, right or wrong.",
    },
  ],
};
