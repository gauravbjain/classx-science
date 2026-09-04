"use client";
import React from "react";

export function SimFrame({
  title, caption, children, onReset,
}: { title?: string; caption?: string; children: React.ReactNode; onReset?: () => void }) {
  return (
    <figure className="no-print my-8 overflow-hidden rounded-2xl border hairline bg-[var(--surface)]" style={{ boxShadow: "var(--shadow)" }}>
      <div className="flex items-center gap-3 border-b hairline bg-[var(--surface-2)] px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          </span>
          Try it
        </span>
        {title && <span className="truncate text-[13px] font-medium">{title}</span>}
        {onReset && (
          <button onClick={onReset} className="ml-auto shrink-0 rounded-full border hairline px-2.5 py-1 text-[11px] font-medium transition hover:bg-[var(--surface)]">
            Reset
          </button>
        )}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
      {caption && <figcaption className="border-t hairline px-4 py-2.5 text-[0.8rem] faint">{caption}</figcaption>}
    </figure>
  );
}

export function Slider({
  label, value, min, max, step = 1, onChange, unit = "", fmt,
}: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; unit?: string; fmt?: (v: number) => string;
}) {
  return (
    <label className="block">
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-medium muted">{label}</span>
        <span className="font-mono text-[12px] font-semibold tabular-nums">
          {fmt ? fmt(value) : value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}

export function Choice<T extends string | number>({
  label, value, options, onChange,
}: { label?: string; value: T; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <div>
      {label && <div className="mb-1 text-[12px] font-medium muted">{label}</div>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={String(o.v)}
            onClick={() => onChange(o.v)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
              value === o.v
                ? "bg-[var(--accent)] text-white"
                : "border hairline hover:bg-[var(--surface-2)]"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Readout({ items }: { items: { k: string; v: string; hi?: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {items.map((it, i) => (
        <div key={i} className={`rounded-lg px-3 py-2 ${it.hi ? "bg-[var(--accent)]/10" : "bg-[var(--surface-2)]"}`}>
          <div className="text-[10px] font-semibold uppercase tracking-wider faint">{it.k}</div>
          <div className="mt-0.5 font-mono text-[15px] font-semibold tabular-nums" dangerouslySetInnerHTML={{ __html: it.v }} />
        </div>
      ))}
    </div>
  );
}

export function Verdict({ ok, children }: { ok: boolean | null; children: React.ReactNode }) {
  if (ok === null) return <div className="rounded-lg bg-[var(--surface-2)] px-4 py-3 text-[0.9rem] muted">{children}</div>;
  return (
    <div className={`rounded-lg px-4 py-3 text-[0.9rem] ${ok ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-rose-500/10 text-rose-700 dark:text-rose-300"}`}>
      {children}
    </div>
  );
}

export const useDrag = (ref: React.RefObject<SVGSVGElement | null>) => {
  return React.useCallback(
    (e: React.PointerEvent, cb: (x: number, y: number) => void) => {
      const svg = ref.current;
      if (!svg) return;
      const move = (ev: PointerEvent | React.PointerEvent) => {
        const r = svg.getBoundingClientRect();
        const vb = svg.viewBox.baseVal;
        const x = ((("clientX" in ev ? ev.clientX : 0) - r.left) / r.width) * vb.width + vb.x;
        const y = ((("clientY" in ev ? ev.clientY : 0) - r.top) / r.height) * vb.height + vb.y;
        cb(x, y);
      };
      move(e);
      const onMove = (ev: PointerEvent) => { ev.preventDefault(); move(ev); };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove, { passive: false });
      window.addEventListener("pointerup", onUp);
    },
    [ref]
  );
};
