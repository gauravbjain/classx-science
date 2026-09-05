"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LEARNER_NAME, greetingWord, pepOfTheDay } from "@/lib/learner";
import { dashboard, daysToExam } from "@/lib/progress";

export default function Greeting({ subjects }: { subjects: { slug: string; name: string }[] }) {
  const [ready, setReady] = useState(false);
  const [word, setWord] = useState("Hello");
  const [streak, setStreak] = useState(0);
  const [today, setToday] = useState(0);
  const [goal, setGoal] = useState(20);
  const [nextExam, setNextExam] = useState<{ name: string; slug: string; days: number } | null>(null);

  useEffect(() => {
    const sync = () => {
      setWord(greetingWord());
      const d = dashboard();
      setStreak(d.streak); setToday(d.today); setGoal(d.goal);
      let soon: { name: string; slug: string; days: number } | null = null;
      for (const s of subjects) {
        const days = daysToExam(s.slug);
        if (days !== null && days >= 0 && (!soon || days < soon.days)) soon = { name: s.name, slug: s.slug, days };
      }
      setNextExam(soon);
    };
    sync();
    setReady(true);
    window.addEventListener("classx-progress", sync);
    return () => window.removeEventListener("classx-progress", sync);
  }, [subjects]);

  // avoid a hydration flash: reserve space until mounted
  if (!ready) return <div className="pt-12 sm:pt-16 h-[7.5rem]" />;

  const pep = pepOfTheDay();
  const goalMet = today >= goal;

  return (
    <section className="pt-12 sm:pt-16">
      <h1 className="text-[2rem] font-semibold leading-tight tracking-tight sm:text-[2.7rem]">
        {word}, <span style={{ color: "var(--accent)" }}>{LEARNER_NAME}</span>
        <span className="ml-1.5">👋</span>
      </h1>
      <p className="mt-3 max-w-xl font-serif text-[1.2rem] italic leading-relaxed muted">
        “{pep}”
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-[13px]">
        {streak > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border hairline px-3 py-1.5 font-medium">
            <span style={{ color: "#f97316" }}>🔥 {streak}-day streak</span>
            <span className="faint">— keep it alive</span>
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border hairline px-3 py-1.5 font-medium">
          {goalMet
            ? <span className="text-emerald-600 dark:text-emerald-400">✓ Today’s {goal} done — nice!</span>
            : <><span className="tabular-nums">{today}/{goal}</span><span className="faint">questions today</span></>}
        </span>
        {nextExam && nextExam.days <= 60 && (
          <Link href={`/${nextExam.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-white"
            style={{ background: nextExam.days <= 7 ? "#e11d48" : "var(--accent)" }}>
            {nextExam.days === 0 ? `${nextExam.name} exam today — you've got this 🍀`
              : `${nextExam.days} day${nextExam.days === 1 ? "" : "s"} to ${nextExam.name} — let’s go →`}
          </Link>
        )}
      </div>
    </section>
  );
}
