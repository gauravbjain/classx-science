import Link from "next/link";
import { SUBJECTS } from "@/content";
import LibraryProgress from "@/components/ui/LibraryProgress";
import StatsPanel from "@/components/ui/StatsPanel";
import Greeting from "@/components/ui/Greeting";

export default function Library() {
  const live = SUBJECTS.filter((s) => s.status === "live");
  const planned = SUBJECTS.filter((s) => s.status === "planned");

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20">
      <Greeting subjects={live.map((s) => ({ slug: s.slug, name: s.name }))} />
      <p className="mt-6 text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
        CBSE · Class X · Session 2026-27
      </p>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        {live.map((s) => {
          const sims = s.chapters.reduce((a, c) => a + c.blocks.filter((b) => b.t === "sim").length, 0);
          const qs = s.chapters.reduce((a, c) => a + c.quiz.length, 0);
          return (
            <Link key={s.slug} href={`/${s.slug}`}
              className="group relative overflow-hidden rounded-2xl border hairline p-6 transition hover:-translate-y-0.5"
              style={{ boxShadow: "var(--shadow)" }}>
              <span className="absolute left-0 top-0 h-full w-1.5" style={{ background: s.accent }} />
              <h2 className="text-[1.4rem] font-semibold tracking-tight">{s.name}</h2>
              <p className="mt-2 text-[0.95rem] leading-relaxed muted">{s.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11.5px] faint">
                <span className="rounded-full border hairline px-2.5 py-1">{s.chapters.length} chapters</span>
                <span className="rounded-full border hairline px-2.5 py-1">{sims} interactives</span>
                <span className="rounded-full border hairline px-2.5 py-1">{qs} questions</span>
              </div>
              <LibraryProgress subject={s.slug} total={s.chapters.length} accent={s.accent} />
              <span className="mt-4 inline-block text-[13px] font-medium" style={{ color: s.accent }}>
                Open {s.name} →
              </span>
            </Link>
          );
        })}

        {planned.map((s) => (
          <div key={s.slug} className="relative overflow-hidden rounded-2xl border hairline border-dashed p-6 opacity-70">
            <span className="absolute left-0 top-0 h-full w-1.5 opacity-40" style={{ background: s.accent }} />
            <div className="flex items-center gap-2">
              <h2 className="text-[1.4rem] font-semibold tracking-tight">{s.name}</h2>
              <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-semibold faint">
                coming next
              </span>
            </div>
            <p className="mt-2 text-[0.95rem] leading-relaxed muted">{s.tagline}</p>
          </div>
        ))}
      </section>

      <StatsPanel />

      <p className="mt-10 text-[0.9rem] faint">
        Progress is saved separately for each subject, in this browser only.
      </p>
    </div>
  );
}
