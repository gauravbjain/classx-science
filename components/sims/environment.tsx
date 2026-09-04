"use client";
import React, { useState } from "react";
import { SimFrame, Slider, Choice, Readout } from "./shell";

/* ============================================================== FOOD CHAIN */
const CHAINS = [
  { v: "grass", l: "Grassland", links: ["Grass", "Grasshopper", "Frog", "Snake", "Hawk"] },
  { v: "pond", l: "Pond", links: ["Algae", "Water flea", "Small fish", "Big fish", "Kingfisher"] },
  { v: "forest", l: "Forest", links: ["Leaves", "Deer", "Tiger"] },
];

export function FoodChain() {
  const [c, setC] = useState("grass");
  const [E, setE] = useState(10000);
  const chain = CHAINS.find((x) => x.v === c)!;
  const energies = chain.links.map((_, i) => E * Math.pow(0.1, i));

  return (
    <SimFrame title="The 10% law" onReset={() => { setC("grass"); setE(10000); }}
      caption="Only about 10% of the energy at one level passes to the next. The other 90% is lost as heat, movement and life processes.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Ecosystem" value={c} onChange={setC} options={CHAINS.map((x) => ({ v: x.v, l: x.l }))} />
        <Slider label="Energy captured by producers" value={E} min={1000} max={100000} step={1000} onChange={setE}
          fmt={(v) => v.toLocaleString("en-IN")} unit=" J" />
      </div>

      <div className="mt-5 space-y-2">
        {chain.links.map((l, i) => {
          const w = Math.max(6, Math.pow(0.1, i) * 100);
          const label = ["Producer", "Primary consumer", "Secondary consumer", "Tertiary consumer", "Quaternary consumer"][i];
          return (
            <div key={l} className="flex items-center gap-3">
              <div className="w-6 shrink-0 text-right font-mono text-[11px] faint">T{i + 1}</div>
              <div className="min-w-0 flex-1">
                <div className="flex h-11 items-center rounded-lg px-3 text-[13px] font-semibold text-white transition-all"
                  style={{ width: `${w}%`, minWidth: "8.5rem", background: `hsl(${140 - i * 26} 62% ${44 + i * 4}%)` }}>
                  {l}
                </div>
              </div>
              <div className="w-28 shrink-0 text-right">
                <div className="font-mono text-[12.5px] font-semibold tabular-nums">{energies[i].toLocaleString("en-IN", { maximumFractionDigits: 1 })} J</div>
                <div className="text-[10px] faint">{label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <Readout items={[
          { k: "Trophic levels", v: String(chain.links.length) },
          { k: "Top-level energy", v: `${energies[energies.length - 1].toFixed(1)} J`, hi: true },
          { k: "Energy lost", v: `${(100 - Math.pow(0.1, chain.links.length - 1) * 100).toFixed(2)}%`, hi: true },
          { k: "Why chains are short", v: "Energy runs out" },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        This is exactly why food chains rarely have more than four or five links — and why there are always far fewer
        tigers than deer. It is also why harmful chemicals get <strong>more concentrated</strong> at each level
        (biomagnification): the energy shrinks but the poison does not.
      </p>
    </SimFrame>
  );
}

/* ============================================================ WASTE SORTER */
const ITEMS = [
  { n: "Banana peel", bio: true }, { n: "Plastic bottle", bio: false }, { n: "Paper", bio: true },
  { n: "Aluminium foil", bio: false }, { n: "Cotton cloth", bio: true }, { n: "Glass jar", bio: false },
  { n: "Leftover dal", bio: true }, { n: "Thermocol", bio: false }, { n: "Wooden spoon", bio: true },
  { n: "DDT", bio: false }, { n: "Cow dung", bio: true }, { n: "Silver foil sweets", bio: false },
];

export function WasteSorter() {
  const [answers, setAnswers] = useState<Record<string, boolean | undefined>>({});
  const done = Object.keys(answers).length;
  const correct = ITEMS.filter((i) => answers[i.n] === i.bio).length;

  return (
    <SimFrame title="Sort the waste" onReset={() => setAnswers({})}
      caption="Biodegradable waste is broken down by decomposers. Non-biodegradable waste just accumulates — and works its way up the food chain.">
      <div className="grid gap-2 sm:grid-cols-2">
        {ITEMS.map((it) => {
          const a = answers[it.n];
          const graded = a !== undefined;
          const ok = a === it.bio;
          return (
            <div key={it.n} className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
              !graded ? "hairline" : ok ? "border-emerald-500/50 bg-emerald-500/8" : "border-rose-500/50 bg-rose-500/8"}`}>
              <span className="min-w-0 flex-1 truncate text-[0.9rem]">{it.n}</span>
              {(["bio", "non"] as const).map((k) => {
                const val = k === "bio";
                const active = a === val;
                return (
                  <button key={k} onClick={() => setAnswers((s) => ({ ...s, [it.n]: val }))}
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                      active ? (ok ? "bg-emerald-500 text-white" : "bg-rose-500 text-white") : "border hairline hover:bg-[var(--surface-2)]"}`}>
                    {val ? "Bio" : "Non-bio"}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(correct / ITEMS.length) * 100}%` }} />
        </div>
        <span className="font-mono text-[13px] font-semibold tabular-nums">{correct}/{ITEMS.length}</span>
      </div>
      {done === ITEMS.length && (
        <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted fade-up">
          The tricky ones: paper and cotton are biodegradable because they come from plants. DDT and thermocol are not —
          DDT is the classic example of a chemical that builds up in bodies all the way up the food chain.
        </p>
      )}
    </SimFrame>
  );
}

/* ================================================================ OZONE */
export function OzoneShield() {
  const [cfc, setCfc] = useState(20);
  const hole = Math.min(1, cfc / 100);
  const uv = Math.round(hole * 100);

  return (
    <SimFrame title="The ozone shield" onReset={() => setCfc(20)}
      caption="Ozone (O₃) high in the stratosphere absorbs the sun's harmful UV. CFCs from old refrigerators and spray cans break it apart.">
      <svg viewBox="0 0 700 260" className="w-full select-none" style={{ maxHeight: 250 }}>
        <rect x={0} y={0} width={700} height={260} rx={12} fill="#0b1220" />
        {/* sun + UV rays */}
        <circle cx={80} cy={45} r={26} fill="#fbbf24" />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x0 = 120 + i * 95;
          const blocked = (i / 6) > hole;
          return (
            <g key={i}>
              <line x1={x0} y1={20} x2={x0 + 22} y2={104} stroke="#a78bfa" strokeWidth={3} />
              {!blocked && <line x1={x0 + 22} y1={104} x2={x0 + 48} y2={210} stroke="#f43f5e" strokeWidth={3} />}
              {blocked && <text x={x0 + 22} y={98} fontSize={16} fill="#22c55e" textAnchor="middle">✓</text>}
            </g>
          );
        })}
        {/* ozone layer */}
        <rect x={20} y={100} width={660} height={16} rx={8} fill="#22d3ee" opacity={0.75} />
        <rect x={20 + (1 - hole) * 330} y={100} width={hole * 660} height={16} rx={8} fill="#0b1220" />
        <text x={40} y={94} fontSize={12} fill="#67e8f9" fontWeight={600}>ozone layer (O₃)</text>
        {/* earth */}
        <rect x={0} y={210} width={700} height={50} fill="#166534" opacity={0.85} />
        <text x={350} y={240} fontSize={13} textAnchor="middle" fill="#dcfce7" fontWeight={600}>Earth&apos;s surface</text>
      </svg>
      <Slider label="CFCs released into the atmosphere" value={cfc} min={0} max={100} onChange={setCfc} unit="%" />
      <div className="mt-3">
        <Readout items={[
          { k: "Ozone intact", v: `${100 - uv}%`, hi: true },
          { k: "UV reaching us", v: `${uv}%`, hi: true },
          { k: "Main risk", v: "Skin cancer, cataract" },
          { k: "Fix", v: "1987 Montreal Protocol" },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        The ozone story is the one genuine environmental success so far: after CFCs were banned worldwide in 1987,
        the layer slowly began repairing itself. Damage is reversible — but only if everyone acts together.
      </p>
    </SimFrame>
  );
}
