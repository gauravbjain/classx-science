"use client";
import { useMemo, useState, type ReactNode } from "react";
import type { Chapter, Importance, WrittenQ, AssertionReasonQ, CaseStudyQ } from "@/lib/types";

const AR_OPTIONS = [
  "Both A and R are true, and R is the correct explanation of A.",
  "Both A and R are true, but R is not the correct explanation of A.",
  "A is true but R is false.",
  "A is false but R is true.",
];

const RANK: Record<Importance, number> = { high: 0, medium: 1, low: 2 };

export function ImportanceBadge({ level }: { level?: Importance }) {
  if (!level) return null;
  const map: Record<Importance, { label: string; cls: string }> = {
    high: { label: "High-weightage", cls: "bg-rose-500/12 text-rose-700 dark:text-rose-300" },
    medium: { label: "Common", cls: "bg-amber-500/12 text-amber-700 dark:text-amber-300" },
    low: { label: "Occasional", cls: "bg-slate-500/12 text-slate-600 dark:text-slate-300" },
  };
  const { label, cls } = map[level];
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{label}</span>;
}

function MarksTag({ marks }: { marks: number }) {
  return (
    <span className="rounded-full border hairline px-2 py-0.5 text-[10px] font-semibold faint">
      {marks} mark{marks === 1 ? "" : "s"}
    </span>
  );
}

function Years({ years }: { years?: string }) {
  if (!years) return null;
  return <span className="text-[10px] faint">Asked: {years}</span>;
}

function Reveal({ label = "Show model answer", children }: { label?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full border hairline px-3.5 py-1.5 text-[12px] font-medium transition hover:bg-[var(--surface-2)]"
      >
        {open ? "Hide answer" : label}
      </button>
      {open && <div className="mt-3 fade-up">{children}</div>}
    </div>
  );
}

export function WrittenCard({ w, n, chapter }: { w: WrittenQ; n: number; chapter?: string }) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] faint">Q{n}</span>
        {chapter && <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium muted">{chapter}</span>}
        <MarksTag marks={w.marks} />
        {w.kind && w.kind !== "short" && w.kind !== "long" && (
          <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-semibold muted capitalize">{w.kind}</span>
        )}
        <ImportanceBadge level={w.importance} />
        <span className="ml-auto"><Years years={w.years} /></span>
      </div>
      <p className="mt-2.5 text-[1rem] font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: w.q }} />
      {w.hint && <p className="mt-1.5 text-[0.85rem] faint">Hint: <span dangerouslySetInnerHTML={{ __html: w.hint }} /></p>}
      <Reveal>
        <div className="rich rounded-xl bg-emerald-500/8 px-4 py-3 text-[0.92rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: w.answer }} />
      </Reveal>
    </div>
  );
}

