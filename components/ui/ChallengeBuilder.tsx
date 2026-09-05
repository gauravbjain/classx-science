"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { encodeChallenge, type ChallengeSpec } from "@/lib/challenge";

type SubjInfo = { slug: string; name: string; accent: string; chapters: { slug: string; quiz: number }[] };

export default function ChallengeBuilder({ subjects }: { subjects: SubjInfo[] }) {
  const [slug, setSlug] = useState(subjects[0]?.slug ?? "");
  const [count, setCount] = useState(10);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  const subject = useMemo(() => subjects.find((s) => s.slug === slug)!, [subjects, slug]);
  const pool = useMemo(
    () => subject.chapters.flatMap((c) => Array.from({ length: c.quiz }, (_, i) => [c.slug, i] as [string, number])),
    [subject]
  );
  const maxN = Math.min(pool.length, 20);

  function generate() {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
    const spec: ChallengeSpec = { s: slug, t: title.trim() || `${subject.name} Challenge`, q: shuffled };
    const code = encodeChallenge(spec);
    setLink(`${window.location.origin}/challenge?d=${code}`);
    setCopied(false);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ }
  }
  async function share() {
    if (navigator.share) { try { await navigator.share({ title: "Beat my score!", url: link }); } catch { /* cancelled */ } }
    else copy();
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <h1 className="text-[2rem] font-semibold tracking-tight sm:text-[2.5rem]">Challenge a friend</h1>
      <p className="mt-3 font-serif text-[1.1rem] muted">
        Build a quick quiz, send the link to your uncle (or a classmate), and see who scores higher on the
        exact same questions.
      </p>

      <div className="mt-8 space-y-5 rounded-2xl border hairline p-6">
        <div>
          <label className="text-[0.85rem] font-semibold">Subject</label>
          <select value={slug} onChange={(e) => { setSlug(e.target.value); setLink(""); }}
            className="mt-1.5 w-full rounded-xl border hairline bg-[var(--surface)] px-4 py-2.5 text-[0.95rem]">
            {subjects.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[0.85rem] font-semibold">Number of questions</label>
          <div className="mt-1.5 flex gap-2">
            {[5, 10, 15].filter((n) => n <= maxN).map((n) => (
              <button key={n} onClick={() => { setCount(n); setLink(""); }}
                className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${count === n ? "bg-[var(--ink)] text-[var(--bg)]" : "border hairline faint hover:bg-[var(--surface-2)]"}`}>{n}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-[0.85rem] font-semibold">Title <span className="faint font-normal">(optional)</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`${subject.name} Challenge`}
            className="mt-1.5 w-full rounded-xl border hairline bg-[var(--surface)] px-4 py-2.5 text-[0.95rem]" />
        </div>

        <button onClick={generate} className="rounded-full px-6 py-2.5 text-[14px] font-semibold text-white" style={{ background: subject.accent }}>
          Generate challenge link
        </button>
      </div>

      {link && (
        <div className="mt-6 rounded-2xl bg-[var(--surface-2)] p-5 fade-up">
          <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Your challenge link</div>
          <div className="mt-2 flex gap-2">
            <input readOnly value={link} onFocus={(e) => e.target.select()}
              className="min-w-0 flex-1 rounded-xl border hairline bg-[var(--surface)] px-3 py-2 text-[12px]" />
            <button onClick={copy} className="shrink-0 rounded-xl bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-white">{copied ? "Copied ✓" : "Copy"}</button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={share} className="rounded-full border hairline px-4 py-2 text-[13px] font-medium hover:bg-[var(--surface-2)]">Share…</button>
            <Link href={`/challenge?d=${link.split("d=")[1]}`} className="rounded-full border hairline px-4 py-2 text-[13px] font-medium hover:bg-[var(--surface-2)]">Try it yourself →</Link>
          </div>
          <p className="mt-3 text-[12px] faint">Whoever opens it answers the same questions. Compare scores at the end — screenshot yours to send back!</p>
        </div>
      )}
    </div>
  );
}
