"use client";
import React, { useMemo, useState } from "react";
import { SimFrame, Slider, Choice, Readout, Verdict } from "./shell";

/* ======================================================= EQUATION BALANCER */
type Species = { f: string; atoms: Record<string, number> };
type Eqn = { name: string; left: Species[]; right: Species[]; hint: string };

const EQNS: Eqn[] = [
  {
    name: "Burning of magnesium",
    left: [{ f: "Mg", atoms: { Mg: 1 } }, { f: "O₂", atoms: { O: 2 } }],
    right: [{ f: "MgO", atoms: { Mg: 1, O: 1 } }],
    hint: "Oxygen comes as O₂, so you always need an even number of O atoms on the right.",
  },
  {
    name: "Iron + steam",
    left: [{ f: "Fe", atoms: { Fe: 1 } }, { f: "H₂O", atoms: { H: 2, O: 1 } }],
    right: [{ f: "Fe₃O₄", atoms: { Fe: 3, O: 4 } }, { f: "H₂", atoms: { H: 2 } }],
    hint: "Start with Fe₃O₄ — it fixes both Fe and O in one go.",
  },
  {
    name: "Combustion of methane",
    left: [{ f: "CH₄", atoms: { C: 1, H: 4 } }, { f: "O₂", atoms: { O: 2 } }],
    right: [{ f: "CO₂", atoms: { C: 1, O: 2 } }, { f: "H₂O", atoms: { H: 2, O: 1 } }],
    hint: "Balance C first, then H, and leave O for last — that's the standard order.",
  },
  {
    name: "Aluminium + copper chloride",
    left: [{ f: "Al", atoms: { Al: 1 } }, { f: "CuCl₂", atoms: { Cu: 1, Cl: 2 } }],
    right: [{ f: "AlCl₃", atoms: { Al: 1, Cl: 3 } }, { f: "Cu", atoms: { Cu: 1 } }],
    hint: "Chlorine appears as 2 on the left and 3 on the right — think LCM.",
  },
  {
    name: "Decomposition of lead nitrate",
    left: [{ f: "Pb(NO₃)₂", atoms: { Pb: 1, N: 2, O: 6 } }],
    right: [{ f: "PbO", atoms: { Pb: 1, O: 1 } }, { f: "NO₂", atoms: { N: 1, O: 2 } }, { f: "O₂", atoms: { O: 2 } }],
    hint: "Balance Pb, then N, then count every oxygen carefully.",
  },
];

