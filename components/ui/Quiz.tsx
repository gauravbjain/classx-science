"use client";
import { useMemo, useState } from "react";
import type { Quiz as Q } from "@/lib/types";
import { recordQuiz } from "@/lib/progress";

export default function Quiz({ items, subject, slug }: { items: Q[]; subject: string; slug: string }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [order, setOrder] = useState(() => items.map((_, k) => k));

  const q = items[order[i]];
  const correct = picked === q?.answer;

  function choose(k: number) {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.answer) setScore((s) => s + 1);
  }
  function next() {
    if (i + 1 >= items.length) {
      setDone(true);
      recordQuiz(subject, slug, score, items.length);
      return;
    }
    setI(i + 1); setPicked(null);
  }
  function restart() {
    setOrder([...items.keys()].sort(() => Math.random() - 0.5));
    setI(0); setPicked(null); setScore(0); setDone(false);
  }

  const pct = Math.round((score / items.length) * 100);

  if (done) {
    const msg = pct >= 90 ? "Excellent — this chapter is solid." : pct >= 70 ? "Good. Revisit the ones you missed and you're there." : pct >= 50 ? "Halfway. Read the explanations, then try again." : "Worth another read of the chapter before retrying.";
    return (
      <div className="card p-8 text-center">
        <div className="text-[3rem] font-bold tracking-tight">{score}<span className="faint">/{items.length}</span></div>
        <div className="mt-1 text-[0.95rem] muted">{msg}</div>
        <button onClick={restart} className="mt-5 rounded-full bg-[var(--accent)] px-5 py-2 text-[13px] font-medium text-white">
          Try again (shuffled)
        </button>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 border-b hairline bg-[var(--surface-2)] px-4 py-2.5">
        <span className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Question {i + 1} of {items.length}</span>
        <div className="ml-auto h-1.5 w-24 overflow-hidden rounded-full bg-[var(--line)]">
          <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${((i) / items.length) * 100}%` }} />
        </div>
        <span className="font-mono text-[12px] font-semibold tabular-nums">{score}</span>
      </div>

      <div className="p-5">
        <p className="text-[1.02rem] font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: q.q }} />
        <div className="mt-4 space-y-2">
          {q.options.map((o, k) => {
            const isAns = k === q.answer;
            const chosen = picked === k;
            let cls = "border hairline hover:border-[var(--accent)] hover:bg-[var(--surface-2)]";
            if (picked !== null) {
              if (isAns) cls = "border-emerald-500/60 bg-emerald-500/10";
              else if (chosen) cls = "border-rose-500/60 bg-rose-500/10";
              else cls = "border hairline opacity-55";
            }
            return (
              <button key={k} onClick={() => choose(k)} disabled={picked !== null}
                className={`flex w-full gap-3 rounded-xl border px-4 py-3 text-left text-[0.95rem] transition ${cls}`}>
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[11px] font-bold">
                  {String.fromCharCode(65 + k)}
                </span>
                <span dangerouslySetInnerHTML={{ __html: o }} />
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div className="mt-4 fade-up">
            <div className={`rounded-xl px-4 py-3 text-[0.92rem] ${correct ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-200" : "bg-amber-500/10 text-amber-900 dark:text-amber-100"}`}>
              <span className="font-semibold">{correct ? "Correct. " : "Not quite. "}</span>
              <span dangerouslySetInnerHTML={{ __html: q.why }} />
            </div>
            <button onClick={next} className="mt-4 w-full rounded-full bg-[var(--accent)] px-5 py-2.5 text-[13px] font-medium text-white sm:w-auto sm:px-8">
              {i + 1 >= items.length ? "See result" : "Next question"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
