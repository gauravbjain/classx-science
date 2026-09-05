import type { UnitMeta, UnitKey } from "@/lib/types";

export const SST_UNITS: Record<UnitKey, UnitMeta> = {
  history:   { name: "India and the Contemporary World — II", short: "History",   marks: "20 marks", marksValue: 20, hue: "#b45309" },
  geography: { name: "Contemporary India — II",               short: "Geography", marks: "20 marks", marksValue: 20, hue: "#059669" },
  civics:    { name: "Democratic Politics — II",              short: "Civics",    marks: "20 marks", marksValue: 20, hue: "#2563eb" },
  economics: { name: "Understanding Economic Development",    short: "Economics", marks: "20 marks", marksValue: 20, hue: "#c026d3" },
};

export const SST_UNIT_ORDER: UnitKey[] = ["history", "geography", "civics", "economics"];
