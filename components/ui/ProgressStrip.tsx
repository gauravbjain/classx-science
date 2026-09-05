"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { subjectStats, resetSubject } from "@/lib/progress";

export default function ProgressStrip({
  subject, total, accent,
}: { subject: string; total: number; accent: string }) {
  const [s, setS] = useState<{ read: number; quizzes: number; avg: number; due: number } | null>(null);

  useEffect(() => {
    const sync = () => setS(subjectStats(subject));
    sync();
    window.addEventListener("classx-progress", sync);
    return () => window.removeEventListener("classx-progress", sync);
  }, [subject]);

  if (!s) return <div className="h-[9rem]" />;

  return (
    <div className="mt-8 rounded-2xl border hairline p-5">
      <div className="flex flex-wrap items-center gap-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Chapters opened</div>
          <div className="mt-0.5 text-[1.6rem] font-semibold tabular-nums">
            {s.read}<span className="text-[1rem] faint">/{total}</span>
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Quizzes taken</div>
          <div className="mt-0.5 text-[1.6rem] font-semibold tabular-nums">{s.quizzes}</div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Average best score</div>
          <div className="mt-0.5 text-[1.6rem] font-semibold tabular-nums">{s.avg}%</div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">To fix</div>
          <div className="mt-0.5 text-[1.6rem] font-semibold tabular-nums" style={{ color: s.due > 0 ? "#e11d48" : undefined }}>{s.due}</div>
        </div>
        {s.read > 0 && (
          <button onClick={() => resetSubject(subject)}
            className="ml-auto self-end text-[12px] faint underline-offset-2 hover:underline">
            Reset this subject
          </button>
        )}
      </div>
      {s.due > 0 && (
        <Link href={`/${subject}/revise#mistakes`}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-medium text-white">
          Fix {s.due} question{s.due === 1 ? "" : "s"} you missed →
        </Link>
      )}
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="h-full rounded-full transition-all"
          style={{ width: `${(s.read / total) * 100}%`, background: accent }} />
      </div>
      <p className="mt-2 text-[12px] faint">Saved only in this browser — nothing leaves the device.</p>
    </div>
  );
}
