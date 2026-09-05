"use client";
import Link from "next/link";
import { useState } from "react";
import type { Quiz as Q } from "@/lib/types";
import Quiz from "./Quiz";
import { recordAttempt } from "@/lib/progress";

export default function ChallengePlay({
  title, subjectName, subjectSlug, questions,
}: {
  title: string; subjectName: string; subjectSlug: string; questions: Q[];
}) {
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <div className="text-[2.4rem]">⚔️</div>
        <h1 className="mt-3 text-[2rem] font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 font-serif text-[1.1rem] muted">
          Someone challenged you to {questions.length} {subjectName} questions. Same questions for both of
          you — can you beat their score?
        </p>
        <button onClick={() => setStarted(true)} className="mt-6 rounded-full bg-[var(--accent)] px-8 py-3 text-[14px] font-semibold text-white">
          Accept the challenge →
        </button>
        <p className="mt-4 text-[12px] faint">No sign-in. Your answers stay on this device.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-[1.2rem]">⚔️</span>
        <h1 className="text-[1.3rem] font-semibold tracking-tight">{title}</h1>
      </div>
      <Quiz items={questions} subject={subjectSlug} slug="__challenge"
        onAnswer={(c) => recordAttempt(c)} onDone={(score, total) => setResult({ score, total })} />

      {result && (
        <div className="mt-6 rounded-2xl bg-[var(--surface-2)] p-5 text-center fade-up">
          <p className="text-[0.95rem]">You scored <strong>{result.score}/{result.total}</strong> — screenshot this and send it back to whoever challenged you 😄</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href="/challenge" className="rounded-full bg-[var(--accent)] px-5 py-2 text-[13px] font-semibold text-white">Make your own challenge →</Link>
            <Link href={`/${subjectSlug}`} className="rounded-full border hairline px-5 py-2 text-[13px] font-medium hover:bg-[var(--surface)]">Study {subjectName}</Link>
          </div>
        </div>
      )}
    </div>
  );
}