export function EquationBalancer() {
  const [ei, setEi] = useState(0);
  const eq = EQNS[ei];
  const [L, setL] = useState<number[]>(() => EQNS[0].left.map(() => 1));
  const [R, setR] = useState<number[]>(() => EQNS[0].right.map(() => 1));
  const [showHint, setShowHint] = useState(false);

  const pick = (i: number) => {
    setEi(i); setL(EQNS[i].left.map(() => 1)); setR(EQNS[i].right.map(() => 1)); setShowHint(false);
  };

  const elements = useMemo(() => {
    const s = new Set<string>();
    [...eq.left, ...eq.right].forEach((sp) => Object.keys(sp.atoms).forEach((e) => s.add(e)));
    return Array.from(s);
  }, [eq]);

  const count = (side: Species[], coef: number[], el: string) =>
    side.reduce((sum, sp, i) => sum + (sp.atoms[el] ?? 0) * coef[i], 0);

  const balanced = elements.every((el) => count(eq.left, L, el) === count(eq.right, R, el));

  const Step = ({ v, set }: { v: number; set: (n: number) => void }) => (
    <span className="inline-flex items-center overflow-hidden rounded-md border hairline align-middle">
      <button onClick={() => set(Math.max(1, v - 1))} className="px-1.5 py-0.5 text-[12px] hover:bg-[var(--surface-2)]">−</button>
      <span className="min-w-[1.6rem] px-1 text-center font-mono text-[13px] font-bold">{v}</span>
      <button onClick={() => set(Math.min(9, v + 1))} className="px-1.5 py-0.5 text-[12px] hover:bg-[var(--surface-2)]">+</button>
    </span>
  );

  return (
    <SimFrame title="Balance the equation" onReset={() => pick(ei)}
      caption="Atoms are never created or destroyed — that is the law of conservation of mass, and it is the only reason we balance equations at all.">
      <Choice label="Reaction" value={ei} onChange={pick} options={EQNS.map((e, i) => ({ v: i, l: e.name }))} />

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-3 rounded-xl bg-[var(--surface-2)] px-4 py-4 text-[1.05rem]">
        {eq.left.map((sp, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="mx-1 faint">+</span>}
            <Step v={L[i]} set={(n) => setL((a) => a.map((x, k) => (k === i ? n : x)))} />
            <span className="chem font-semibold">{sp.f}</span>
          </React.Fragment>
        ))}
        <span className="mx-3 text-[var(--accent)]">⟶</span>
        {eq.right.map((sp, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="mx-1 faint">+</span>}
            <Step v={R[i]} set={(n) => setR((a) => a.map((x, k) => (k === i ? n : x)))} />
            <span className="chem font-semibold">{sp.f}</span>
          </React.Fragment>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[22rem] text-center text-[0.88rem]">
          <thead>
            <tr className="faint text-[11px] uppercase tracking-wider">
              <th className="py-1 text-left font-semibold">Atom</th>
              <th className="py-1 font-semibold">Left</th>
              <th className="py-1 font-semibold">Right</th>
              <th className="py-1 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {elements.map((el) => {
              const a = count(eq.left, L, el), b = count(eq.right, R, el);
              return (
                <tr key={el} className="border-t hairline">
                  <td className="py-1.5 text-left font-mono font-semibold">{el}</td>
                  <td className="py-1.5 font-mono tabular-nums">{a}</td>
                  <td className="py-1.5 font-mono tabular-nums">{b}</td>
                  <td className={`py-1.5 font-semibold ${a === b ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                    {a === b ? "✓" : "✗"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <Verdict ok={balanced}>
          {balanced
            ? "Balanced. Every element has the same number of atoms on both sides."
            : "Not balanced yet — look at the rows marked ✗ and adjust the coefficients."}
        </Verdict>
      </div>
      <button onClick={() => setShowHint((s) => !s)} className="mt-3 text-[13px] font-medium text-[var(--accent)] underline-offset-2 hover:underline">
        {showHint ? "Hide hint" : "Need a hint?"}
      </button>
      {showHint && <p className="mt-2 text-[0.88rem] muted fade-up">{eq.hint}</p>}
    </SimFrame>
  );
}

/* ================================================================ pH SCALE */
const PH_COLORS = ["#c81e1e", "#e02424", "#f05252", "#f98080", "#fbbf24", "#fde047", "#bef264", "#4ade80", "#34d399", "#2dd4bf", "#38bdf8", "#60a5fa", "#818cf8", "#a78bfa", "#7c3aed"];
const SUBSTANCES = [
  { n: "Gastric juice", p: 1.5 }, { n: "Lemon juice", p: 2.2 }, { n: "Vinegar", p: 3 },
  { n: "Tomato", p: 4.5 }, { n: "Black coffee", p: 5 }, { n: "Milk", p: 6.5 },
  { n: "Pure water", p: 7 }, { n: "Blood", p: 7.4 }, { n: "Baking soda", p: 8.5 },
  { n: "Milk of magnesia", p: 10 }, { n: "Lime water", p: 11.5 }, { n: "NaOH solution", p: 13.5 },
];

export function PhScale() {
  const [p, setP] = useState(7);
  const idx = Math.max(0, Math.min(14, Math.round(p)));
  const nature = p < 6.5 ? "Acidic" : p > 7.5 ? "Basic (alkaline)" : "Neutral";
  const nearest = SUBSTANCES.reduce((a, b) => (Math.abs(b.p - p) < Math.abs(a.p - p) ? b : a));

  return (
    <SimFrame title="The pH scale" onReset={() => setP(7)}
      caption="pH is really a measure of how many H⁺ ions are floating around. Each step down the scale means ten times more H⁺.">
      <div className="flex h-14 overflow-hidden rounded-xl">
        {PH_COLORS.map((c, i) => (
          <button key={i} onClick={() => setP(i)} className="relative flex-1 transition"
            style={{ background: c, outline: idx === i ? "3px solid var(--ink)" : "none", outlineOffset: "-3px" }}>
            <span className="text-[11px] font-bold" style={{ color: i > 5 && i < 10 ? "#1c1a17" : "#fff" }}>{i}</span>
          </button>
        ))}
      </div>
      <div className="mt-3"><Slider label="pH" value={p} min={0} max={14} step={0.1} onChange={setP} fmt={(v) => v.toFixed(1)} /></div>

      <div className="mt-3">
        <Readout items={[
          { k: "Nature", v: nature, hi: true },
          { k: "Closest to", v: nearest.n, hi: true },
          { k: "Litmus", v: p < 7 ? "Blue → red" : p > 7 ? "Red → blue" : "No change" },
          { k: "Phenolphthalein", v: p > 8.3 ? "Pink" : "Colourless" },
        ]} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {SUBSTANCES.map((s) => (
          <button key={s.n} onClick={() => setP(s.p)}
            className="rounded-full border hairline px-2.5 py-1 text-[11.5px] transition hover:bg-[var(--surface-2)]">
            {s.n}
          </button>
        ))}
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        {p < 5.6 && p > 4
          ? "Rain below pH 5.6 is called acid rain — it turns rivers acidic and eats into marble buildings."
          : p < 5.5
            ? "Strongly acidic. In your stomach this concentration of HCl is what activates pepsin and kills swallowed bacteria."
            : p > 7.8
              ? "Basic. This is why an antacid (a mild base) neutralises the excess acid that causes indigestion."
              : "Around neutral. Our blood is held very tightly between 7.0 and 7.8 — life stops working outside that range."}
      </p>
    </SimFrame>
  );
}

/* ======================================================== REACTIVITY SERIES */
const SERIES = ["K", "Na", "Ca", "Mg", "Al", "Zn", "Fe", "Pb", "Cu", "Ag", "Au"];
const NAMES: Record<string, string> = { K: "Potassium", Na: "Sodium", Ca: "Calcium", Mg: "Magnesium", Al: "Aluminium", Zn: "Zinc", Fe: "Iron", Pb: "Lead", Cu: "Copper", Ag: "Silver", Au: "Gold" };
const SALTS = [
  { m: "Zn", f: "ZnSO₄", n: "Zinc sulphate", col: "colourless" },
  { m: "Fe", f: "FeSO₄", n: "Iron(II) sulphate", col: "pale green" },
  { m: "Cu", f: "CuSO₄", n: "Copper sulphate", col: "blue" },
  { m: "Ag", f: "AgNO₃", n: "Silver nitrate", col: "colourless" },
];

export function ReactivitySeries() {
  const [metal, setMetal] = useState("Fe");
  const [salt, setSalt] = useState("CuSO₄");
  const s = SALTS.find((x) => x.f === salt)!;
  const reacts = SERIES.indexOf(metal) < SERIES.indexOf(s.m);
  const same = metal === s.m;

  return (
    <SimFrame title="Will it displace?" onReset={() => { setMetal("Fe"); setSalt("CuSO₄"); }}
      caption="A more reactive metal kicks a less reactive one out of its salt solution. That single sentence explains every displacement question in the chapter.">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <Choice label="Drop this metal in…" value={metal} onChange={setMetal}
            options={SERIES.filter((m) => m !== "K" && m !== "Na" && m !== "Ca").map((m) => ({ v: m, l: m }))} />
          <div className="mt-3">
            <Choice label="…this salt solution" value={salt} onChange={setSalt}
              options={SALTS.map((x) => ({ v: x.f, l: x.n }))} />
          </div>
        </div>
        <div className="rounded-xl border hairline p-3">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider faint">Reactivity series</div>
          <div className="space-y-0.5">
            {SERIES.map((m, i) => (
              <div key={m}
                className={`flex items-center gap-2 rounded px-2 py-0.5 text-[11.5px] ${
                  m === metal ? "bg-orange-500/20 font-bold" : m === s.m ? "bg-sky-500/20 font-semibold" : ""}`}>
                <span className="w-4 text-right faint">{i + 1}</span>
                <span className="font-mono font-semibold">{m}</span>
                <span className="faint">{NAMES[m]}</span>
              </div>
            ))}
            <div className="pt-1 text-[10px] faint">most reactive at the top ↑</div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Verdict ok={same ? null : reacts}>
          {same ? (
            <>Same metal — nothing to displace. No reaction.</>
          ) : reacts ? (
            <>
              <strong>Reaction happens.</strong> {NAMES[metal]} sits above {NAMES[s.m]}, so it pushes {NAMES[s.m].toLowerCase()} out.
              The {s.col} solution changes colour and a deposit of {NAMES[s.m].toLowerCase()} appears on the metal.
            </>
          ) : (
            <>
              <strong>No reaction.</strong> {NAMES[metal]} is below {NAMES[s.m]} in the series, so it is not reactive enough to
              displace it. The solution stays {s.col} and the metal looks unchanged.
            </>
          )}
        </Verdict>
      </div>
      {reacts && !same && (
        <div className="mt-3 overflow-x-auto rounded-lg bg-[var(--surface-2)] px-4 py-3 no-scrollbar">
          <div className="chem whitespace-nowrap text-[0.95rem]">
            {metal} (s) + {salt} (aq) ⟶ {metal}{salt.replace(/^[A-Z][a-z]?/, "")} (aq) + {s.m} (s)
          </div>
        </div>
      )}
    </SimFrame>
  );
}

/* ====================================================== HOMOLOGOUS BUILDER */
const PREFIX = ["meth", "eth", "prop", "but", "pent", "hex"];
const FAMILIES = [
  { v: "alkane", l: "Alkane", suffix: "ane", gen: "C<sub>n</sub>H<sub>2n+2</sub>", group: "—", sat: "Saturated (all single bonds)" },
  { v: "alkene", l: "Alkene", suffix: "ene", gen: "C<sub>n</sub>H<sub>2n</sub>", group: "C=C", sat: "Unsaturated (one double bond)" },
  { v: "alkyne", l: "Alkyne", suffix: "yne", gen: "C<sub>n</sub>H<sub>2n−2</sub>", group: "C≡C", sat: "Unsaturated (one triple bond)" },
  { v: "alcohol", l: "Alcohol", suffix: "anol", gen: "C<sub>n</sub>H<sub>2n+1</sub>OH", group: "—OH", sat: "Saturated" },
  { v: "aldehyde", l: "Aldehyde", suffix: "anal", gen: "C<sub>n</sub>H<sub>2n</sub>O", group: "—CHO", sat: "Saturated" },
  { v: "ketone", l: "Ketone", suffix: "anone", gen: "C<sub>n</sub>H<sub>2n</sub>O", group: "&gt;C=O", sat: "Saturated" },
  { v: "acid", l: "Carboxylic acid", suffix: "anoic acid", gen: "C<sub>n</sub>H<sub>2n</sub>O<sub>2</sub>", group: "—COOH", sat: "Saturated" },
];

function molFormula(fam: string, n: number) {
  const sub = (x: number) => `<sub>${x}</sub>`;
  switch (fam) {
    case "alkane": return `C${sub(n)}H${sub(2 * n + 2)}`;
    case "alkene": return `C${sub(n)}H${sub(2 * n)}`;
    case "alkyne": return `C${sub(n)}H${sub(2 * n - 2)}`;
    case "alcohol": return `C${sub(n)}H${sub(2 * n + 1)}OH`;
    case "aldehyde": return `C${sub(n)}H${sub(2 * n)}O`;
    case "ketone": return `C${sub(n)}H${sub(2 * n)}O`;
    default: return `C${sub(n)}H${sub(2 * n)}O${sub(2)}`;
  }
}

export function HomologousBuilder() {
  const [n, setN] = useState(2);
  const [fam, setFam] = useState("alkane");
  const F = FAMILIES.find((f) => f.v === fam)!;
  const minN = fam === "alkene" || fam === "alkyne" ? 2 : fam === "ketone" ? 3 : 1;
  const nn = Math.max(minN, n);
  const name = PREFIX[nn - 1] + F.suffix;
  const massMap: Record<string, number> = { C: 12, H: 1, O: 16 };

  return (
    <SimFrame title="Build a carbon compound" onReset={() => { setN(2); setFam("alkane"); }}
      caption="Every member of a homologous series differs from the next by one —CH₂— unit. That is why they behave so similarly.">
      <Choice label="Family" value={fam} onChange={(v) => { setFam(v); }} options={FAMILIES.map((f) => ({ v: f.v, l: f.l }))} />
      <div className="mt-3"><Slider label="Number of carbon atoms" value={nn} min={minN} max={6} onChange={setN} /></div>

      <svg viewBox="0 0 700 150" className="mt-4 w-full select-none" style={{ maxHeight: 170 }}>
        {Array.from({ length: nn }).map((_, i) => {
          const x = 90 + i * 95;
          const isDouble = fam === "alkene" && i === 0;
          const isTriple = fam === "alkyne" && i === 0;
          return (
            <g key={i}>
              <circle cx={x} cy={75} r={20} fill="#1f2937" />
              <text x={x} y={81} fontSize={16} textAnchor="middle" fill="#fff" fontWeight={700}>C</text>
              {i < nn - 1 && (
                <g stroke="#475569" strokeWidth={3}>
                  <line x1={x + 20} y1={isDouble || isTriple ? 68 : 75} x2={x + 75} y2={isDouble || isTriple ? 68 : 75} />
                  {(isDouble || isTriple) && <line x1={x + 20} y1={82} x2={x + 75} y2={82} />}
                  {isTriple && <line x1={x + 20} y1={75} x2={x + 75} y2={75} />}
                </g>
              )}
              {/* hydrogens */}
              {[[-0, -46], [0, 46]].map(([dx, dy], k) => (
                <g key={k}>
                  <line x1={x} y1={75 + (dy > 0 ? 20 : -20)} x2={x} y2={75 + dy - (dy > 0 ? 14 : -14)} stroke="#94a3b8" strokeWidth={2} />
                  <circle cx={x + dx} cy={75 + dy} r={13} fill="#e2e8f0" />
                  <text x={x + dx} y={75 + dy + 5} fontSize={13} textAnchor="middle" fill="#334155" fontWeight={600}>H</text>
                </g>
              ))}
            </g>
          );
        })}
        {/* functional group tag on last carbon */}
        {F.group !== "—" && fam !== "alkene" && fam !== "alkyne" && (
          <g>
            <line x1={90 + (nn - 1) * 95 + 20} y1={75} x2={90 + (nn - 1) * 95 + 62} y2={75} stroke="#8b5cf6" strokeWidth={3} />
            <rect x={90 + (nn - 1) * 95 + 62} y={57} width={72} height={36} rx={8} fill="#8b5cf6" />
            <text x={90 + (nn - 1) * 95 + 98} y={81} fontSize={14} textAnchor="middle" fill="#fff" fontWeight={700}>
              {F.group.replace("—", "").replace("&gt;", "")}
            </text>
          </g>
        )}
      </svg>

      <div className="mt-2">
        <Readout items={[
          { k: "IUPAC name", v: name.charAt(0).toUpperCase() + name.slice(1), hi: true },
          { k: "Formula", v: molFormula(fam, nn), hi: true },
          { k: "General formula", v: F.gen },
          { k: "Nature", v: F.sat },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        Functional group: <strong dangerouslySetInnerHTML={{ __html: F.group }} />.
        {fam === "alkene" || fam === "alkyne"
          ? " Unsaturated compounds burn with a sooty yellow flame and decolourise bromine water — that is the standard test."
          : " Saturated compounds burn with a clean blue flame and react by substitution, not addition."}
      </p>
    </SimFrame>
  );
}

/* =========================================================== PERIODIC TABLE */
type El = { z: number; s: string; n: string; g: number; p: number; cat: string; val: string; conf: string };
const ELEMENTS: El[] = [
  { z: 1, s: "H", n: "Hydrogen", g: 1, p: 1, cat: "nm", val: "1", conf: "1" },
  { z: 2, s: "He", n: "Helium", g: 18, p: 1, cat: "ng", val: "0", conf: "2" },
  { z: 3, s: "Li", n: "Lithium", g: 1, p: 2, cat: "am", val: "1", conf: "2,1" },
  { z: 4, s: "Be", n: "Beryllium", g: 2, p: 2, cat: "ae", val: "2", conf: "2,2" },
  { z: 5, s: "B", n: "Boron", g: 13, p: 2, cat: "ml", val: "3", conf: "2,3" },
  { z: 6, s: "C", n: "Carbon", g: 14, p: 2, cat: "nm", val: "4", conf: "2,4" },
  { z: 7, s: "N", n: "Nitrogen", g: 15, p: 2, cat: "nm", val: "3", conf: "2,5" },
  { z: 8, s: "O", n: "Oxygen", g: 16, p: 2, cat: "nm", val: "2", conf: "2,6" },
  { z: 9, s: "F", n: "Fluorine", g: 17, p: 2, cat: "hl", val: "1", conf: "2,7" },
  { z: 10, s: "Ne", n: "Neon", g: 18, p: 2, cat: "ng", val: "0", conf: "2,8" },
  { z: 11, s: "Na", n: "Sodium", g: 1, p: 3, cat: "am", val: "1", conf: "2,8,1" },
  { z: 12, s: "Mg", n: "Magnesium", g: 2, p: 3, cat: "ae", val: "2", conf: "2,8,2" },
  { z: 13, s: "Al", n: "Aluminium", g: 13, p: 3, cat: "pm", val: "3", conf: "2,8,3" },
  { z: 14, s: "Si", n: "Silicon", g: 14, p: 3, cat: "ml", val: "4", conf: "2,8,4" },
  { z: 15, s: "P", n: "Phosphorus", g: 15, p: 3, cat: "nm", val: "3", conf: "2,8,5" },
  { z: 16, s: "S", n: "Sulphur", g: 16, p: 3, cat: "nm", val: "2", conf: "2,8,6" },
  { z: 17, s: "Cl", n: "Chlorine", g: 17, p: 3, cat: "hl", val: "1", conf: "2,8,7" },
  { z: 18, s: "Ar", n: "Argon", g: 18, p: 3, cat: "ng", val: "0", conf: "2,8,8" },
  { z: 19, s: "K", n: "Potassium", g: 1, p: 4, cat: "am", val: "1", conf: "2,8,8,1" },
  { z: 20, s: "Ca", n: "Calcium", g: 2, p: 4, cat: "ae", val: "2", conf: "2,8,8,2" },
  { z: 21, s: "Sc", n: "Scandium", g: 3, p: 4, cat: "tm", val: "3", conf: "2,8,9,2" },
  { z: 22, s: "Ti", n: "Titanium", g: 4, p: 4, cat: "tm", val: "4", conf: "2,8,10,2" },
  { z: 23, s: "V", n: "Vanadium", g: 5, p: 4, cat: "tm", val: "5", conf: "2,8,11,2" },
  { z: 24, s: "Cr", n: "Chromium", g: 6, p: 4, cat: "tm", val: "3", conf: "2,8,13,1" },
  { z: 25, s: "Mn", n: "Manganese", g: 7, p: 4, cat: "tm", val: "2", conf: "2,8,13,2" },
  { z: 26, s: "Fe", n: "Iron", g: 8, p: 4, cat: "tm", val: "2,3", conf: "2,8,14,2" },
  { z: 27, s: "Co", n: "Cobalt", g: 9, p: 4, cat: "tm", val: "2,3", conf: "2,8,15,2" },
  { z: 28, s: "Ni", n: "Nickel", g: 10, p: 4, cat: "tm", val: "2", conf: "2,8,16,2" },
  { z: 29, s: "Cu", n: "Copper", g: 11, p: 4, cat: "tm", val: "1,2", conf: "2,8,18,1" },
  { z: 30, s: "Zn", n: "Zinc", g: 12, p: 4, cat: "tm", val: "2", conf: "2,8,18,2" },
  { z: 31, s: "Ga", n: "Gallium", g: 13, p: 4, cat: "pm", val: "3", conf: "2,8,18,3" },
  { z: 32, s: "Ge", n: "Germanium", g: 14, p: 4, cat: "ml", val: "4", conf: "2,8,18,4" },
  { z: 33, s: "As", n: "Arsenic", g: 15, p: 4, cat: "ml", val: "3", conf: "2,8,18,5" },
  { z: 34, s: "Se", n: "Selenium", g: 16, p: 4, cat: "nm", val: "2", conf: "2,8,18,6" },
  { z: 35, s: "Br", n: "Bromine", g: 17, p: 4, cat: "hl", val: "1", conf: "2,8,18,7" },
  { z: 36, s: "Kr", n: "Krypton", g: 18, p: 4, cat: "ng", val: "0", conf: "2,8,18,8" },
];
const CAT_COLOR: Record<string, string> = {
  am: "#f43f5e", ae: "#fb923c", tm: "#facc15", pm: "#a3e635",
  ml: "#34d399", nm: "#38bdf8", hl: "#818cf8", ng: "#c084fc",
};
const CAT_NAME: Record<string, string> = {
  am: "Alkali metal", ae: "Alkaline earth metal", tm: "Transition metal", pm: "Metal",
  ml: "Metalloid", nm: "Non-metal", hl: "Halogen", ng: "Noble gas",
};

export function PeriodicTable() {
  const [trend, setTrend] = useState<"cat" | "size" | "metal" | "val">("cat");
  const [sel, setSel] = useState<El | null>(null);

  const shade = (e: El) => {
    if (trend === "cat") return CAT_COLOR[e.cat];
    if (trend === "val") {
      const v = parseInt(e.val);
      return `hsl(${260 - v * 40} 75% ${60}%)`;
    }
    if (trend === "size") {
      // atomic radius: increases down a group, decreases across a period
      const t = (e.p / 4) * 0.65 + (1 - e.g / 18) * 0.35;
      return `hsl(200 80% ${86 - t * 46}%)`;
    }
    const t = (e.p / 4) * 0.4 + (1 - e.g / 18) * 0.6;   // metallic character
    return `hsl(${20 + (1 - t) * 180} 72% ${82 - t * 34}%)`;
  };

  return (
    <SimFrame title="Modern periodic table (first 36 elements)" onReset={() => { setTrend("cat"); setSel(null); }}
      caption="Tap any element. Then switch the colouring to see the trends — they all come from one thing: how many shells there are, and how strongly the nucleus pulls.">
      <Choice value={trend} onChange={(v) => setTrend(v as typeof trend)}
        options={[{ v: "cat", l: "Element type" }, { v: "size", l: "Atomic size" }, { v: "metal", l: "Metallic character" }, { v: "val", l: "Valency" }]} />

      <div className="mt-4 overflow-x-auto no-scrollbar">
        <div className="grid min-w-[42rem] gap-[3px]" style={{ gridTemplateColumns: "repeat(18, minmax(0,1fr))" }}>
          {Array.from({ length: 4 * 18 }).map((_, i) => {
            const g = (i % 18) + 1, p = Math.floor(i / 18) + 1;
            const e = ELEMENTS.find((x) => x.g === g && x.p === p);
            if (!e) return <div key={i} />;
            return (
              <button key={i} onClick={() => setSel(e)}
                className="aspect-square rounded-[5px] text-center transition hover:scale-110"
                style={{ background: shade(e), outline: sel?.z === e.z ? "2.5px solid var(--ink)" : "none" }}>
                <div className="text-[8px] font-semibold text-black/55">{e.z}</div>
                <div className="text-[12px] font-bold leading-none text-black/85">{e.s}</div>
              </button>
            );
          })}
        </div>
      </div>

      {sel ? (
        <div className="mt-4 rounded-xl border hairline p-4 fade-up">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg text-[18px] font-bold text-black/85" style={{ background: CAT_COLOR[sel.cat] }}>
              {sel.s}
            </div>
            <div>
              <div className="font-semibold">{sel.n}</div>
              <div className="text-[12px] faint">{CAT_NAME[sel.cat]}</div>
            </div>
          </div>
          <div className="mt-3">
            <Readout items={[
              { k: "Atomic no.", v: String(sel.z) },
              { k: "Group", v: String(sel.g) },
              { k: "Period", v: String(sel.p) },
              { k: "Valency", v: sel.val, hi: true },
            ]} />
          </div>
          <p className="mt-2 text-[0.85rem] muted">
            Electron arrangement: <span className="font-mono font-semibold">{sel.conf}</span> — the last number is the valence electrons,
            and that alone decides how {sel.n.toLowerCase()} behaves chemically.
          </p>
        </div>
      ) : (
        <p className="mt-4 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
          {trend === "size" && "Darker = larger atom. Size grows down a group (new shell added) and shrinks across a period (same shell, stronger nuclear pull)."}
          {trend === "metal" && "Metals sit on the left, non-metals on the right. Metallic character increases down a group and decreases across a period."}
          {trend === "val" && "Valency rises 1→4 then falls 4→0 across a period, and stays constant down a group. That is why a group behaves as a family."}
          {trend === "cat" && "Tap an element to see its group, period, valency and electron arrangement."}
        </p>
      )}
    </SimFrame>
  );
}