export function ARCard({ ar, n, chapter }: { ar: AssertionReasonQ; n: number; chapter?: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] faint">Assertion–Reason {n}</span>
        {chapter && <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium muted">{chapter}</span>}
        <ImportanceBadge level={ar.importance} />
        <span className="ml-auto"><Years years={ar.years} /></span>
      </div>
      <div className="mt-2.5 space-y-1.5 text-[0.95rem] leading-relaxed">
        <p><span className="font-semibold">Assertion (A): </span><span dangerouslySetInnerHTML={{ __html: ar.assertion }} /></p>
        <p><span className="font-semibold">Reason (R): </span><span dangerouslySetInnerHTML={{ __html: ar.reason }} /></p>
      </div>
      <div className="mt-3 space-y-2">
        {AR_OPTIONS.map((o, k) => {
          const chosen = picked === k;
          const isAns = k === ar.answer;
          let cls = "border hairline hover:border-[var(--accent)] hover:bg-[var(--surface-2)]";
          if (picked !== null) {
            if (isAns) cls = "border-emerald-500/60 bg-emerald-500/10";
            else if (chosen) cls = "border-rose-500/60 bg-rose-500/10";
            else cls = "border hairline opacity-55";
          }
          return (
            <button key={k} onClick={() => picked === null && setPicked(k)} disabled={picked !== null}
              className={`flex w-full gap-3 rounded-xl border px-4 py-2.5 text-left text-[0.9rem] transition ${cls}`}>
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[11px] font-bold">
                {String.fromCharCode(65 + k)}
              </span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-3 rounded-xl bg-amber-500/10 px-4 py-3 text-[0.9rem] fade-up">
          <span className="font-semibold">{picked === ar.answer ? "Correct. " : "Not quite. "}</span>
          <span dangerouslySetInnerHTML={{ __html: ar.why }} />
        </div>
      )}
    </div>
  );
}

export function CaseCard({ cs, n, chapter }: { cs: CaseStudyQ; n: number; chapter?: string }) {
  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] faint">Case study {n}</span>
        {chapter && <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-medium muted">{chapter}</span>}
        <ImportanceBadge level={cs.importance} />
        <span className="ml-auto"><Years years={cs.years} /></span>
      </div>
      {cs.title && <p className="mt-2 text-[0.95rem] font-semibold">{cs.title}</p>}
      <div className="rich mt-2 rounded-xl border-l-2 border-[var(--accent)] bg-[var(--surface-2)] px-4 py-3 text-[0.92rem] leading-relaxed muted"
        dangerouslySetInnerHTML={{ __html: cs.source }} />
      {cs.caption && <p className="mt-1 text-[11px] faint">{cs.caption}</p>}
      <ol className="mt-4 space-y-4">
        {cs.parts.map((p, j) => (
          <li key={j}>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-[0.95rem] font-medium">({String.fromCharCode(97 + j)}) </span>
              <span className="text-[0.95rem] font-medium" dangerouslySetInnerHTML={{ __html: p.q }} />
              {p.marks ? <MarksTag marks={p.marks} /> : null}
            </div>
            <Reveal label="Show answer">
              <div className="rich rounded-xl bg-emerald-500/8 px-4 py-3 text-[0.9rem] leading-relaxed" dangerouslySetInnerHTML={{ __html: p.answer }} />
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function Practice({ ch }: { ch: Chapter }) {
  const [highOnly, setHighOnly] = useState(false);

  const written = ch.written ?? [];
  const ar = ch.assertionReason ?? [];
  const cases = ch.caseStudies ?? [];
  const keyTopics = useMemo(
    () => [...(ch.keyTopics ?? [])].sort((a, b) => RANK[a.importance] - RANK[b.importance]),
    [ch.keyTopics]
  );

  const f = <T extends { importance?: Importance }>(xs: T[]) =>
    highOnly ? xs.filter((x) => x.importance === "high") : xs;

  const w = f(written), a = f(ar), cs = f(cases);
  const nothing = w.length + a.length + cs.length === 0;

  return (
    <div className="space-y-10">
      {keyTopics.length > 0 && (
        <section className="rounded-2xl border hairline p-5">
          <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Where the marks are</div>
          <ul className="mt-3 space-y-2">
            {keyTopics.map((t, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2">
                <ImportanceBadge level={t.importance} />
                <span className="text-[0.95rem] font-medium">{t.name}</span>
                {t.note && <span className="text-[0.85rem] faint">— <span dangerouslySetInnerHTML={{ __html: t.note }} /></span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(written.some((x) => x.importance === "high") || ar.some((x) => x.importance === "high") || cases.some((x) => x.importance === "high")) && (
        <label className="no-print flex items-center gap-2 text-[13px] muted">
          <input type="checkbox" checked={highOnly} onChange={(e) => setHighOnly(e.target.checked)} className="accent-[var(--accent)]" />
          Show most-asked (high-weightage) questions only
        </label>
      )}

      {nothing && (
        <p className="rounded-xl border hairline px-4 py-6 text-center text-[0.9rem] muted">
          {highOnly ? "No high-weightage questions in this chapter — untick the filter to see the rest." : "Written practice for this chapter is being added."}
        </p>
      )}

      {w.length > 0 && (
        <section>
          <h2 className="text-[1.2rem] font-semibold tracking-tight">Board-style questions</h2>
          <p className="mt-1 text-[0.88rem] muted">Attempt it on paper first, then reveal the model answer.</p>
          <div className="mt-4 space-y-3">{w.map((x, i) => <WrittenCard key={i} w={x} n={i + 1} />)}</div>
        </section>
      )}

      {a.length > 0 && (
        <section>
          <h2 className="text-[1.2rem] font-semibold tracking-tight">Assertion &amp; Reason</h2>
          <div className="mt-4 space-y-3">{a.map((x, i) => <ARCard key={i} ar={x} n={i + 1} />)}</div>
        </section>
      )}

      {cs.length > 0 && (
        <section>
          <h2 className="text-[1.2rem] font-semibold tracking-tight">Case / source-based</h2>
          <div className="mt-4 space-y-3">{cs.map((x, i) => <CaseCard key={i} cs={x} n={i + 1} />)}</div>
        </section>
      )}
    </div>
  );
}
