"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Subject } from "@/lib/types";
import { load, daysToExam, setExamDate, getExamDate, dueMistakeKeys, dueCards, dashboard } from "@/lib/progress";

type Task = { label: string; href: string; tone?: "urgent" };

export default function PlanPanel({ subject }: { subject: Subject }) {
  const allCardIds = useMemo(
    () => subject.chapters.flatMap((c) => c.flashcards.map((_, i) => `${c.slug}#c${i}`)),
    [subject]
  );

  const [exam, setExam] = useState<string | null>(null);
  const [days, setDays] = useState<number | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [today, setToday] = useState(0);
  const [goal, setGoal] = useState(20);
  const [editing, setEditing] = useState(false);

  const compute = useCallback(() => {
    setExam(getExamDate(subject.slug));
    setDays(daysToExam(subject.slug));
    const p = load();
    const d = dashboard();
    setToday(d.today); setGoal(d.goal);

    const t: Task[] = [];
    const dueMistakes = dueMistakeKeys(subject.slug, p).length;
    if (dueMistakes > 0) t.push({ label: `Fix ${dueMistakes} question${dueMistakes === 1 ? "" : "s"} you keep missing`, href: `/${subject.slug}/revise#mistakes`, tone: "urgent" });

    const dueCardN = dueCards(subject.slug, allCardIds).length;
    if (dueCardN > 0) t.push({ label: `Review ${Math.min(dueCardN, 25)} flashcard${dueCardN === 1 ? "" : "s"} due today`, href: `/${subject.slug}/revise` });

    const nextChapter = subject.chapters.find((c) => !p.read[`${subject.slug}/${c.slug}`]);
    if (nextChapter) t.push({ label: `Study Ch ${nextChapter.num}: ${nextChapter.title}`, href: `/${subject.slug}/${nextChapter.slug}` });

    const dte = daysToExam(subject.slug);
    if ((!nextChapter || (dte !== null && dte <= 21)) && t.length < 3) {
      t.push({ label: "Sit a timed mock board paper", href: `/${subject.slug}/mock` });
    }
    setTasks(t.slice(0, 3));
  }, [subject, allCardIds]);

  useEffect(() => {
    compute();
    window.addEventListener("classx-progress", compute);
    return () => window.removeEventListener("classx-progress", compute);
  }, [compute]);

  function saveDate(v: string) { setExamDate(subject.slug, v); setEditing(false); compute(); }

  // no exam set yet
  if (!exam && !editing) {
    return (
      <section className="mt-6 rounded-2xl border hairline p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-[1.4rem]">🗓️</div>
          <div className="min-w-0">
            <h3 className="text-[1rem] font-semibold">Set your {subject.name} exam date</h3>
            <p className="text-[0.88rem] muted">and this turns into a daily countdown and a “what to do today” plan.</p>
          </div>
          <button onClick={() => setEditing(true)} className="ml-auto rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-white">Set date</button>
        </div>
      </section>
    );
  }

  if (editing) {
    return (
      <section className="mt-6 rounded-2xl border hairline p-5">
        <label className="text-[0.9rem] font-medium">When is your {subject.name} paper?</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input type="date" defaultValue={exam ?? ""} onChange={(e) => e.target.value && saveDate(e.target.value)}
            className="rounded-xl border hairline bg-[var(--surface)] px-4 py-2 text-[0.9rem]" />
          <button onClick={() => setEditing(false)} className="rounded-full border hairline px-4 py-2 text-[13px] font-medium">Cancel</button>
        </div>
      </section>
    );
  }

  const soon = days !== null && days <= 7;
  const past = days !== null && days < 0;

  return (
    <section className="mt-6 rounded-2xl border hairline p-5" style={soon && !past ? { borderColor: "#f59e0b66" } : undefined}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">{subject.name} exam</div>
          <div className="mt-0.5 text-[1.5rem] font-semibold leading-none">
            {past ? <span className="muted">exam day passed</span>
              : days === 0 ? <span style={{ color: "#e11d48" }}>Today — good luck! 🍀</span>
              : <><span className="tabular-nums" style={{ color: soon ? "#e11d48" : undefined }}>{days}</span> <span className="text-[1rem] faint">day{days === 1 ? "" : "s"} to go</span></>}
          </div>
        </div>
        <div className="text-[0.85rem] faint">
          <span className="tabular-nums font-semibold" style={{ color: "var(--ink)" }}>{today}/{goal}</span> questions today
        </div>
        <button onClick={() => setEditing(true)} className="ml-auto text-[12px] faint underline-offset-2 hover:underline">Change date</button>
      </div>

      {tasks.length > 0 && (
        <>
          <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.09em] faint">Today’s plan</div>
          <ul className="mt-2 space-y-2">
            {tasks.map((t, i) => (
              <li key={i}>
                <Link href={t.href} className="group flex items-center gap-3 rounded-xl border hairline px-4 py-2.5 transition hover:bg-[var(--surface-2)]">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px]" style={{ background: t.tone === "urgent" ? "#e11d4820" : "var(--surface-2)" }}>{t.tone === "urgent" ? "🎯" : "▸"}</span>
                  <span className="text-[0.92rem] font-medium group-hover:text-[var(--accent)]">{t.label}</span>
                  <span className="ml-auto text-[13px] faint group-hover:text-[var(--accent)]">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
