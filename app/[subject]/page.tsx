import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LIVE_SUBJECTS, getLiveSubject } from "@/content";
import { tint } from "@/lib/palette";
import ProgressStrip from "@/components/ui/ProgressStrip";

export function generateStaticParams() {
  return LIVE_SUBJECTS.map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }): Promise<Metadata> {
  const s = getLiveSubject((await params).subject);
  if (!s) return {};
  return { title: s.name, description: s.tagline };
}

export default async function SubjectHome({ params }: { params: Promise<{ subject: string }> }) {
  const subject = getLiveSubject((await params).subject);
  if (!subject) notFound();

  const totalSims = subject.chapters.reduce((a, c) => a + c.blocks.filter((b) => b.t === "sim").length, 0);
  const totalQ = subject.chapters.reduce((a, c) => a + c.quiz.length, 0);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16">
      <section className="pt-10 sm:pt-16">
        <Link href="/" className="text-[13px] faint transition hover:text-[var(--ink)]">← All subjects</Link>
        <div className="mt-4 text-[12px] font-semibold uppercase tracking-[0.12em]" style={{ color: subject.accent }}>
          {subject.board} · {subject.className} · Session {subject.session}
        </div>
        <h1 className="mt-3 max-w-2xl text-[2.4rem] font-semibold leading-[1.08] tracking-tight sm:text-[3.4rem]">
          {subject.headline}
        </h1>
        <p className="mt-4 max-w-xl font-serif text-[1.16rem] leading-relaxed muted">{subject.intro}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-[13px] muted">
          <span className="rounded-full border hairline px-3 py-1.5">{subject.chapters.length} chapters</span>
          <span className="rounded-full border hairline px-3 py-1.5">{totalSims} interactive simulations</span>
          <span className="rounded-full border hairline px-3 py-1.5">{totalQ} practice questions</span>
        </div>
        <ProgressStrip subject={subject.slug} total={subject.chapters.length} accent={subject.accent} />
      </section>

      {subject.unitOrder.map((uk) => {
        const u = subject.units[uk];
        const chs = subject.chapters.filter((c) => c.unit === uk);
        if (!u || !chs.length) return null;
        return (
          <section key={uk} className="mt-14">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-[1.3rem] font-semibold tracking-tight">{u.short}</h2>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ background: tint(u.hue, 14), color: u.hue }}>{u.marks}</span>
              <span className="text-[13px] faint">{u.name}</span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {chs.map((c) => {
                const sims = c.blocks.filter((b) => b.t === "sim").length;
                return (
                  <Link key={c.slug} href={`/${subject.slug}/${c.slug}`}
                    className="group relative overflow-hidden rounded-2xl border hairline p-5 transition hover:-translate-y-0.5"
                    style={{ boxShadow: "var(--shadow)" }}>
                    <span className="absolute left-0 top-0 h-full w-1" style={{ background: u.hue }} />
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[12px] font-bold" style={{ color: u.hue }}>
                        {String(c.num).padStart(2, "0")}
                      </span>
                      <h3 className="text-[1.02rem] font-semibold leading-snug">{c.title}</h3>
                    </div>
                    <p className="mt-2 text-[0.9rem] leading-relaxed muted">{c.blurb}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] faint">
                      <span>{c.minutes} min</span><span>·</span>
                      <span>{sims} interactive{sims === 1 ? "" : "s"}</span><span>·</span>
                      <span>{c.quiz.length} questions</span>
                      {c.formative && (
                        <span className="rounded-full bg-amber-500/12 px-2 py-0.5 font-semibold text-amber-700 dark:text-amber-300">
                          {c.formativeLabel ?? "formative only"}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {subject.paperNote && (
        <section className="mt-16 rounded-2xl border hairline p-6">
          <h2 className="text-[1.15rem] font-semibold tracking-tight">How the marks are split</h2>
          <div className="mt-4 flex h-4 overflow-hidden rounded-full">
            {subject.unitOrder.map((uk) => {
              const u = subject.units[uk];
              if (!u) return null;
              return <div key={uk} title={`${u.short} — ${u.marks}`}
                style={{ width: `${(u.marksValue / subject.paperMarks) * 100}%`, background: u.hue }} />;
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] muted">
            {subject.unitOrder.map((uk) => {
              const u = subject.units[uk];
              if (!u) return null;
              return (
                <span key={uk} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: u.hue }} />
                  {u.short} — {u.marks}
                </span>
              );
            })}
          </div>
          <p className="mt-4 text-[0.9rem] muted">{subject.paperNote}</p>
        </section>
      )}
    </div>
  );
}
