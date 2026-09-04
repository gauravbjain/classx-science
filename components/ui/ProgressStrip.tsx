"use client";
import { useEffect, useState } from "react";
import { load, resetAll, type Progress } from "@/lib/progress";

export default function ProgressStrip({ total }: { total: number }) {
  const [p, setP] = useState<Progress | null>(null);
  useEffect(() => {
    const sync = () => setP(load());
    sync();
    window.addEventListener("classx-progress", sync);
    return () => window.removeEventListener("classx-progress", sync);
  }, []);
  if (!p) return <div className="h-[4.5rem]" />;

  const read = Object.keys(p.read).length;
  const quizzed = Object.keys(p.quiz).length;
  const scores = Object.values(p.quiz);
  const avg = scores.length ? Math.round((scores.reduce((a, b) => a + b.best / b.total, 0) / scores.length) * 100) : 0;

  return (
    <div className="mt-8 rounded-2xl border hairline p-5">
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Chapters opened</div>
          <div className="mt-0.5 text-[1.6rem] font-semibold tabular-nums">{read}<span className="text-[1rem] faint">/{total}</span></div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Quizzes taken</div>
          <div className="mt-0.5 text-[1.6rem] font-semibold tabular-nums">{quizzed}</div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Average best score</div>
          <div className="mt-0.5 text-[1.6rem] font-semibold tabular-nums">{avg}%</div>
        </div>
        {read > 0 && (
          <button onClick={resetAll} className="ml-auto self-end text-[12px] faint underline-offset-2 hover:underline">
            Reset progress
          </button>
        )}
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${(read / total) * 100}%` }} />
      </div>
      <p className="mt-2 text-[12px] faint">Saved only in this browser — nothing leaves the device.</p>
    </div>
  );
}
