"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Chapter, UnitMeta } from "@/lib/types";
import { tint } from "@/lib/palette";
import { BlockList, slugify } from "./Blocks";
import Quiz from "./Quiz";
import Flashcards from "./Flashcards";
import { markRead } from "@/lib/progress";

type Tab = "learn" | "cards" | "quiz";

export default function ChapterView({
  ch, subjectSlug, subjectName, unit, prev, next,
}: {
  ch: Chapter;
  subjectSlug: string;
  subjectName: string;
  unit?: UnitMeta;
  prev?: { slug: string; title: string; num: number };
  next?: { slug: string; title: string; num: number };
}) {
  const [tab, setTab] = useState<Tab>("learn");
  const hue = unit?.hue ?? "var(--accent)";
  const toc = ch.blocks.filter((b) => b.t === "h").map((b) => (b as { text: string }).text);

  useEffect(() => { markRead(subjectSlug, ch.slug); }, [subjectSlug, ch.slug]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [tab]);

  return (
    <>
      <header className="mx-auto max-w-3xl px-5 pt-8 sm:pt-12">
        <Link href={`/${subjectSlug}`} className="text-[13px] faint transition hover:text-[var(--ink)]">
          ← All {subjectName} chapters
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: tint(hue, 14), color: hue }}>
            Chapter {ch.num}{unit ? ` · ${unit.short}` : ""}
          </span>
          <span className="rounded-full border hairline px-2.5 py-1 text-[11px] font-medium faint">{ch.minutes} min read</span>
          {ch.formative && (
            <span className="rounded-full bg-amber-500/12 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
              Not in the year-end paper{ch.formativeLabel ? ` · ${ch.formativeLabel}` : ""}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-[2rem] font-semibold leading-[1.15] tracking-tight sm:text-[2.6rem]">{ch.title}</h1>
        <p className="mt-3 font-serif text-[1.15rem] leading-relaxed muted">{ch.bigIdea}</p>
      </header>

      {/* tabs */}
      <div className="no-print sticky top-[96px] sm:top-[60px] z-30 mt-8 border-b hairline bg-[var(--bg)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-5 py-2 no-scrollbar">
          {([["learn", "Learn"], ["cards", `Flashcards (${ch.flashcards.length})`], ["quiz", `Quiz (${ch.quiz.length})`]] as [Tab, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition ${
                tab === k ? "bg-[var(--ink)] text-[var(--bg)]" : "faint hover:bg-[var(--surface-2)]"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-5 pb-20">
      {tab === "learn" && (
        <div className="fade-up">
          {/* syllabus */}
          <section className="mt-8 rounded-2xl border hairline p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">What the syllabus asks for</div>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {ch.syllabus.map((s, i) => (
                <li key={i} className="rounded-lg bg-[var(--surface-2)] px-2.5 py-1 text-[12px] muted">{s}</li>
              ))}
            </ul>
            {toc.length > 0 && (
              <>
                <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.09em] faint">In this chapter</div>
                <ol className="mt-2 space-y-1">
                  {toc.map((t, i) => (
                    <li key={i}>
                      <a href={`#${slugify(t)}`} className="text-[0.92rem] muted underline-offset-2 transition hover:text-[var(--accent)] hover:underline">
                        {i + 1}. {t}
                      </a>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </section>

          <div className="mt-2">
            <BlockList blocks={ch.blocks} />
          </div>

          {ch.formulas && ch.formulas.length > 0 && (
            <section className="mt-14">
              <h2 className="text-[1.35rem] font-semibold tracking-tight">Every formula in one place</h2>
              <div className="mt-4 space-y-2">
                {ch.formulas.map((f, i) => (
                  <div key={i} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border hairline px-4 py-3">
                    <span className="text-[12px] font-semibold uppercase tracking-wide faint">{f.name}</span>
                    <span className="font-serif text-[1.12rem]" dangerouslySetInnerHTML={{ __html: f.expr }} />
                    {f.note && <span className="w-full text-[0.85rem] muted" dangerouslySetInnerHTML={{ __html: f.note }} />}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="mt-14 rounded-2xl bg-sky-500/8 p-6">
            <h2 className="text-[1.2rem] font-semibold tracking-tight text-sky-700 dark:text-sky-300">If you only revise one thing</h2>
            <ul className="mt-3 space-y-2">
              {ch.examFocus.map((e, i) => (
                <li key={i} className="flex gap-3 text-[0.95rem] muted">
                  <span className="mt-[0.62em] h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                  <span dangerouslySetInnerHTML={{ __html: e }} />
                </li>
              ))}
            </ul>
          </section>

          <div className="no-print mt-10 flex flex-wrap gap-2">
            <button onClick={() => setTab("cards")} className="rounded-full border hairline px-5 py-2.5 text-[13px] font-medium transition hover:bg-[var(--surface-2)]">
              Revise with flashcards →
            </button>
            <button onClick={() => setTab("quiz")} className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-[13px] font-medium text-white">
              Test yourself →
            </button>
          </div>
        </div>
      )}

      {tab === "cards" && (
        <div className="mt-8 fade-up">
          <Flashcards cards={ch.flashcards} />
        </div>
      )}

      {tab === "quiz" && (
        <div className="mt-8 fade-up">
          <Quiz items={ch.quiz} subject={subjectSlug} slug={ch.slug} />
        </div>
      )}

      {/* pager */}
      <nav className="no-print mt-16 grid gap-3 border-t hairline pt-6 sm:grid-cols-2">
        {prev ? (
          <Link href={`/${subjectSlug}/${prev.slug}`} className="rounded-xl border hairline p-4 transition hover:bg-[var(--surface-2)]">
            <div className="text-[11px] faint">← Previous · Chapter {prev.num}</div>
            <div className="mt-0.5 text-[0.95rem] font-medium">{prev.title}</div>
          </Link>
        ) : <div />}
        {next && (
          <Link href={`/${subjectSlug}/${next.slug}`} className="rounded-xl border hairline p-4 text-right transition hover:bg-[var(--surface-2)]">
            <div className="text-[11px] faint">Next · Chapter {next.num} →</div>
            <div className="mt-0.5 text-[0.95rem] font-medium">{next.title}</div>
          </Link>
        )}
      </nav>
      </div>
    </>
  );
}
