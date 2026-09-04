import type { UnitMeta, UnitKey } from "@/lib/types";

export const SCIENCE_UNITS: Record<UnitKey, UnitMeta> = {
  chemistry: {
    name: "Chemical Substances — Nature and Behaviour",
    short: "Chemistry", marks: "25 marks", marksValue: 25, hue: "#8b5cf6",
  },
  biology: {
    name: "World of the Living",
    short: "Biology", marks: "25 marks", marksValue: 25, hue: "#10b981",
  },
  light: {
    name: "Natural Phenomena — Light and Optics",
    short: "Light", marks: "12 marks", marksValue: 12, hue: "#f59e0b",
  },
  current: {
    name: "How Things Work — Effects of Current",
    short: "Electricity", marks: "13 marks", marksValue: 13, hue: "#0ea5e9",
  },
  environment: {
    name: "Natural Resources — Environment",
    short: "Environment", marks: "5 marks", marksValue: 5, hue: "#14b8a6",
  },
};

export const SCIENCE_UNIT_ORDER: UnitKey[] = ["chemistry", "biology", "light", "current", "environment"];
