"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { dashboard } from "@/lib/progress";

export default function StreakChip() {
  const [d, setD] = useState<ReturnType<typeof dashboard> | null>(null);
  useEffect(() => {
    const sync = () => setD(dashboard());
    sync();
    window.addEventListener("classx-progress", sync);
    return () => window.removeEventListener("classx-progress", sync);
  }, []);

  if (!d || d.xp === 0) return null; // appears once he answers his first question

  return (
    <Link href="/#stats" title={`Level ${d.level} · ${d.streak}-day streak · ${d.today}/${d.goal} today`}
      className="flex shrink-0 items-center gap-2 rounded-full border hairline px-2.5 py-1.5 text-[12px] font-semibold">
      <span className="tabular-nums" style={{ color: d.streak > 0 ? "#f97316" : "var(--ink-3)" }}>
        🔥 {d.streak}
      </span>
      <span className="h-3 w-px bg-[var(--line)]" />
      <span className="tabular-nums">Lv {d.level}</span>
      <span className="hidden h-1.5 w-10 overflow-hidden rounded-full bg-[var(--surface-2)] sm:block">
        <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${d.pct}%` }} />
      </span>
    </Link>
  );
}
