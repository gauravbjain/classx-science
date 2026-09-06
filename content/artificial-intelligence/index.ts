import type { Subject } from "@/lib/types";
import { AI_UNITS, AI_UNIT_ORDER } from "./units";
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

export const ARTIFICIAL_INTELLIGENCE: Subject = {
  slug: "artificial-intelligence",
  name: "Artificial Intelligence",
  tagline: "The 6th-subject skill course (417) — what AI is, how it's built, and where it's headed.",
  headline: "Artificial Intelligence, made obvious.",
  intro:
    "CBSE's Class X skill subject (code 417), explained without the jargon — from revisiting the AI " +
    "project cycle to modelling, evaluation, computer vision and language, plus the employability " +
    "skills that round out the course.",
  className: "Class X",
  board: "CBSE",
  session: "2026-27",
  accent: "#0d9488",
  paperMarks: 50,
  paperNote:
    "As a skill subject, AI (417) is assessed out of 100: a 50-mark theory paper plus 50 marks of " +
    "practical work (Python practical file, practical exam, viva and project). The theory paper covers " +
    "Part B Subject-Specific Skills (about 40 marks) and Part A Employability Skills (about 10 marks). " +
    "Unit marks shown here are approximate — always confirm against the latest CBSE sample paper.",
  status: "live",
  units: AI_UNITS,
  unitOrder: AI_UNIT_ORDER,
  chapters: [ch01, ch02, ch03, ch04, ch05, ch06, ch07, ch08, ch09, ch10, ch11, ch12, ch13],
};
