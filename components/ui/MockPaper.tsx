"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Subject, Quiz, AssertionReasonQ, WrittenQ, CaseStudyQ } from "@/lib/types";
import { recordAnswer } from "@/lib/progress";

const AR_OPTIONS = [
  "Both A and R are true, and R is the correct explanation of A.",
  "Both A and R are true, but R is not the correct explanation of A.",
  "A is true but R is false.",
  "A is false but R is true.",
];

type MCQItem = { type: "mcq"; slug: string; index: number; q: Quiz; ch: string };
type ARItem = { type: "ar"; slug: string; index: number; q: AssertionReasonQ; ch: string };
type WrItem = { type: "wr"; q: WrittenQ; ch: string };
type CaseItem = { type: "case"; q: CaseStudyQ; ch: string };

// CBSE-style 80-mark blueprint
const BP = { mcq: 16, ar: 4, m2: 6, m3: 7, m5: 3, cases: 3 };

function shuffle<T>(a: T[]): T[] {
  const x = [...a];
  for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; }
  return x;
}
function fmt(s: number) {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function buildPaper(subject: Subject) {
  const mcqs: MCQItem[] = [], ars: ARItem[] = [], written: WrItem[] = [], cases: CaseItem[] = [];
  for (const c of subject.chapters) {
    c.quiz.forEach((q, i) => mcqs.push({ type: "mcq", slug: c.slug, index: i, q, ch: c.title }));
    (c.assertionReason ?? []).forEach((q, i) => ars.push({ type: "ar", slug: c.slug, index: i, q, ch: c.title }));
    (c.written ?? []).forEach((q) => written.push({ type: "wr", q, ch: c.title }));
    (c.caseStudies ?? []).forEach((q) => cases.push({ type: "case", q, ch: c.title }));
  }
  const byMarks = (n: number, count: number, used: Set<WrItem>) => {
    let pool = shuffle(written.filter((w) => w.q.marks === n && !used.has(w)));
    if (pool.length < count) pool = pool.concat(shuffle(written.filter((w) => Math.abs(w.q.marks - n) <= 1 && !used.has(w) && !pool.includes(w))));
    const pick = pool.slice(0, count);
    pick.forEach((w) => used.add(w));
    return pick;
  };
  const used = new Set<WrItem>();
  return {
    sectionA: [...shuffle(mcqs).slice(0, BP.mcq), ...shuffle(ars).slice(0, BP.ar)] as (MCQItem | ARItem)[],
    sectionB: byMarks(2, BP.m2, used),
    sectionC: byMarks(3, BP.m3, used),
    sectionD: byMarks(5, BP.m5, used),
    sectionE: shuffle(cases).slice(0, BP.cases),
  };
}

export default function MockPaper({ subject }: { subject: Subject }) {
  const [seed, setSeed] = useState(0);
  const [phase, setPhase] = useState<"intro" | "running" | "done">("intro");
  const [left, setLeft] = useState(3 * 3600);
  const [picks, setPicks] = useState<Record<string, number>>({}); // Section A answers, key = "a<idx>"
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const paper = useMemo(() => buildPaper(subject), [subject, seed]);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  function start() {
    setPhase("running"); setLeft(3 * 3600); setPicks({});
    timer.current = setInterval(() => {
      setLeft((t) => {
        if (t <= 1) { clearInterval(timer.current!); submit(); return 0; }
        return t - 1;
      });
    }, 1000);
  }
  function submit() {
    if (timer.current) clearInterval(timer.current);
    // score + feed Section A answers into progress (weak spots, streak, XP)
    paper.sectionA.forEach((it, i) => {
      const picked = picks[`a${i}`];
      if (picked === undefined) return;
      const correct = it.type === "mcq" ? picked === it.q.answer : picked === it.q.answer;
      recordAnswer(subject.slug, it.slug, it.type === "mcq" ? "q" : "ar", it.index, correct);
    });
    setPhase("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function regenerate() { setSeed((s) => s + 1); setPhase("intro"); setLeft(3 * 3600); setPicks({}); }

  const scoreA = phase === "done"
    ? paper.sectionA.reduce((n, it, i) => n + (picks[`a${i}`] === it.q.answer ? 1 : 0), 0)
    : 0;
  const attempted = Object.keys(picks).length;
  const reveal = phase === "done";

  // Mock papers are calibrated to the 80-mark board subjects. Skill subjects
  // (e.g. AI, 50 marks) have a different pattern, so we don't fake one here.
  if (subject.paperMarks !== 80) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <div className="text-[2rem]">📝</div>
        <h1 className="mt-3 text-[1.6rem] font-semibold tracking-tight">No mock paper for {subject.name} yet</h1>
        <p className="mx-auto mt-3 max-w-md text-[0.95rem] muted">
          {subject.name} follows a different exam pattern from the 80-mark subjects, so a mock paper isn’t set up for it.
          Use the chapter quizzes and the Practice tab to prepare.
        </p>
        <Link href={`/${subject.slug}/revise`} className="mt-5 inline-block rounded-full bg-[var(--accent)] px-6 py-2.5 text-[13px] font-semibold text-white">
          Go to revise →
        </Link>
      </div>
    );
  }

  // ---- intro ----
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="text-[2rem] font-semibold tracking-tight sm:text-[2.5rem]">{subject.name} — Mock Board Paper</h1>
        <p className="mt-3 font-serif text-[1.1rem] muted">A full 80-mark paper, built fresh to the CBSE pattern, with a 3-hour clock. Sit it like the real thing.</p>
        <div className="mt-6 rounded-2xl border hairline p-5 text-[0.95rem]">
          <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">The paper</div>
          <ul className="mt-3 space-y-1.5 muted">
            <li><strong>Section A</strong> — 20 questions × 1 mark (MCQ &amp; assertion–reason)</li>
            <li><strong>Section B</strong> — 6 questions × 2 marks</li>
            <li><strong>Section C</strong> — 7 questions × 3 marks</li>
            <li><strong>Section D</strong> — 3 questions × 5 marks</li>
            <li><strong>Section E</strong> — 3 case-based questions × 4 marks</li>
            <li className="pt-1 font-semibold" style={{ color: subject.accent }}>Total — 80 marks · 3 hours</li>
          </ul>
          <p className="mt-4 text-[0.88rem] faint">Section A is marked automatically. For the rest, write your answers on paper, then reveal the marking scheme and grade yourself. Wrong Section-A answers go to your mistake bank.</p>
        </div>
        <button onClick={start} className="mt-6 rounded-full bg-[var(--accent)] px-7 py-3 text-[14px] font-semibold text-white">
          Start the paper →
        </button>
      </div>
    );
  }

  const lowTime = left < 300;

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24">
      {/* sticky timer bar */}
      <div className="no-print sticky top-[96px] sm:top-[60px] z-30 -mx-5 mb-6 border-b hairline bg-[var(--bg)]/95 px-5 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[1.05rem] font-bold tabular-nums" style={{ color: lowTime && phase === "running" ? "#e11d48" : "var(--ink)" }}>
            ⏱ {fmt(left)}
          </span>
          <span className="text-[12px] faint">{phase === "running" ? `${attempted}/20 in Section A` : "Submitted"}</span>
          <div className="ml-auto flex gap-2">
            {phase === "running" && (
              <button onClick={submit} className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-[13px] font-semibold text-white">Submit paper</button>
            )}
            {phase === "done" && (
              <>
                <button onClick={() => window.print()} className="rounded-full border hairline px-4 py-1.5 text-[13px] font-medium hover:bg-[var(--surface-2)]">Print</button>
                <button onClick={regenerate} className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-[13px] font-semibold text-white">New paper</button>
              </>
            )}
          </div>
        </div>
      </div>

      {reveal && (
        <div className="mb-8 rounded-2xl bg-emerald-500/8 p-6 text-center fade-up">
          <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Section A (auto-marked)</div>
          <div className="mt-1 text-[2.6rem] font-bold tabular-nums">{scoreA}<span className="faint text-[1.4rem]">/20</span></div>
          <p className="mt-1 text-[0.9rem] muted">Now self-mark Sections B–E against the schemes below, out of 60, and add it on.</p>
        </div>
      )}

      {/* Section A */}
      <Section title="Section A" note="20 × 1 mark — choose the correct option">
        {paper.sectionA.map((it, i) => {
          const key = `a${i}`, picked = picks[key];
          const options = it.type === "mcq" ? it.q.options : AR_OPTIONS;
          return (
            <div key={key} className="card p-4">
              <div className="flex gap-2 text-[0.95rem]">
                <span className="font-semibold faint">{i + 1}.</span>
                <div className="min-w-0 flex-1">
                  {it.type === "ar" ? (
                    <div className="space-y-1">
                      <p><span className="font-semibold">Assertion: </span><span dangerouslySetInnerHTML={{ __html: it.q.assertion }} /></p>
                      <p><span className="font-semibold">Reason: </span><span dangerouslySetInnerHTML={{ __html: it.q.reason }} /></p>
                    </div>
                  ) : (
                    <p className="font-medium" dangerouslySetInnerHTML={{ __html: it.q.q }} />
                  )}
                  <div className="mt-2.5 space-y-1.5">
                    {options.map((o, k) => {
                      const chosen = picked === k, isAns = k === it.q.answer;
                      let cls = "border hairline hover:border-[var(--accent)]";
                      if (reveal) cls = isAns ? "border-emerald-500/60 bg-emerald-500/10" : chosen ? "border-rose-500/60 bg-rose-500/10" : "border hairline opacity-55";
                      else if (chosen) cls = "border-[var(--accent)] bg-[var(--accent)]/8";
                      return (
                        <button key={k} disabled={reveal}
                          onClick={() => setPicks((p) => ({ ...p, [key]: k }))}
                          className={`flex w-full gap-2.5 rounded-lg border px-3 py-2 text-left text-[0.9rem] transition ${cls}`}>
                          <span className="font-bold faint">{String.fromCharCode(65 + k)}</span>
                          <span dangerouslySetInnerHTML={{ __html: o }} />
                        </button>
                      );
                    })}
                  </div>
                  {reveal && <p className="mt-2 text-[0.85rem] muted"><span className="font-semibold">Why: </span><span dangerouslySetInnerHTML={{ __html: it.q.why }} /></p>}
                </div>
              </div>
            </div>
          );
        })}
      </Section>

      <SubjectiveSection title="Section B" note="6 × 2 marks" items={paper.sectionB} reveal={reveal} start={20} />
      <SubjectiveSection title="Section C" note="7 × 3 marks" items={paper.sectionC} reveal={reveal} start={26} />
      <SubjectiveSection title="Section D" note="3 × 5 marks" items={paper.sectionD} reveal={reveal} start={33} />

      {/* Section E — case based */}
      <Section title="Section E" note="3 case-based questions × 4 marks">
        {paper.sectionE.map((it, i) => (
          <div key={i} className="card p-5">
            <div className="text-[11px] faint">Q{36 + i} · {it.ch}</div>
            {it.q.title && <p className="mt-1 text-[0.95rem] font-semibold">{it.q.title}</p>}
            <div className="rich mt-2 rounded-xl border-l-2 border-[var(--accent)] bg-[var(--surface-2)] px-4 py-3 text-[0.9rem] leading-relaxed muted" dangerouslySetInnerHTML={{ __html: it.q.source }} />
            <ol className="mt-3 space-y-2.5">
              {it.q.parts.map((p, j) => (
                <li key={j}>
                  <span className="text-[0.92rem]"><span className="font-medium">({String.fromCharCode(97 + j)}) </span><span dangerouslySetInnerHTML={{ __html: p.q }} />{p.marks ? <span className="faint"> [{p.marks}]</span> : null}</span>
                  {reveal && <div className="rich mt-1.5 rounded-lg bg-emerald-500/8 px-3 py-2 text-[0.88rem]" dangerouslySetInnerHTML={{ __html: p.answer }} />}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </Section>

      {reveal && (
        <div className="mt-10 rounded-2xl border hairline p-6 text-center">
          <p className="text-[0.95rem] muted">Add your Section A score ({scoreA}/20) to your self-marked total for B–E to get your paper out of 80.</p>
          <button onClick={regenerate} className="mt-4 rounded-full bg-[var(--accent)] px-6 py-2.5 text-[13px] font-semibold text-white">Try a fresh paper</button>
        </div>
      )}
    </div>
  );
}

function Section({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <div className="flex items-baseline gap-3 border-b hairline pb-2">
        <h2 className="text-[1.25rem] font-semibold tracking-tight">{title}</h2>
        <span className="text-[12px] faint">{note}</span>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function SubjectiveSection({ title, note, items, reveal, start }: {
  title: string; note: string; items: { q: WrittenQ; ch: string }[]; reveal: boolean; start: number;
}) {
  return (
    <Section title={title} note={note}>
      {items.map((it, i) => (
        <div key={i} className="card p-5">
          <div className="flex items-baseline gap-2">
            <span className="font-semibold faint">{start + i}.</span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.98rem] font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: it.q.q }} />
              <div className="mt-1 text-[11px] faint">{it.ch} · [{it.q.marks}]</div>
              {reveal && (
                <div className="rich mt-3 rounded-xl bg-emerald-500/8 px-4 py-3 text-[0.9rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: it.q.answer }} />
              )}
            </div>
          </div>
        </div>
      ))}
    </Section>
  );
}
