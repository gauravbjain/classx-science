import type { UnitMeta, UnitKey } from "@/lib/types";

/**
 * Aligned to the CBSE Class X AI (417) syllabus, session 2026-27.
 * Theory paper = 50 marks: Part B subject skills (40) + Part A employability (10).
 * marksValue sums to 50 so the marks-split bar reads as the theory paper.
 */
export const AI_UNITS: Record<UnitKey, UnitMeta> = {
  basics: {
    name: "AI Foundations — revisiting the project cycle & ethics",
    short: "Foundations", marks: "≈7 marks", marksValue: 7, hue: "#0d9488",
  },
  modelling: {
    name: "Advanced Concepts of Modelling, Data & Python",
    short: "Modelling", marks: "≈11 marks", marksValue: 11, hue: "#6366f1",
  },
  evaluation: {
    name: "Evaluating Models",
    short: "Evaluation", marks: "≈10 marks", marksValue: 10, hue: "#f59e0b",
  },
  domains: {
    name: "Computer Vision & Natural Language Processing",
    short: "Domains", marks: "≈12 marks", marksValue: 12, hue: "#ec4899",
  },
  employability: {
    name: "Employability Skills (Part A)",
    short: "Employability", marks: "≈10 marks", marksValue: 10, hue: "#64748b",
  },
};

export const AI_UNIT_ORDER: UnitKey[] = ["basics", "modelling", "evaluation", "domains", "employability"];
