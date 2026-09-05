import type { Subject } from "./types";

/**
 * Runs at module load in content/index.ts, so a badly-formed subject fails the
 * build with a readable message instead of shipping broken pages.
 */
export function validateSubjects(subjects: Subject[]) {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const s of subjects) {
    if (seen.has(s.slug)) problems.push(`Duplicate subject slug "${s.slug}"`);
    seen.add(s.slug);
    if (!/^[a-z0-9-]+$/.test(s.slug)) problems.push(`Subject slug "${s.slug}" must be lowercase kebab-case`);
    if (s.status !== "live") continue;

    if (!s.chapters.length) problems.push(`Subject "${s.slug}" is live but has no chapters`);
    for (const uk of s.unitOrder) {
      if (!s.units[uk]) problems.push(`Subject "${s.slug}": unitOrder lists "${uk}" but units has no such key`);
    }

    const slugs = new Set<string>();
    for (const c of s.chapters) {
      const at = `${s.slug}/${c.slug}`;
      if (slugs.has(c.slug)) problems.push(`Duplicate chapter slug "${at}"`);
      slugs.add(c.slug);
      if (!/^[a-z0-9-]+$/.test(c.slug)) problems.push(`${at}: chapter slug must be lowercase kebab-case`);
      if (!s.units[c.unit]) problems.push(`${at}: unit "${c.unit}" is not defined in this subject's units`);
      if (!s.unitOrder.includes(c.unit)) problems.push(`${at}: unit "${c.unit}" is missing from unitOrder, so the chapter will not be listed`);
      if (!c.blocks.length) problems.push(`${at}: has no content blocks`);
      if (!c.quiz.length) problems.push(`${at}: has no quiz questions`);
      if (!c.flashcards.length) problems.push(`${at}: has no flashcards`);
      c.quiz.forEach((q, i) => {
        if (q.options.length < 2) problems.push(`${at}: quiz Q${i + 1} needs at least two options`);
        if (q.answer < 0 || q.answer >= q.options.length) {
          problems.push(`${at}: quiz Q${i + 1} answer index ${q.answer} is out of range (0-${q.options.length - 1})`);
        }
        if (!q.why?.trim()) problems.push(`${at}: quiz Q${i + 1} has no explanation`);
      });

      (c.written ?? []).forEach((w, i) => {
        if (!w.q?.trim()) problems.push(`${at}: written Q${i + 1} has no question text`);
        if (!w.answer?.trim()) problems.push(`${at}: written Q${i + 1} has no model answer`);
        if (!(w.marks >= 1 && w.marks <= 5)) problems.push(`${at}: written Q${i + 1} marks ${w.marks} must be 1-5`);
      });
      (c.assertionReason ?? []).forEach((a, i) => {
        if (!a.assertion?.trim() || !a.reason?.trim()) problems.push(`${at}: assertion-reason Q${i + 1} needs both an assertion and a reason`);
        if (a.answer < 0 || a.answer > 3) problems.push(`${at}: assertion-reason Q${i + 1} answer ${a.answer} must be 0-3`);
        if (!a.why?.trim()) problems.push(`${at}: assertion-reason Q${i + 1} has no explanation`);
      });
      (c.caseStudies ?? []).forEach((cs, i) => {
        if (!cs.source?.trim()) problems.push(`${at}: case study ${i + 1} has no source passage`);
        if (!cs.parts?.length) problems.push(`${at}: case study ${i + 1} has no sub-questions`);
        (cs.parts ?? []).forEach((p, j) => {
          if (!p.q?.trim()) problems.push(`${at}: case study ${i + 1} part ${j + 1} has no question`);
          if (!p.answer?.trim()) problems.push(`${at}: case study ${i + 1} part ${j + 1} has no answer`);
        });
      });
    }
  }

  if (problems.length) {
    throw new Error(
      `Content validation failed (${problems.length} problem${problems.length === 1 ? "" : "s"}):\n  - ` +
      problems.join("\n  - ")
    );
  }
}
