import Link from "next/link";
import { SCIENCE } from "@/content/science";
import { UNITS } from "@/lib/units";
import ProgressStrip from "@/components/ui/ProgressStrip";
import type { UnitKey } from "@/lib/types";

export default function Home() {
  const order: UnitKey[] = ["chemistry", "biology", "light", "current", "environment"];
  const totalSims = SCIENCE.chapters.reduce((a, c) => a + c.blocks.filter((b) => b.t === "sim").length, 0);
  const totalQ = SCIENCE.chapters.reduce((a, c) => a + c.quiz.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16">
      <section className="pt-12 sm:pt-20">
        <div className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
          CBSE · Class X · Session 2026-27
        </div>
        <h1 className="mt-3 max-w-2xl text-[2.4rem] font-semibold leading-[1.08] tracking-tight sm:text-[3.4rem]">
          Science, made obvious.
        </h1>
        <p className="mt-4 max-w-xl font-serif text-[1.16rem] leading-relaxed muted">
          Every chapter of the syllabus, explained the way it should have been the first time —
          with things you can pull, drag and break until the idea clicks.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-[13px] muted">
          <span className="rounded-full border hairline px-3 py-1.5">{SCIENCE.chapters.length} chapters</span>
          <span className="rounded-full border hairline px-3 py-1.5">{totalSims} interactive simulations</span>
          <span className="rounded-full border hairline px-3 py-1.5">{totalQ} practice questions</span>
        </div>
        <ProgressStrip total={SCIENCE.chapters.length} />
      </section>

      {order.map((uk) => {
        const u = UNITS[uk];
        const chs = SCIENCE.chapters.filter((c) => c.unit === uk);
        if (!chs.length) return null;
        return (
          <section key={uk} className="mt-14">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-[1.3rem] font-semibold tracking-tight">{u.short}</h2>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${u.tint} ${u.text}`}>{u.marks}</span>
              <span className="text-[13px] faint">{u.name}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {chs.map((c) => (
                <Link key={c.slug} href={`/chapters/${c.slug}`}
                  className="group relative overflow-hidden rounded-2xl border hairline p-5 transition hover:-translate-y-0.5"
                  style={{ boxShadow: "var(--shadow)" }}>
                  <span className="absolute left-0 top-0 h-full w-1" style={{ background: u.hue }} />
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[12px] font-bold" style={{ color: u.hue }}>{String(c.num).padStart(2, "0")}</span>
                    <h3 className="text-[1.02rem] font-semibold leading-snug">{c.title}</h3>
                  </div>
                  <p className="mt-2 text-[0.9rem] leading-relaxed muted">{c.blurb}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] faint">
                    <span>{c.minutes} min</span>
                    <span>·</span>
                    <span>{c.blocks.filter((b) => b.t === "sim").length} interactive{c.blocks.filter((b) => b.t === "sim").length === 1 ? "" : "s"}</span>
                    <span>·</span>
                    <span>{c.quiz.length} questions</span>
                    {c.formative && (
                      <span className="rounded-full bg-amber-500/12 px-2 py-0.5 font-semibold text-amber-700 dark:text-amber-300">
                        formative only
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-16 rounded-2xl border hairline p-6">
        <h2 className="text-[1.15rem] font-semibold tracking-tight">How the marks are split</h2>
        <div className="mt-4 flex h-4 overflow-hidden rounded-full">
          {order.map((uk) => {
            const m = parseInt(UNITS[uk].marks);
            return <div key={uk} style={{ width: `${(m / 80) * 100}%`, background: UNITS[uk].hue }} title={`${UNITS[uk].short} — ${m}`} />;
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] muted">
          {order.map((uk) => (
            <span key={uk} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: UNITS[uk].hue }} />
              {UNITS[uk].short} — {UNITS[uk].marks}
            </span>
          ))}
        </div>
        <p className="mt-4 text-[0.9rem] muted">
          Theory paper is 80 marks in 3 hours, plus 20 marks of internal assessment. Roughly half the paper tests
          knowledge and understanding, 30% application, and 20% analysis and reasoning — which is why the
          &ldquo;why does this happen&rdquo; boxes matter as much as the definitions.
        </p>
      </section>
    </div>
  );
}
