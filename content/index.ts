import type { Subject } from "@/lib/types";
import { SCIENCE } from "./science";
import { MATHEMATICS } from "./mathematics";
import { SOCIAL_SCIENCE } from "./social-science";
import { ARTIFICIAL_INTELLIGENCE } from "./artificial-intelligence";
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
  SOCIAL_SCIENCE,
  ARTIFICIAL_INTELLIGENCE,
];

validateSubjects(SUBJECTS);

export const LIVE_SUBJECTS = SUBJECTS.filter((s) => s.status === "live");

export function getSubject(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

export function getLiveSubject(slug: string): Subject | undefined {
  return LIVE_SUBJECTS.find((s) => s.slug === slug);
}

/**
 * Helper for stubbing a subject that is announced but not written yet.
 * Add `planned("history-optional", ...)` to SUBJECTS to show a "coming soon"
 * card whose URL will not change when the real content lands.
 */
export function planned(slug: string, name: string, tagline: string, accent: string): Subject {
  return {
    slug, name, tagline,
    headline: `${name}, made obvious.`,
    intro: "Not built yet.",
    className: "Class X", board: "CBSE", session: "2026-27",
    accent, paperMarks: 80, paperNote: "", status: "planned",
    units: {}, unitOrder: [], chapters: [],
  };
}
