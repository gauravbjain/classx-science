import type { Subject } from "@/lib/types";
import { SCIENCE_UNITS, SCIENCE_UNIT_ORDER } from "./units";
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
import { ch15 } from "./ch15";

export const SCIENCE: Subject = {
  slug: "science",
  name: "Science",
  tagline: "Chemistry, Biology and Physics — with things you can pull, drag and break.",
  headline: "Science, made obvious.",
  intro:
    "Every chapter of the syllabus, explained the way it should have been the first time — " +
    "with things you can pull, drag and break until the idea clicks.",
  className: "Class X",
  board: "CBSE",
  session: "2026-27",
  accent: "#6d4aff",
  paperMarks: 80,
  paperNote:
    "Theory paper is 80 marks in 3 hours, plus 20 marks of internal assessment. Roughly half the " +
    "paper tests knowledge and understanding, 30% application, and 20% analysis and reasoning — " +
    "which is why the \u201cwhy does this happen\u201d boxes matter as much as the definitions.",
  status: "live",
  units: SCIENCE_UNITS,
  unitOrder: SCIENCE_UNIT_ORDER,
  chapters: [ch01, ch02, ch03, ch04, ch05, ch06, ch07, ch08, ch09, ch10, ch11, ch12, ch13, ch14, ch15],
};
