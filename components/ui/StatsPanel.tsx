"use client";
import { useEffect, useState } from "react";
import { dashboard } from "@/lib/progress";

function Ring({ pct, label, sub }: { pct: number; label: string; sub: string }) {
  const r = 26, c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="7" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--accent)" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(pct, 100) / 100)} />
      </svg>
      <div>
        <div className="text-[1.4rem] font-semibold leading-none tabular-nums">{label}</div>
        <div className="mt-1 text-[12px] faint">{sub}</div>
      </div>
    </div>
  );
}

export default function StatsPanel() {
  const [d, setD] = useState<ReturnType<typeof dashboard> | null>(null);
  useEffect(() => {
    const sync = () => setD(dashboard());
    sync();
    window.addEventListener("classx-progress", sync);
    return () => window.removeEventListener("classx-progress", sync);
  }, []);

  if (!d) return <div className="mt-12 h-40" id="stats" />;

  if (d.answered === 0) {
    return (
      <section id="stats" className="mt-12 rounded-2xl border hairline p-6">
        <h2 className="text-[1.15rem] font-semibold tracking-tight">Your progress</h2>
        <p className="mt-2 text-[0.92rem] muted">
          Answer your first quiz question and this turns into a live scoreboard — level, daily streak,
          accuracy and badges to unlock. Everything stays on this device.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {d.badges.slice(0, 5).map((b) => (
            <span key={b.id} title={b.blurb} className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-2)] text-[16px] opacity-40 grayscale">{b.icon}</span>
          ))}
          <span className="self-center text-[12px] faint">{d.badges.length} badges to earn</span>
        </div>
      </section>
    );
  }

  return (
    <section id="stats" className="mt-12 rounded-2xl border hairline p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[1.15rem] font-semibold tracking-tight">Your progress</h2>
        <span className="text-[12px] faint">{d.earnedCount} of {d.badges.length} badges · {d.xp} XP</span>
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-3">
        {/* level */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Level</span>
            <span className="text-[11px] faint tabular-nums">{d.into}/{d.span} XP</span>
          </div>
          <div className="mt-1 text-[1.9rem] font-semibold leading-none tabular-nums">{d.level}</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${d.pct}%` }} />
          </div>
        </div>
        {/* daily goal */}
        <Ring pct={(d.today / d.goal) * 100} label={`${d.today}/${d.goal}`} sub={d.today >= d.goal ? "Daily goal done ✓" : "Questions today"} />
        {/* streak */}
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Streak</div>
            <div className="mt-1 text-[1.9rem] font-semibold leading-none tabular-nums" style={{ color: d.streak > 0 ? "#f97316" : undefined }}>🔥 {d.streak}</div>
            <div className="mt-1 text-[12px] faint">best {d.longest} · {d.accuracy}% accuracy</div>
          </div>
        </div>
      </div>

      {/* badges */}
      <div className="mt-6 border-t hairline pt-5">
        <div className="text-[11px] font-bold uppercase tracking-[0.09em] faint">Badges</div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {d.badges.map((b) => {
            const got = b.earned;
            return (
              <div key={b.id} className={`flex items-center gap-3 rounded-xl border hairline px-3 py-2.5 ${got ? "" : "opacity-45"}`}>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-[18px] ${got ? "bg-[var(--accent)]/12" : "bg-[var(--surface-2)] grayscale"}`}>{b.icon}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[0.85rem] font-semibold">{b.name}</span>
                  <span className="block truncate text-[11px] faint">{b.blurb}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
