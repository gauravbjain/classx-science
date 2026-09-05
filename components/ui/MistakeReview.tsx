"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Subject } from "@/lib/types";
import { dueMistakeKeys, subjectQStats, recordAnswer } from "@/lib/progress";
import { ARCard } from "./Practice";

function parseKey(k: string) {
  const hash = k.indexOf("#");
  const slug = k.slice(0, hash);
  const tail = k.slice(hash + 1);
  const kind: "q" | "ar" = tail.startsWith("ar") ? "ar" : "q";
  const index = parseInt(tail.slice(kind.length), 10);
  return { slug, kind, index };
}

/** A compact MCQ card that records each answer against the real chapter + index. */
function MistakeMCQ({
  q, subject, slug, index,
}: {
  q: { q: string; options: string[]; answer: number; why: string };
  subject: string; slug: string; index: number;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  function choose(k: number) {
    if (picked !== null) return;
    setPicked(k);
    recordAnswer(subject, slug, "q", index, k === q.answer);
  }
  return (
    <div className="card p-5">
      <p className="text-[1rem] font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: q.q }} />
      <div className="mt-4 space-y-2">
        {q.options.map((o, k) => {
          const isAns = k === q.answer, chosen = picked === k;
          let cls = "border hairline hover:border-[var(--accent)] hover:bg-[var(--surface-2)]";
          if (picked !== null) cls = isAns ? "border-emerald-500/60 bg-emerald-500/10" : chosen ? "border-rose-500/60 bg-rose-500/10" : "border hairline opacity-55";
          return (
            <button key={k} onClick={() => choose(k)} disabled={picked !== null}
              className={`flex w-full gap-3 rounded-xl border px-4 py-2.5 text-left text-[0.92rem] transition ${cls}`}>
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[11px] font-bold">
                {String.fromCharCode(65 + k)}
              </span>
              <span dangerouslySetInnerHTML={{ __html: o }} />
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className={`mt-3 rounded-xl px-4 py-3 text-[0.9rem] fade-up ${picked === q.answer ? "bg-emerald-500/10" : "bg-amber-500/10"}`}>
          <span className="font-semibold">{picked === q.answer ? "Correct — one step closer to clearing this. " : "Not yet. "}</span>
          <span dangerouslySetInnerHTML={{ __html: q.why }} />
        </div>
      )}
    </div>
  );
}

export default function MistakeReview({ subject }: { subject: Subject }) {
  const [tick, setTick] = useState(0);
  const [snapshot, setSnapshot] = useState<string[]>([]);

  // weak-spot aggregation reacts live; the review list is a stable snapshot per round
  const [stats, setStats] = useState<Record<string, { w: number; c: number; streak: number }>>({});
  useEffect(() => {
    const sync = () => setStats(subjectQStats(subject.slug));
    sync();
    window.addEventListener("classx-progress", sync);
    return () => window.removeEventListener("classx-progress", sync);
  }, [subject.slug]);

  useEffect(() => { setSnapshot(dueMistakeKeys(subject.slug)); }, [subject.slug, tick]);

  const bySlug = useMemo(() => {
    const m = new Map(subject.chapters.map((c) => [c.slug, c]));
    return m;
  }, [subject.chapters]);

  // weakest chapters: lowest accuracy among those with at least 3 attempts
  const weak = useMemo(() => {
    const agg: Record<string, { w: number; c: number }> = {};
    for (const [k, v] of Object.entries(stats)) {
      const slug = k.slice(0, k.indexOf("#"));
      (agg[slug] ??= { w: 0, c: 0 }).w += v.w;
      agg[slug].c += v.c;
    }
    return Object.entries(agg)
      .map(([slug, { w, c }]) => ({ slug, attempts: w + c, acc: w + c ? Math.round((c / (w + c)) * 100) : 0 }))
      .filter((x) => x.attempts >= 3)
      .sort((a, b) => a.acc - b.acc)
      .slice(0, 5);
  }, [stats]);

  const round = snapshot.slice(0, 20);

  return (
    <div className="mt-8 space-y-10 fade-up">
      {/* weak spots */}
      <section className="rounded-2xl border hairline p-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Your weakest chapters</div>
        {weak.length === 0 ? (
          <p className="mt-3 text-[0.9rem] muted">Answer a few quizzes and this fills in — it ranks the chapters where you miss the most, so you know exactly what to revise.</p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {weak.map((x) => {
              const ch = bySlug.get(x.slug);
              const hue = ch ? (subject.units[ch.unit]?.hue ?? subject.accent) : subject.accent;
              return (
                <li key={x.slug}>
                  <Link href={`/${subject.slug}/${x.slug}`} className="group flex items-center gap-3">
                    <span className="w-8 shrink-0 text-right font-mono text-[13px] font-bold tabular-nums" style={{ color: x.acc < 50 ? "#e11d48" : hue }}>{x.acc}%</span>
                    <span className="flex-1">
                      <span className="text-[0.92rem] font-medium group-hover:text-[var(--accent)]">{ch ? `${ch.num}. ${ch.title}` : x.slug}</span>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
                        <span className="block h-full rounded-full" style={{ width: `${x.acc}%`, background: x.acc < 50 ? "#e11d48" : hue }} />
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] faint">{x.attempts} tried</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* mistake bank */}
      <section>
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-[1.2rem] font-semibold tracking-tight">Fix your mistakes</h2>
          <span className="text-[12px] faint">{snapshot.length} waiting · clears after 2 correct in a row</span>
          {snapshot.length > 0 && (
            <button onClick={() => setTick((t) => t + 1)} className="ml-auto rounded-full border hairline px-3.5 py-1.5 text-[12px] font-medium transition hover:bg-[var(--surface-2)]">
              New set
            </button>
          )}
        </div>

        {snapshot.length === 0 ? (
          <p className="mt-4 rounded-xl border hairline px-4 py-8 text-center text-[0.92rem] muted">
            Nothing to fix right now. 🎉 Every question you get wrong in a quiz or assertion–reason lands here until you nail it twice.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {round.map((k) => {
              const { slug, kind, index } = parseKey(k);
              const ch = bySlug.get(slug);
              if (!ch) return null;
              if (kind === "q") {
                const q = ch.quiz[index];
                if (!q) return null;
                return (
                  <div key={k}>
                    <div className="mb-1.5 text-[11px] faint">{ch.num}. {ch.title}</div>
                    <MistakeMCQ q={q} subject={subject.slug} slug={slug} index={index} />
                  </div>
                );
              }
              const ar = ch.assertionReason?.[index];
              if (!ar) return null;
              return (
                <div key={k}>
                  <div className="mb-1.5 text-[11px] faint">{ch.num}. {ch.title}</div>
                  <ARCard ar={ar} n={index + 1} onAnswer={(correct) => recordAnswer(subject.slug, slug, "ar", index, correct)} />
                </div>
              );
            })}
            {snapshot.length > 20 && (
              <p className="pt-2 text-center text-[12px] faint">Showing 20 of {snapshot.length}. Clear these, then tap “New set”.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
