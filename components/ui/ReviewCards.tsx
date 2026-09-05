"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Subject } from "@/lib/types";
import { dueCards, rateCard } from "@/lib/progress";

const SESSION_CAP = 25;

export default function ReviewCards({ subject }: { subject: Subject }) {
  const allIds = useMemo(
    () => subject.chapters.flatMap((c) => c.flashcards.map((_, i) => `${c.slug}#c${i}`)),
    [subject]
  );
  const cardOf = useMemo(() => {
    const m = new Map<string, { q: string; a: string; ch: string }>();
    for (const c of subject.chapters) c.flashcards.forEach((f, i) => m.set(`${c.slug}#c${i}`, { q: f.q, a: f.a, ch: c.title }));
    return m;
  }, [subject]);

  const [queue, setQueue] = useState<string[]>([]);
  const [totalDue, setTotalDue] = useState(0);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const build = useCallback(() => {
    const all = dueCards(subject.slug, allIds);
    setTotalDue(all.length);
    setQueue(all.slice(0, SESSION_CAP));
    setPos(0); setFlipped(false);
  }, [subject.slug, allIds]);

  useEffect(() => { build(); }, [build]);

  const id = queue[pos];
  const card = id ? cardOf.get(id) : null;
  const done = queue.length > 0 && pos >= queue.length;

  function rate(good: boolean) {
    const at = id.lastIndexOf("#c");
    rateCard(subject.slug, id.slice(0, at), parseInt(id.slice(at + 2), 10), good);
    setPos((p) => p + 1); setFlipped(false);
  }

  if (queue.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border hairline p-8 text-center fade-up">
        <div className="text-[2rem]">🎉</div>
        <h3 className="mt-2 text-[1.1rem] font-semibold">Nothing due right now</h3>
        <p className="mx-auto mt-2 max-w-md text-[0.92rem] muted">
          Spaced repetition brings each card back just before you’d forget it. As you review, cards you
          find easy return in a few days; ones you miss come back sooner. New cards appear here as you go.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mt-8 rounded-2xl bg-emerald-500/8 p-8 text-center fade-up">
        <div className="text-[2rem]">✅</div>
        <h3 className="mt-2 text-[1.1rem] font-semibold">Session done — {queue.length} cards reviewed</h3>
        <p className="mt-2 text-[0.92rem] muted">
          {totalDue > queue.length ? `${totalDue - queue.length} more are still due — keep going.` : "You’re all caught up. Come back tomorrow to keep the schedule."}
        </p>
        {totalDue > queue.length && (
          <button onClick={build} className="mt-4 rounded-full bg-[var(--accent)] px-6 py-2.5 text-[13px] font-semibold text-white">
            Review {Math.min(totalDue - queue.length, SESSION_CAP)} more →
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 fade-up">
      <div className="mb-3 flex items-center gap-3 text-[12px] faint">
        <span>{pos + 1} of {queue.length} this session</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${(pos / queue.length) * 100}%` }} />
        </div>
        <span>{totalDue} due</span>
      </div>

      <div className="mb-2 text-[11px] faint">{card?.ch}</div>
      <button onClick={() => setFlipped((f) => !f)}
        className="flex min-h-[11rem] w-full flex-col justify-center rounded-2xl border hairline bg-[var(--surface)] px-6 py-7 text-left transition hover:border-[var(--accent)]"
        style={{ boxShadow: "var(--shadow)" }}>
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] faint">{flipped ? "Answer" : "Question"}</div>
        <div key={`${id}-${flipped}`} className="mt-2 fade-up">
          {flipped
            ? <div className="rich text-[1rem]" dangerouslySetInnerHTML={{ __html: card!.a }} />
            : <div className="text-[1.08rem] font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: card!.q }} />}
        </div>
        {!flipped && <div className="mt-4 text-[12px] text-[var(--accent)]">Tap to reveal</div>}
      </button>

      {flipped ? (
        <div className="mt-3 flex gap-2">
          <button onClick={() => rate(false)} className="flex-1 rounded-full bg-rose-500/15 px-4 py-2.5 text-[13px] font-semibold text-rose-700 transition hover:bg-rose-500/25 dark:text-rose-300">
            Forgot — show again soon
          </button>
          <button onClick={() => rate(true)} className="flex-1 rounded-full bg-emerald-500/15 px-4 py-2.5 text-[13px] font-semibold text-emerald-700 transition hover:bg-emerald-500/25 dark:text-emerald-300">
            Got it →
          </button>
        </div>
      ) : (
        <p className="mt-3 text-center text-[12px] faint">Try to recall the answer, then tap the card.</p>
      )}
    </div>
  );
}
