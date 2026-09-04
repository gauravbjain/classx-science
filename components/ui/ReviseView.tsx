"use client";
import { useMemo, useState } from "react";
import type { Subject } from "@/lib/types";
import Quiz from "./Quiz";
import Flashcards from "./Flashcards";

type Tab = "formulas" | "cards" | "test";

export default function ReviseView({ subject }: { subject: Subject }) {
  const chapters = subject.chapters;
  const [tab, setTab] = useState<Tab>("formulas");
  const [chSlug, setChSlug] = useState(chapters[0].slug);
  const [seed, setSeed] = useState(0);

  const mixed = useMemo(() => {
    const all = chapters.flatMap((c) => c.quiz.map((q) => ({ ...q, ch: c.title })));
    return all.map((q) => ({ q, r: Math.random() })).sort((a, b) => a.r - b.r).slice(0, 25).map((x) => x.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const cards = chapters.find((c) => c.slug === chSlug)!.flashcards;

  return (
    <>
      <header className="mx-auto max-w-3xl px-5 pt-10">
        <h1 className="text-[2rem] font-semibold tracking-tight sm:text-[2.5rem]">
          Revise {subject.name}
        </h1>
        <p className="mt-2 font-serif text-[1.1rem] muted">
          The night before the paper, this is the page to be on.
        </p>
      </header>

      <div className="no-print sticky top-[3.55rem] z-30 mt-6 border-b hairline bg-[var(--bg)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-5 py-2 no-scrollbar">
          {([["formulas", "Formula sheet"], ["cards", "Flashcards"], ["test", "Mixed test"]] as [Tab, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                tab === k ? "bg-[var(--ink)] text-[var(--bg)]" : "faint hover:bg-[var(--surface-2)]"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 pb-20">
      {tab === "formulas" && (
        <div className="mt-8 space-y-8 fade-up">
          {chapters.filter((c) => c.formulas?.length).map((c) => (
            <section key={c.slug}>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-[12px] font-bold" style={{ color: subject.units[c.unit]?.hue ?? subject.accent }}>{String(c.num).padStart(2, "0")}</span>
                <h2 className="text-[1.05rem] font-semibold">{c.title}</h2>
              </div>
              <div className="mt-3 space-y-2">
                {c.formulas!.map((f, i) => (
                  <div key={i} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border hairline px-4 py-3">
                    <span className="text-[11.5px] font-semibold uppercase tracking-wide faint">{f.name}</span>
                    <span className="font-serif text-[1.1rem]" dangerouslySetInnerHTML={{ __html: f.expr }} />
                    {f.note && <span className="w-full text-[0.85rem] muted" dangerouslySetInnerHTML={{ __html: f.note }} />}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === "cards" && (
        <div className="mt-8 fade-up">
          <select value={chSlug} onChange={(e) => setChSlug(e.target.value)}
            className="mb-4 w-full rounded-xl border hairline bg-[var(--surface)] px-4 py-2.5 text-[0.95rem]">
            {chapters.map((c) => <option key={c.slug} value={c.slug}>{c.num}. {c.title}</option>)}
          </select>
          <Flashcards key={chSlug} cards={cards} />
        </div>
      )}

      {tab === "test" && (
        <div className="mt-8 fade-up">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[0.9rem] muted">{`Twenty-five questions pulled at random from the whole ${subject.name} syllabus.`}</p>
            <button onClick={() => setSeed((s) => s + 1)} className="rounded-full border hairline px-3.5 py-1.5 text-[12px] font-medium transition hover:bg-[var(--surface-2)]">
              New set
            </button>
          </div>
          <Quiz key={seed} items={mixed} subject={subject.slug} slug="__mixed" />
        </div>
      )}
      </div>
    </>
  );
}
