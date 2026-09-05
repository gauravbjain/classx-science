import type { Subject } from "@/lib/types";
import { SST_UNITS, SST_UNIT_ORDER } from "./units";
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
import { ch16 } from "./ch16";
import { ch17 } from "./ch17";
import { ch18 } from "./ch18";
import { ch19 } from "./ch19";
import { ch20 } from "./ch20";
import { ch21 } from "./ch21";
import { ch22 } from "./ch22";

export const SOCIAL_SCIENCE: Subject = {
  slug: "social-science",
  name: "Social Science",
  tagline: "History, geography, civics and economics, tied to how India actually works.",
  headline: "Social Science, made obvious.",
  intro:
    "All four books in one place — with timelines you can scrub, a map you can test yourself on, " +
    "and the case studies the board keeps coming back to.",
  className: "Class X",
  board: "CBSE",
  session: "2026-27",
  accent: "#0ea5e9",
  paperMarks: 80,
  paperNote:
    "Theory paper is 80 marks in 3 hours, plus 20 marks of internal assessment. The four books carry " +
    "20 marks each. Map work comes from Geography and History. Two chapters sit outside the written " +
    "paper — History's Age of Industrialisation is periodic assessment only, and Economics' Consumer " +
    "Rights is project work — both are marked here so you know where they stand.",
  status: "live",
  units: SST_UNITS,
  unitOrder: SST_UNIT_ORDER,
  chapters: [
    ch01, ch02, ch03, ch04, ch05,
    ch06, ch07, ch08, ch09, ch10, ch11, ch12,
    ch13, ch14, ch15, ch16, ch17,
    ch18, ch19, ch20, ch21, ch22,
  ],
};
