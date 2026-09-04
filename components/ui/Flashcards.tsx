"use client";
import { useState } from "react";
import type { Flashcard } from "@/lib/types";

export default function Flashcards({ cards }: { cards: Flashcard[] }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());

  const go = (d: number) => { setI((x) => (x + d + cards.length) % cards.length); setFlipped(false); };
  const mark = () => {
    setKnown((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
    go(1);
  };

  const c = cards[i];
  return (
    <div>
      <div className="mb-3 flex items-center gap-3 text-[12px] faint">
        <span>Card {i + 1} of {cards.length}</span>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(known.size / cards.length) * 100}%` }} />
        </div>
        <span>{known.size} known</span>
      </div>

      <button onClick={() => setFlipped((f) => !f)}
        className="flex min-h-[11rem] w-full flex-col justify-center rounded-2xl border hairline bg-[var(--surface)] px-6 py-7 text-left transition hover:border-[var(--accent)]"
        style={{ boxShadow: "var(--shadow)" }}>
        <div className="text-[10px] font-bold uppercase tracking-[0.1em] faint">{flipped ? "Answer" : "Question"}</div>
        <div key={`${i}-${flipped}`} className="mt-2 fade-up">
          {flipped
            ? <div className="prose-body text-[1rem]" dangerouslySetInnerHTML={{ __html: c.a }} />
            : <div className="text-[1.08rem] font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: c.q }} />}
        </div>
        {!flipped && <div className="mt-4 text-[12px] text-[var(--accent)]">Tap to reveal</div>}
      </button>

      <div className="mt-3 flex gap-2">
        <button onClick={() => go(-1)} className="rounded-full border hairline px-4 py-2 text-[13px] font-medium transition hover:bg-[var(--surface-2)]">← Back</button>
        <button onClick={mark} className="flex-1 rounded-full bg-emerald-500/15 px-4 py-2 text-[13px] font-medium text-emerald-700 transition hover:bg-emerald-500/25 dark:text-emerald-300">
          {known.has(i) ? "Marked known — undo" : "I know this"}
        </button>
        <button onClick={() => go(1)} className="rounded-full border hairline px-4 py-2 text-[13px] font-medium transition hover:bg-[var(--surface-2)]">Next →</button>
      </div>
    </div>
  );
}
