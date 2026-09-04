import type { Subject } from "@/lib/types";
import { MATHS_UNITS, MATHS_UNIT_ORDER } from "./units";
import { ch01 } from "./ch01";
import { ch02 } from "./ch02";
import { ch03 } from "./ch03";
import { ch04 } from "./ch04";
import { ch05 } from "./ch05";
import { ch06 } from "./ch06";
import { ch07 } from "./ch07";
import { ch08 } from "./ch08";
import { ch09 } from "./ch09";
import { ch10 } from "./ch10";
import { ch11 } from "./ch11";
import { ch12 } from "./ch12";
import { ch13 } from "./ch13";
import { ch14 } from "./ch14";

export const MATHEMATICS: Subject = {
  slug: "mathematics",
  name: "Mathematics",
  tagline: "Algebra, geometry, trigonometry and statistics — with graphs and figures you can drag.",
  headline: "Maths, made obvious.",
  intro:
    "Every chapter of the syllabus, with the proofs the board actually asks for and worked examples " +
    "you can attempt before the solution appears.",
  className: "Class X",
  board: "CBSE",
  session: "2026-27",
  accent: "#f43f5e",
  paperMarks: 80,
  paperNote:
    "Theory paper is 80 marks in 3 hours, plus 20 marks of internal assessment. The syllabus is " +
    "identical for Standard (041) and Basic (241) — only the difficulty of the question paper differs, " +
    "so everything here applies to both.",
  status: "live",
  units: MATHS_UNITS,
  unitOrder: MATHS_UNIT_ORDER,
  chapters: [ch01, ch02, ch03, ch04, ch05, ch06, ch07, ch08, ch09, ch10, ch11, ch12, ch13, ch14],
};
