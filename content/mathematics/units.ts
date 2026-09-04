import type { UnitMeta, UnitKey } from "@/lib/types";

export const MATHS_UNITS: Record<UnitKey, UnitMeta> = {
  number:   { name: "Number Systems",           short: "Number Systems",      marks: "6 marks",  marksValue: 6,  hue: "#f43f5e" },
  algebra:  { name: "Algebra",                  short: "Algebra",             marks: "20 marks", marksValue: 20, hue: "#8b5cf6" },
  coord:    { name: "Coordinate Geometry",      short: "Coordinate Geometry", marks: "6 marks",  marksValue: 6,  hue: "#06b6d4" },
  geometry: { name: "Geometry",                 short: "Geometry",            marks: "15 marks", marksValue: 15, hue: "#10b981" },
  trig:     { name: "Trigonometry",             short: "Trigonometry",        marks: "12 marks", marksValue: 12, hue: "#f59e0b" },
  mensur:   { name: "Mensuration",              short: "Mensuration",         marks: "10 marks", marksValue: 10, hue: "#0ea5e9" },
  statprob: { name: "Statistics and Probability", short: "Statistics & Probability", marks: "11 marks", marksValue: 11, hue: "#a855f7" },
};

export const MATHS_UNIT_ORDER: UnitKey[] = [
  "number", "algebra", "coord", "geometry", "trig", "mensur", "statprob",
];
