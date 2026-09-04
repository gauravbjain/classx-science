import type { UnitKey } from "./types";

export const UNITS: Record<UnitKey, {
  name: string; short: string; marks: string;
  hue: string; tint: string; ring: string; text: string; dot: string;
}> = {
  chemistry: {
    name: "Chemical Substances — Nature and Behaviour", short: "Chemistry", marks: "25 marks",
    hue: "#8b5cf6", tint: "bg-violet-500/10", ring: "ring-violet-500/25", text: "text-violet-600 dark:text-violet-300", dot: "bg-violet-500",
  },
  biology: {
    name: "World of the Living", short: "Biology", marks: "25 marks",
    hue: "#10b981", tint: "bg-emerald-500/10", ring: "ring-emerald-500/25", text: "text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500",
  },
  light: {
    name: "Natural Phenomena — Light and Optics", short: "Light", marks: "12 marks",
    hue: "#f59e0b", tint: "bg-amber-500/10", ring: "ring-amber-500/25", text: "text-amber-600 dark:text-amber-300", dot: "bg-amber-500",
  },
  current: {
    name: "How Things Work — Effects of Current", short: "Electricity", marks: "13 marks",
    hue: "#0ea5e9", tint: "bg-sky-500/10", ring: "ring-sky-500/25", text: "text-sky-600 dark:text-sky-300", dot: "bg-sky-500",
  },
  environment: {
    name: "Natural Resources — Environment", short: "Environment", marks: "5 marks",
    hue: "#14b8a6", tint: "bg-teal-500/10", ring: "ring-teal-500/25", text: "text-teal-600 dark:text-teal-300", dot: "bg-teal-500",
  },
};
