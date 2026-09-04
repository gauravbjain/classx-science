"use client";

import type { Block, NoteKind } from "@/lib/types";
import Sim from "@/components/sims/registry";
import { useState } from "react";

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const NOTE_STYLE: Record<NoteKind, { label: string; icon: string; bar: string; tint: string; fg: string }> = {
  idea:   { label: "The key idea",     icon: "◆", bar: "bg-violet-500",  tint: "bg-violet-500/8",  fg: "text-violet-600 dark:text-violet-300" },
  real:   { label: "In real life",     icon: "◈", bar: "bg-amber-500",   tint: "bg-amber-500/8",   fg: "text-amber-600 dark:text-amber-300" },
  exam:   { label: "Board exam focus", icon: "▲", bar: "bg-sky-500",     tint: "bg-sky-500/8",     fg: "text-sky-600 dark:text-sky-300" },
  trap:   { label: "Common mistake",   icon: "!",  bar: "bg-rose-500",    tint: "bg-rose-500/8",    fg: "text-rose-600 dark:text-rose-300" },
  why:    { label: "Why it happens",   icon: "?",  bar: "bg-teal-500",    tint: "bg-teal-500/8",    fg: "text-teal-600 dark:text-teal-300" },
  memory: { label: "Memory hook",      icon: "★", bar: "bg-fuchsia-500", tint: "bg-fuchsia-500/8", fg: "text-fuchsia-600 dark:text-fuchsia-300" },
};

function H({ text }: { text: string }) {
  const id = slugify(text);
  return (
    <h2 id={id} className="scroll-mt-24 pt-10 text-[1.35rem] font-semibold tracking-tight sm:text-2xl">
      {text}
    </h2>
  );
}

function Note({ kind, title, html }: { kind: NoteKind; title?: string; html: string }) {
  const s = NOTE_STYLE[kind];
  return (
    <div className={`relative my-6 overflow-hidden rounded-xl ${s.tint} pl-5 pr-4 py-4`}>
      <span className={`absolute left-0 top-0 h-full w-1 ${s.bar}`} />
      <div className={`mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.09em] ${s.fg}`}>
        <span aria-hidden>{s.icon}</span>
        {title ?? s.label}
      </div>
      <div className="prose-body text-[0.97rem]" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function Formula({ expr, name, where }: { expr: string; name?: string; where?: string[] }) {
  return (
    <div className="my-6 rounded-xl border hairline bg-[var(--surface-2)] px-5 py-4">
      {name && <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.09em] faint">{name}</div>}
      <div
        className="font-serif text-[1.3rem] leading-relaxed text-[var(--ink)] sm:text-[1.45rem]"
        dangerouslySetInnerHTML={{ __html: expr }}
      />
      {where && where.length > 0 && (
        <div className="mt-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.09em] faint">where</div>
          <ul className="mt-1 space-y-1 text-[0.86rem] muted">
            {where.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-[0.62em] h-1 w-1 shrink-0 rounded-full bg-[var(--line-strong)]" />
                <span dangerouslySetInnerHTML={{ __html: w }} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Eq({ lines, caption }: { lines: string[]; caption?: string }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border hairline bg-[var(--surface-2)] px-5 py-4 no-scrollbar">
      <div className="chem space-y-2 whitespace-nowrap text-[0.95rem]">
        {lines.map((l, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: l }} />
        ))}
      </div>
      {caption && <div className="mt-3 text-[0.8rem] faint whitespace-normal">{caption}</div>}
    </div>
  );
}

function Table({ head, rows, caption }: { head: string[]; rows: string[][]; caption?: string }) {
  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-xl border hairline">
        <table className="w-full min-w-[30rem] border-collapse text-[0.9rem]">
          <thead>
            <tr className="bg-[var(--surface-2)]">
              {head.map((h, i) => (
                <th key={i} className="border-b hairline px-4 py-2.5 text-left font-semibold" dangerouslySetInnerHTML={{ __html: h }} />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="align-top">
                {r.map((c, j) => (
                  <td key={j} className="border-b hairline px-4 py-2.5 muted last:border-0" dangerouslySetInnerHTML={{ __html: c }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="mt-2 text-[0.8rem] faint">{caption}</figcaption>}
    </figure>
  );
}

function Steps({ title, intro, steps, answer }: { title?: string; intro?: string; steps: string[]; answer?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="my-6 rounded-xl border hairline overflow-hidden">
      <div className="bg-[var(--surface-2)] px-5 py-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Worked example</div>
        {title && <div className="mt-1 font-medium">{title}</div>}
      </div>
      <div className="px-5 py-4">
        {intro && <p className="prose-body text-[0.95rem]" dangerouslySetInnerHTML={{ __html: intro }} />}
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="mt-3 rounded-full border hairline px-4 py-1.5 text-[13px] font-medium transition hover:bg-[var(--surface-2)]"
          >
            Show the solution step by step
          </button>
        ) : (
          <ol className="mt-4 space-y-3 fade-up">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="prose-body text-[0.95rem]" dangerouslySetInnerHTML={{ __html: s }} />
              </li>
            ))}
            {answer && (
              <li className="ml-8 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-[0.95rem] font-medium text-emerald-700 dark:text-emerald-300">
                <span dangerouslySetInnerHTML={{ __html: answer }} />
              </li>
            )}
          </ol>
        )}
      </div>
    </div>
  );
}

function Compare({ left, right }: { left: { title: string; items: string[] }; right: { title: string; items: string[] } }) {
  return (
    <div className="my-6 grid gap-3 sm:grid-cols-2">
      {[left, right].map((col, i) => (
        <div key={i} className="rounded-xl border hairline p-4">
          <div className={`mb-2 text-[13px] font-semibold ${i === 0 ? "text-sky-600 dark:text-sky-300" : "text-rose-600 dark:text-rose-300"}`}>
            {col.title}
          </div>
          <ul className="space-y-1.5">
            {col.items.map((it, j) => (
              <li key={j} className="flex gap-2 text-[0.9rem] muted">
                <span className={`mt-[0.55em] h-1 w-1 shrink-0 rounded-full ${i === 0 ? "bg-sky-500" : "bg-rose-500"}`} />
                <span dangerouslySetInnerHTML={{ __html: it }} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h":
            return <H key={i} text={b.text} />;
          case "p":
            return <p key={i} className="prose-body mt-4" dangerouslySetInnerHTML={{ __html: b.html }} />;
          case "list":
            return b.ordered ? (
              <ol key={i} className="mt-4 space-y-2 pl-1">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[11px] font-semibold">{j + 1}</span>
                    <span className="prose-body" dangerouslySetInnerHTML={{ __html: it }} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="mt-4 space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3">
                    <span className="mt-[0.72em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <span className="prose-body" dangerouslySetInnerHTML={{ __html: it }} />
                  </li>
                ))}
              </ul>
            );
          case "note":
            return <Note key={i} {...b} />;
          case "formula":
            return <Formula key={i} {...b} />;
          case "eq":
            return <Eq key={i} {...b} />;
          case "table":
            return <Table key={i} {...b} />;
          case "steps":
            return <Steps key={i} {...b} />;
          case "compare":
            return <Compare key={i} {...b} />;
          case "sim":
            return <Sim key={i} id={b.id} title={b.title} caption={b.caption} />;
          default:
            return null;
        }
      })}
    </>
  );
}
