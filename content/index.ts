import type { Subject } from "@/lib/types";
import { SCIENCE } from "./science";
import { MATHEMATICS } from "./mathematics";
import { validateSubjects } from "@/lib/validate";

/**
 * THE SUBJECT REGISTRY.
 *
 * To add a subject: build it under content/<slug>/ following the Subject type,
 * import it here, and add it to this array. Nothing else needs to change —
 * routes, navigation, the marks bar and progress tracking are all driven by
 * this list. See docs/ADDING-A-SUBJECT.md.
 */
export const SUBJECTS: Subject[] = [
  SCIENCE,
  MATHEMATICS,
  // Placeholders so the site shows what is coming. Replace each with a real
  // Subject import when its content is ready — the slug stays the same, so the
  // URL never changes.
  planned("social-science", "Social Science", "History, geography, civics and economics, tied to how India actually works.", "#0ea5e9"),
];

validateSubjects(SUBJECTS);

export const LIVE_SUBJECTS = SUBJECTS.filter((s) => s.status === "live");

export function getSubject(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

export function getLiveSubject(slug: string): Subject | undefined {
  return LIVE_SUBJECTS.find((s) => s.slug === slug);
}

function planned(slug: string, name: string, tagline: string, accent: string): Subject {
  return {
    slug, name, tagline,
    headline: `${name}, made obvious.`,
    intro: "Not built yet.",
    className: "Class X", board: "CBSE", session: "2026-27",
    accent, paperMarks: 80, paperNote: "", status: "planned",
    units: {}, unitOrder: [], chapters: [],
  };
}
