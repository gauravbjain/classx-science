"use client";
import { useEffect, useMemo, useState } from "react";
import type { Subject, Importance } from "@/lib/types";
import Quiz from "./Quiz";
import Flashcards from "./Flashcards";
import { WrittenCard, ARCard, CaseCard } from "./Practice";
import MistakeReview from "./MistakeReview";
import ReviewCards from "./ReviewCards";
import { recordAttempt } from "@/lib/progress";

type Tab = "formulas" | "cards" | "practice" | "mistakes" | "test";

export default function ReviseView({ subject }: { subject: Subject }) {
  const chapters = subject.chapters;
  const [tab, setTab] = useState<Tab>("formulas");
  const [chSlug, setChSlug] = useState(chapters[0].slug);
  const [seed, setSeed] = useState(0);
  const [cardMode, setCardMode] = useState<"review" | "browse">("review");

  // ---- practice aggregation across the whole subject ----
  const [pracCh, setPracCh] = useState("all");
  const [highOnly, setHighOnly] = useState(true);

  const allWritten = useMemo(
    () => chapters.flatMap((c) => (c.written ?? []).map((w) => ({ item: w, chapter: c.title, slug: c.slug }))),
    [chapters]
  );
  const allAR = useMemo(
    () => chapters.flatMap((c) => (c.assertionReason ?? []).map((a) => ({ item: a, chapter: c.title, slug: c.slug }))),
    [chapters]
  );
  const allCase = useMemo(
    () => chapters.flatMap((c) => (c.caseStudies ?? []).map((cs) => ({ item: cs, chapter: c.title, slug: c.slug }))),
    [chapters]
  );
  const hasPractice = allWritten.length + allAR.length + allCase.length > 0;

  const keep = <T extends { importance?: Importance }>(rows: { item: T; chapter: string; slug: string }[]) =>
    rows
      .filter((r) => pracCh === "all" || r.slug === pracCh)
      .filter((r) => !highOnly || r.item.importance === "high");

  const written = keep(allWritten);
  const ar = keep(allAR);
  const cases = keep(allCase);
  const showChapterTag = pracCh === "all";
  const pracEmpty = written.length + ar.length + cases.length === 0;

  const mixed = useMemo(() => {
    const all = chapters.flatMap((c) => c.quiz.map((q) => ({ ...q, ch: c.title })));
    return all.map((q) => ({ q, r: Math.random() })).sort((a, b) => a.r - b.r).slice(0, 25).map((x) => x.q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const cards = chapters.find((c) => c.slug === chSlug)!.flashcards;

  // deep-link: /<subject>/revise#mistakes (or #practice) opens that tab
  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (h === "mistakes" || h === "practice" || h === "test" || h === "cards" || h === "formulas") setTab(h as Tab);
  }, []);

  const tabs: [Tab, string][] = [
    ["formulas", "Formula sheet"],
    ["cards", "Flashcards"],
    ...(hasPractice ? ([["practice", "Practice"]] as [Tab, string][]) : []),
    ["mistakes", "Fix mistakes"],
    ["test", "Mixed test"],
  ];

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

      <div className="no-print sticky top-[96px] sm:top-[60px] z-30 mt-6 border-b hairline bg-[var(--bg)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-5 py-2 no-scrollbar">
          {tabs.map(([k, l]) => (
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
          <div className="mb-4 inline-flex rounded-full border hairline p-0.5 text-[13px]">
            {([["review", "Smart review"], ["browse", "Browse by chapter"]] as ["review" | "browse", string][]).map(([k, l]) => (
              <button key={k} onClick={() => setCardMode(k)}
                className={`rounded-full px-3.5 py-1.5 font-medium transition ${cardMode === k ? "bg-[var(--ink)] text-[var(--bg)]" : "faint"}`}>{l}</button>
            ))}
          </div>
          {cardMode === "review" ? (
            <ReviewCards subject={subject} />
          ) : (
            <>
              <select value={chSlug} onChange={(e) => setChSlug(e.target.value)}
                className="mb-4 w-full rounded-xl border hairline bg-[var(--surface)] px-4 py-2.5 text-[0.95rem]">
                {chapters.map((c) => <option key={c.slug} value={c.slug}>{c.num}. {c.title}</option>)}
              </select>
              <Flashcards key={chSlug} cards={cards} />
            </>
          )}
        </div>
      )}

      {tab === "practice" && (
        <div className="mt-8 fade-up">
          <p className="text-[0.9rem] muted">
            Every board-style written, assertion–reason and case question in {subject.name}, in one place.
            Start with the most-asked — attempt on paper, then reveal the answer.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <select value={pracCh} onChange={(e) => setPracCh(e.target.value)}
              className="rounded-xl border hairline bg-[var(--surface)] px-4 py-2.5 text-[0.9rem]">
              <option value="all">All chapters</option>
              {chapters.map((c) => <option key={c.slug} value={c.slug}>{c.num}. {c.title}</option>)}
            </select>
            <label className="flex items-center gap-2 text-[13px] muted">
              <input type="checkbox" checked={highOnly} onChange={(e) => setHighOnly(e.target.checked)} className="accent-[var(--accent)]" />
              Most-asked only
            </label>
            <span className="ml-auto text-[12px] faint">{written.length + ar.length + cases.length} questions</span>
          </div>

          {pracEmpty && (
            <p className="mt-8 rounded-xl border hairline px-4 py-6 text-center text-[0.9rem] muted">
              {highOnly ? "No high-weightage questions match — untick “most-asked only” to see the rest." : "No practice questions here yet."}
            </p>
          )}

          {written.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[1.2rem] font-semibold tracking-tight">Board-style questions <span className="faint font-normal">({written.length})</span></h2>
              <div className="mt-4 space-y-3">
                {written.map((r, i) => <WrittenCard key={i} w={r.item} n={i + 1} chapter={showChapterTag ? r.chapter : undefined} />)}
              </div>
            </section>
          )}
          {ar.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[1.2rem] font-semibold tracking-tight">Assertion &amp; Reason <span className="faint font-normal">({ar.length})</span></h2>
              <div className="mt-4 space-y-3">
                {ar.map((r, i) => <ARCard key={i} ar={r.item} n={i + 1} chapter={showChapterTag ? r.chapter : undefined} />)}
              </div>
            </section>
          )}
          {cases.length > 0 && (
            <section className="mt-10">
              <h2 className="text-[1.2rem] font-semibold tracking-tight">Case / source-based <span className="faint font-normal">({cases.length})</span></h2>
              <div className="mt-4 space-y-3">
                {cases.map((r, i) => <CaseCard key={i} cs={r.item} n={i + 1} chapter={showChapterTag ? r.chapter : undefined} />)}
              </div>
            </section>
          )}
        </div>
      )}

      {tab === "mistakes" && <MistakeReview subject={subject} />}

      {tab === "test" && (
        <div className="mt-8 fade-up">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[0.9rem] muted">{`Twenty-five questions pulled at random from the whole ${subject.name} syllabus.`}</p>
            <button onClick={() => setSeed((s) => s + 1)} className="rounded-full border hairline px-3.5 py-1.5 text-[12px] font-medium transition hover:bg-[var(--surface-2)]">
              New set
            </button>
          </div>
          <Quiz key={seed} items={mixed} subject={subject.slug} slug="__mixed"
            onAnswer={(correct) => recordAttempt(correct)} />
        </div>
      )}
      </div>
    </>
  );
}
