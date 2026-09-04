"use client";
import React, { useEffect, useRef, useState } from "react";
import { SimFrame, Slider, Choice, Readout } from "./shell";

/* ------------------------------------------------ tiny waypoint animator */
function useJourney(points: { x: number; y: number }[], speed = 0.0022, playing = true) {
  const [t, setT] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last; last = now;
      setT((x) => (x + dt * speed) % 1);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [speed, playing]);
  const n = points.length - 1;
  const seg = Math.min(n - 1, Math.floor(t * n));
  const local = t * n - seg;
  const a = points[seg], b = points[seg + 1];
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local, seg, t, setT };
}

/* ======================================================= DOUBLE CIRCULATION */
const HEART_PATH = [
  { x: 120, y: 120, l: "Lungs — blood picks up oxygen" },
  { x: 300, y: 90, l: "Pulmonary vein → left atrium" },
  { x: 330, y: 130, l: "Left atrium contracts → left ventricle" },
  { x: 330, y: 195, l: "Left ventricle — the thickest wall, pumps hardest" },
  { x: 560, y: 210, l: "Aorta → oxygen delivered to the whole body" },
  { x: 620, y: 120, l: "Body cells use the oxygen, release CO₂" },
  { x: 620, y: 60, l: "Vena cava carries deoxygenated blood back" },
  { x: 270, y: 90, l: "Right atrium" },
  { x: 270, y: 175, l: "Right ventricle" },
  { x: 120, y: 120, l: "Pulmonary artery → back to the lungs" },
];

export function HeartCirculation() {
  const [playing, setPlaying] = useState(true);
  const j = useJourney(HEART_PATH, 0.00035, playing);
  const oxygenated = j.seg >= 1 && j.seg <= 4;

  return (
    <SimFrame title="Double circulation" onReset={() => { j.setT(0); setPlaying(true); }}
      caption="Blood passes through the heart twice in one complete round of the body — once to go to the lungs, once to go to the body. That is what 'double' means.">
      <svg viewBox="0 0 760 300" className="w-full select-none" style={{ maxHeight: 300 }}>
        {/* lungs */}
        <ellipse cx={120} cy={120} rx={62} ry={78} fill="#fbcfe8" fillOpacity={0.55} stroke="#db2777" strokeWidth={2} />
        <text x={120} y={126} fontSize={14} textAnchor="middle" fill="#9d174d" fontWeight={700}>LUNGS</text>
        {/* body */}
        <rect x={560} y={40} width={120} height={190} rx={16} fill="#fed7aa" fillOpacity={0.55} stroke="#ea580c" strokeWidth={2} />
        <text x={620} y={140} fontSize={14} textAnchor="middle" fill="#9a3412" fontWeight={700}>BODY</text>

        {/* heart */}
        <rect x={238} y={50} width={128} height={180} rx={22} fill="var(--surface-2)" stroke="#64748b" strokeWidth={2.5} />
        <line x1={302} y1={54} x2={302} y2={226} stroke="#64748b" strokeWidth={2.5} />
        <line x1={242} y1={140} x2={362} y2={140} stroke="#64748b" strokeWidth={2} strokeDasharray="4 4" />
        <text x={270} y={80} fontSize={10} textAnchor="middle" fill="#0284c7" fontWeight={700}>RA</text>
        <text x={270} y={175} fontSize={10} textAnchor="middle" fill="#0284c7" fontWeight={700}>RV</text>
        <text x={334} y={80} fontSize={10} textAnchor="middle" fill="#dc2626" fontWeight={700}>LA</text>
        <text x={334} y={175} fontSize={10} textAnchor="middle" fill="#dc2626" fontWeight={700}>LV</text>
        <text x={302} y={250} fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.6}>HEART</text>
        <rect x={306} y={150} width={56} height={72} rx={6} fill="#dc2626" fillOpacity={0.13} />

        {/* vessels */}
        {HEART_PATH.slice(0, -1).map((p, i) => {
          const q = HEART_PATH[i + 1];
          const oxy = i >= 0 && i <= 3;
          return <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y}
            stroke={i >= 0 && i <= 4 ? "#ef4444" : "#3b82f6"} strokeWidth={5} strokeLinecap="round" opacity={0.35} />;
        })}

        {/* blood cell */}
        <circle cx={j.x} cy={j.y} r={11} fill={oxygenated ? "#ef4444" : "#3b82f6"} />
        <circle cx={j.x} cy={j.y} r={17} fill={oxygenated ? "#ef4444" : "#3b82f6"} opacity={0.25} />
      </svg>

      <div className="flex items-center gap-3">
        <button onClick={() => setPlaying((p) => !p)}
          className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-[12px] font-medium text-white">
          {playing ? "Pause" : "Play"}
        </button>
        <span className="text-[0.9rem] muted">{HEART_PATH[j.seg].l}</span>
      </div>
      <div className="mt-3 flex gap-4 text-[0.85rem]">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> oxygenated</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> deoxygenated</span>
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        The two sides never mix, so oxygen-rich and oxygen-poor blood stay separate. Warm-blooded animals need this because
        keeping body temperature steady burns a lot of energy — and that needs efficient oxygen supply.
      </p>
    </SimFrame>
  );
}

/* ================================================================ REFLEX ARC */
const ARC = [
  { x: 90, y: 210, l: "Receptor in your skin detects the heat" },
  { x: 250, y: 175, l: "Sensory neuron carries the impulse inwards" },
  { x: 400, y: 150, l: "Spinal cord — the relay neuron decides here, not the brain" },
  { x: 400, y: 150, l: "Instantly relayed across the synapse" },
  { x: 250, y: 245, l: "Motor neuron carries the command back out" },
  { x: 95, y: 262, l: "Muscle contracts — your hand is already away" },
];

export function ReflexArc() {
  const [step, setStep] = useState(-1);
  useEffect(() => {
    if (step < 0 || step >= ARC.length - 1) return;
    const id = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(id);
  }, [step]);
  const p = step >= 0 ? ARC[Math.min(step, ARC.length - 1)] : null;

  return (
    <SimFrame title="Reflex arc — why you pull back before you feel pain" onReset={() => setStep(-1)}
      caption="The signal takes a shortcut through the spinal cord. Your brain finds out a moment later — which is why you jerk away first and say 'ouch' second.">
      <svg viewBox="0 0 760 330" className="w-full select-none" style={{ maxHeight: 320 }}>
        {/* brain + spinal cord */}
        <ellipse cx={470} cy={62} rx={62} ry={42} fill="#e9d5ff" fillOpacity={0.6} stroke="#7e22ce" strokeWidth={2} />
        <text x={470} y={68} fontSize={13} textAnchor="middle" fill="#6b21a8" fontWeight={700}>BRAIN</text>
        <rect x={430} y={104} width={80} height={200} rx={22} fill="#ddd6fe" fillOpacity={0.55} stroke="#7e22ce" strokeWidth={2} />
        <text x={470} y={210} fontSize={12} textAnchor="middle" fill="#6b21a8" fontWeight={700} transform="rotate(90 470 210)">SPINAL CORD</text>

        {/* hand */}
        <path d="M 50 190 q 30 -22 60 -6 l 0 96 q -34 12 -60 -8 z" fill="#fecaca" stroke="#b91c1c" strokeWidth={2} />
        <text x={80} y={310} fontSize={12} textAnchor="middle" fill="#b91c1c" fontWeight={600}>hand</text>
        {/* flame */}
        <path d="M 40 168 q 12 -30 24 -6 q 8 -16 12 6 q 4 20 -18 22 q -22 -2 -18 -22 z" fill="#f97316" />

        {/* neurons */}
        <path d="M 90 210 Q 250 175 400 150" fill="none" stroke="#0ea5e9" strokeWidth={4} strokeLinecap="round" opacity={0.4} />
        <path d="M 400 150 Q 250 245 95 262" fill="none" stroke="#f43f5e" strokeWidth={4} strokeLinecap="round" opacity={0.4} />
        <path d="M 445 148 Q 452 100 468 96" fill="none" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" />
        <text x={200} y={168} fontSize={11} fill="#0284c7" fontWeight={600}>sensory neuron</text>
        <text x={200} y={286} fontSize={11} fill="#e11d48" fontWeight={600}>motor neuron</text>
        <text x={498} y={120} fontSize={10} fill="#7e22ce">brain informed later</text>

        {step >= 0 && (
          <>
            <circle cx={p!.x} cy={p!.y} r={9} fill="#facc15" />
            <circle cx={p!.x} cy={p!.y} r={16} fill="#facc15" opacity={0.35} />
          </>
        )}
      </svg>
      <button onClick={() => setStep(0)}
        className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-[12px] font-medium text-white">
        Touch the flame
      </button>
      <div className="mt-3 space-y-1.5">
        {ARC.map((a, i) => (
          <div key={i} className={`flex gap-2.5 rounded-lg px-3 py-1.5 text-[0.88rem] transition ${
            step === i ? "bg-[var(--accent)]/12 font-medium" : step > i ? "muted" : "faint"}`}>
            <span className="font-mono">{i + 1}.</span><span>{a.l}</span>
          </div>
        ))}
      </div>
    </SimFrame>
  );
}

/* ============================================================ PUNNETT SQUARE */
export function PunnettSquare() {
  const [dad, setDad] = useState("Tt");
  const [mom, setMom] = useState("Tt");
  const [trait, setTrait] = useState<"height" | "seed">("height");

  const T = trait === "height" ? "T" : "R";
  const t = T.toLowerCase();
  const dom = trait === "height" ? "Tall" : "Round seed";
  const rec = trait === "height" ? "Dwarf" : "Wrinkled seed";
  const opts = [`${T}${T}`, `${T}${t}`, `${t}${t}`];

  const d = dad.replace(/[Tt]/g, (c) => (c === c.toUpperCase() ? T : t));
  const m = mom.replace(/[Tt]/g, (c) => (c === c.toUpperCase() ? T : t));
  const dg = [d[0], d[1]], mg = [m[0], m[1]];

  const cells = mg.flatMap((a) => dg.map((b) => [a, b].sort((x, y) => (x === T ? -1 : 1)).join("")));
  const domCount = cells.filter((c) => c.includes(T)).length;

  return (
    <SimFrame title="Punnett square" onReset={() => { setDad("Tt"); setMom("Tt"); setTrait("height"); }}
      caption="Each parent gives one allele at random. The square simply lists all four equally likely combinations.">
      <div className="grid gap-3 sm:grid-cols-3">
        <Choice label="Trait" value={trait} onChange={(v) => { setTrait(v as typeof trait); }}
          options={[{ v: "height", l: "Plant height" }, { v: "seed", l: "Seed shape" }]} />
        <Choice label="Parent 1" value={dad.replace(/[A-Za-z]/g, (c) => (c === c.toUpperCase() ? "T" : "t"))}
          onChange={setDad} options={["TT", "Tt", "tt"].map((o) => ({ v: o, l: o.replace(/T/g, T).replace(/t/g, t) }))} />
        <Choice label="Parent 2" value={mom.replace(/[A-Za-z]/g, (c) => (c === c.toUpperCase() ? "T" : "t"))}
          onChange={setMom} options={["TT", "Tt", "tt"].map((o) => ({ v: o, l: o.replace(/T/g, T).replace(/t/g, t) }))} />
      </div>

      <div className="mt-5 flex justify-center">
        <div className="inline-grid grid-cols-3 gap-1">
          <div />
          {dg.map((g, i) => (
            <div key={i} className="grid h-12 w-16 place-items-center rounded-lg bg-sky-500/15 font-mono text-[16px] font-bold text-sky-700 dark:text-sky-300">{g}</div>
          ))}
          {mg.map((a, r) => (
            <React.Fragment key={r}>
              <div className="grid h-16 w-16 place-items-center rounded-lg bg-rose-500/15 font-mono text-[16px] font-bold text-rose-700 dark:text-rose-300">{a}</div>
              {dg.map((b, c) => {
                const geno = cells[r * 2 + c];
                const isDom = geno.includes(T);
                return (
                  <div key={c} className={`grid h-16 w-16 place-items-center rounded-lg border-2 ${
                    isDom ? "border-emerald-500/50 bg-emerald-500/10" : "border-amber-500/50 bg-amber-500/10"}`}>
                    <div className="font-mono text-[17px] font-bold">{geno}</div>
                    <div className="text-[9px] font-semibold uppercase tracking-wide faint">{isDom ? dom : rec}</div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <Readout items={[
          { k: "Phenotype ratio", v: `${domCount} : ${4 - domCount}`, hi: true },
          { k: `${dom}`, v: `${(domCount / 4 * 100).toFixed(0)}%` },
          { k: `${rec}`, v: `${((4 - domCount) / 4 * 100).toFixed(0)}%` },
          { k: "Genotypes", v: Array.from(new Set(cells)).join(", ") },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        {domCount === 3
          ? "The classic 3 : 1 ratio — Mendel's F₂ generation. The recessive trait disappeared in F₁ and reappeared here, proving it was never destroyed, only hidden."
          : domCount === 4
            ? "All offspring show the dominant trait, but some still carry the recessive allele silently."
            : domCount === 0
              ? "Both parents are purely recessive, so every offspring is recessive too."
              : "A 1 : 1 ratio — this is a test cross, used to find out whether a tall plant is TT or Tt."}
      </p>
    </SimFrame>
  );
}

/* ========================================================= DIGESTION JOURNEY */
const GUT = [
  { id: "mouth", n: "Mouth", x: 110, y: 55, e: "Salivary amylase", w: "Teeth grind the food; saliva starts breaking starch into sugar. Chew a roti for a minute and it turns sweet — that is amylase at work." },
  { id: "oeso", n: "Oesophagus", x: 150, y: 118, e: "—", w: "No digestion here. Rings of muscle squeeze in waves (peristalsis) to push food down — which is why astronauts can swallow upside down." },
  { id: "stomach", n: "Stomach", x: 205, y: 172, e: "Pepsin + HCl", w: "HCl makes the contents acidic so pepsin can work, and kills most bacteria. Mucus stops the stomach digesting itself." },
  { id: "sint", n: "Small intestine", x: 300, y: 240, e: "Bile, trypsin, lipase, intestinal juice", w: "The main site of digestion AND absorption. Bile emulsifies fat into tiny droplets; villi give a huge surface area to absorb the products." },
  { id: "lint", n: "Large intestine", x: 470, y: 200, e: "—", w: "Absorbs most of the remaining water. What is left is stored as waste and expelled through the anus." },
];

export function DigestionJourney() {
  const [sel, setSel] = useState("mouth");
  const s = GUT.find((g) => g.id === sel)!;
  return (
    <SimFrame title="The journey of a roti" onReset={() => setSel("mouth")}
      caption="Tap each organ. Notice that carbohydrate digestion starts in the mouth, protein digestion in the stomach, and fat digestion only in the small intestine.">
      <svg viewBox="0 0 620 320" className="w-full select-none" style={{ maxHeight: 300 }}>
        <path d="M 110 55 L 150 90 L 150 150 Q 150 175 190 175 Q 245 175 240 215 Q 236 250 300 250 L 300 250 Q 380 250 380 210 L 460 210 L 460 130"
          fill="none" stroke="#94a3b8" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" opacity={0.35} />
        {GUT.map((g) => (
          <g key={g.id} onClick={() => setSel(g.id)} style={{ cursor: "pointer" }}>
            <circle cx={g.x} cy={g.y} r={sel === g.id ? 26 : 20}
              fill={sel === g.id ? "#10b981" : "#cbd5e1"} opacity={sel === g.id ? 0.95 : 0.8} />
            <text x={g.x} y={g.y + 5} fontSize={13} textAnchor="middle" fill={sel === g.id ? "#fff" : "#334155"} fontWeight={700}>
              {g.n[0]}
            </text>
            <text x={g.x} y={g.y - 30} fontSize={11.5} textAnchor="middle" fill="currentColor" opacity={sel === g.id ? 0.95 : 0.55} fontWeight={sel === g.id ? 700 : 500}>
              {g.n}
            </text>
          </g>
        ))}
        {/* liver + pancreas */}
        <rect x={330} y={140} width={72} height={34} rx={8} fill="#fca5a5" opacity={0.6} />
        <text x={366} y={162} fontSize={11} textAnchor="middle" fill="#7f1d1d" fontWeight={600}>Liver</text>
        <rect x={330} y={182} width={72} height={30} rx={8} fill="#fdba74" opacity={0.6} />
        <text x={366} y={202} fontSize={11} textAnchor="middle" fill="#7c2d12" fontWeight={600}>Pancreas</text>
      </svg>
      <div className="rounded-xl border hairline p-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold">{s.n}</span>
          <span className="rounded-full bg-emerald-500/12 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">{s.e}</span>
        </div>
        <p className="mt-2 text-[0.9rem] muted">{s.w}</p>
      </div>
    </SimFrame>
  );
}

/* ============================================================ PLANT TROPISM */
export function PlantTropism() {
  const [light, setLight] = useState(75);   // 0 = left, 100 = right
  const [tilted, setTilted] = useState(false);
  const bend = ((light - 50) / 50) * 34;

  return (
    <SimFrame title="How a plant 'moves'" onReset={() => { setLight(75); setTilted(false); }}
      caption="Auxin collects on the shaded side of a shoot and makes those cells grow longer. Longer cells on one side = the whole shoot curves the other way.">
      <svg viewBox="0 0 620 300" className="w-full select-none" style={{ maxHeight: 280 }}>
        <rect x={0} y={230} width={620} height={70} fill="#78350f" fillOpacity={0.35} rx={8} />
        {/* sun */}
        <circle cx={60 + (light / 100) * 500} cy={50} r={22} fill="#fbbf24" />
        {[...Array(8)].map((_, i) => {
          const a = (i * Math.PI) / 4;
          const cx = 60 + (light / 100) * 500;
          return <line key={i} x1={cx + Math.cos(a) * 28} y1={50 + Math.sin(a) * 28}
            x2={cx + Math.cos(a) * 38} y2={50 + Math.sin(a) * 38} stroke="#fbbf24" strokeWidth={3} strokeLinecap="round" />;
        })}
        {/* shoot */}
        <g transform={`translate(310,230) ${tilted ? "rotate(28)" : ""}`}>
          <path d={`M 0 0 C 0 -60 ${bend * 0.5} -100 ${bend} -140`} fill="none" stroke="#16a34a" strokeWidth={11} strokeLinecap="round" />
          <ellipse cx={bend - 20} cy={-108} rx={22} ry={11} fill="#22c55e" transform={`rotate(-24 ${bend - 20} -108)`} />
          <ellipse cx={bend + 20} cy={-88} rx={22} ry={11} fill="#22c55e" transform={`rotate(24 ${bend + 20} -88)`} />
          <text x={bend} y={-158} fontSize={11.5} textAnchor="middle" fill="#15803d" fontWeight={700}>phototropism +</text>
          {/* root */}
          <path d={`M 0 0 C 0 40 ${tilted ? -22 : 0} 46 ${tilted ? -30 : 0} 66`} fill="none" stroke="#a16207" strokeWidth={8} strokeLinecap="round"
            transform={tilted ? "rotate(-28)" : ""} />
        </g>
        <text x={310} y={296} fontSize={11.5} textAnchor="middle" fill="#a16207" fontWeight={700}>root: geotropism +, phototropism −</text>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Where the light is" value={light} min={0} max={100} onChange={setLight} fmt={(v) => (v < 40 ? "left" : v > 60 ? "right" : "overhead")} />
        <div className="flex items-end">
          <button onClick={() => setTilted((t) => !t)}
            className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition ${tilted ? "bg-[var(--accent)] text-white" : "border hairline hover:bg-[var(--surface-2)]"}`}>
            {tilted ? "Pot is tilted" : "Tilt the pot"}
          </button>
        </div>
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        Tropic movements are <strong>directional</strong> and slow (growth-driven). Nastic movements — like the touch-me-not
        folding when you poke it — are non-directional and fast, caused by water leaving the cells, not by growth.
      </p>
    </SimFrame>
  );
}

/* =============================================================== NEPHRON */
const NEPH = [
  { n: "Glomerulus", d: "Blood arrives under high pressure. Water, glucose, salts, urea and amino acids are all forced out of the blood — cells and proteins are too big and stay in.", k: "Filtration" },
  { n: "Bowman's capsule", d: "The cup that collects everything squeezed out of the glomerulus. This liquid is called the filtrate." },
  { n: "Tubule", d: "The body changes its mind and takes back what it still needs — all the glucose, most of the water, some salts. This is why healthy urine has no sugar in it.", k: "Selective reabsorption" },
  { n: "Collecting duct", d: "How much water is reabsorbed here depends on how much water your body has. Drink less and the urine becomes concentrated and darker.", k: "Water balance" },
  { n: "Ureter → bladder", d: "The leftover — mainly urea, extra salts and water — is urine. It is stored in the bladder until you choose to release it." },
];

export function NephronFilter() {
  const [i, setI] = useState(0);
  return (
    <SimFrame title="How a kidney cleans blood" onReset={() => setI(0)}
      caption="A kidney does not pick out the waste. It throws almost everything out first, then carefully takes back what the body still needs.">
      <svg viewBox="0 0 700 240" className="w-full select-none" style={{ maxHeight: 230 }}>
        {NEPH.map((s, k) => (
          <g key={k} onClick={() => setI(k)} style={{ cursor: "pointer" }}>
            <rect x={16 + k * 136} y={70} width={120} height={72} rx={12}
              fill={i === k ? "#0ea5e9" : "var(--surface-2)"} stroke={i === k ? "#0284c7" : "#94a3b8"} strokeWidth={2} />
            <text x={76 + k * 136} y={104} fontSize={12} textAnchor="middle" fontWeight={700}
              fill={i === k ? "#fff" : "currentColor"}>{s.n.split(" ")[0]}</text>
            <text x={76 + k * 136} y={122} fontSize={10.5} textAnchor="middle"
              fill={i === k ? "#e0f2fe" : "currentColor"} opacity={i === k ? 1 : 0.6}>{s.n.split(" ").slice(1).join(" ")}</text>
            {k < NEPH.length - 1 && <polygon points={`${140 + k * 136},100 ${150 + k * 136},106 ${140 + k * 136},112`} fill="#94a3b8" />}
            {s.k && <text x={76 + k * 136} y={58} fontSize={10} textAnchor="middle" fill="#0284c7" fontWeight={700}>{s.k}</text>}
          </g>
        ))}
      </svg>
      <div className="rounded-xl border hairline p-4">
        <div className="font-semibold">{NEPH[i].n}</div>
        <p className="mt-1.5 text-[0.9rem] muted">{NEPH[i].d}</p>
      </div>
    </SimFrame>
  );
}

/* ========================================================= FLOWER ANATOMY */
const FLOWER = [
  { id: "sepal", n: "Sepal", grp: "Non-reproductive", d: "The small green leaf-like parts at the base. They protect the flower while it is still a bud." },
  { id: "petal", n: "Petal", grp: "Non-reproductive", d: "Brightly coloured and often scented, to attract insects and birds for pollination." },
  { id: "anther", n: "Anther", grp: "Male — stamen", d: "Produces pollen grains, which contain the male germ cells. Held up by a stalk called the filament." },
  { id: "stigma", n: "Stigma", grp: "Female — carpel", d: "The sticky top of the carpel that catches pollen. From here the pollen grain grows a tube down the style." },
  { id: "ovary", n: "Ovary", grp: "Female — carpel", d: "Contains the ovules. After fertilisation the ovule becomes the seed and the ovary itself becomes the fruit." },
];

export function FlowerAnatomy() {
  const [sel, setSel] = useState("anther");
  const s = FLOWER.find((f) => f.id === sel)!;
  const on = (id: string) => sel === id;

  return (
    <SimFrame title="Parts of a flower" onReset={() => setSel("anther")}
      caption="Two whorls protect and advertise; two whorls do the actual reproducing. Tap each part.">
      <svg viewBox="0 0 640 300" className="w-full select-none" style={{ maxHeight: 300 }}>
        {/* stalk */}
        <line x1={320} y1={230} x2={320} y2={290} stroke="#16a34a" strokeWidth={7} />
        {/* sepals */}
        <g onClick={() => setSel("sepal")} style={{ cursor: "pointer" }}>
          {[-1, 1].map((k) => (
            <ellipse key={k} cx={320 + k * 42} cy={228} rx={34} ry={13}
              fill={on("sepal") ? "#15803d" : "#4ade80"} transform={`rotate(${k * 22} ${320 + k * 42} 228)`} />
          ))}
        </g>
        {/* petals */}
        <g onClick={() => setSel("petal")} style={{ cursor: "pointer" }}>
          {[-70, -35, 35, 70].map((dx, k) => (
            <ellipse key={k} cx={320 + dx} cy={170 + Math.abs(dx) * 0.32} rx={40} ry={22}
              fill={on("petal") ? "#db2777" : "#f9a8d4"} transform={`rotate(${dx * 0.45} ${320 + dx} ${170 + Math.abs(dx) * 0.32})`} />
          ))}
        </g>
        {/* stamens */}
        <g onClick={() => setSel("anther")} style={{ cursor: "pointer" }}>
          {[-52, -30, 30, 52].map((dx, k) => (
            <g key={k}>
              <line x1={320 + dx * 0.4} y1={214} x2={320 + dx} y2={124} stroke="#a16207" strokeWidth={3} />
              <ellipse cx={320 + dx} cy={116} rx={11} ry={15} fill={on("anther") ? "#b45309" : "#fbbf24"} />
            </g>
          ))}
        </g>
        {/* carpel */}
        <g onClick={() => setSel("ovary")} style={{ cursor: "pointer" }}>
          <ellipse cx={320} cy={210} rx={26} ry={30} fill={on("ovary") ? "#7e22ce" : "#c4b5fd"} />
          {[-9, 9].map((dx, k) => <circle key={k} cx={320 + dx} cy={212} r={6} fill="#fff" opacity={0.85} />)}
        </g>
        <line x1={320} y1={182} x2={320} y2={102} stroke="#8b5cf6" strokeWidth={5} />
        <g onClick={() => setSel("stigma")} style={{ cursor: "pointer" }}>
          <ellipse cx={320} cy={94} rx={20} ry={11} fill={on("stigma") ? "#6d28d9" : "#a78bfa"} />
        </g>

        {/* labels */}
        {[
          { id: "stigma", x: 400, y: 90, tx: 340, ty: 94 },
          { id: "anther", x: 190, y: 108, tx: 258, ty: 116 },
          { id: "ovary", x: 424, y: 214, tx: 348, ty: 210 },
          { id: "petal", x: 152, y: 178, tx: 232, ty: 186 },
          { id: "sepal", x: 452, y: 254, tx: 372, ty: 236 },
        ].map((l) => (
          <g key={l.id} onClick={() => setSel(l.id)} style={{ cursor: "pointer" }}>
            <line x1={l.x < 320 ? l.x + 44 : l.x - 6} y1={l.y} x2={l.tx} y2={l.ty} stroke="currentColor" opacity={0.3} strokeWidth={1.2} />
            <text x={l.x} y={l.y + 4} fontSize={12} textAnchor={l.x < 320 ? "end" : "start"}
              fill="currentColor" opacity={on(l.id) ? 1 : 0.55} fontWeight={on(l.id) ? 700 : 500}>
              {FLOWER.find((f) => f.id === l.id)!.n}
            </text>
          </g>
        ))}
      </svg>
      <div className="rounded-xl border hairline p-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold">{s.n}</span>
          <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-0.5 text-[11px] font-semibold faint">{s.grp}</span>
        </div>
        <p className="mt-2 text-[0.9rem] muted">{s.d}</p>
      </div>
    </SimFrame>
  );
}

/* ====================================================== NATURAL SELECTION */
type Bug = { c: "red" | "green"; };

export function NaturalSelection() {
  const [mode, setMode] = useState<"selection" | "drift">("selection");
  const [gen, setGen] = useState(0);
  const [pop, setPop] = useState<Bug[]>(() => Array.from({ length: 24 }, (_, i) => ({ c: i === 0 ? "green" : "red" })));

  const reset = () => { setGen(0); setPop(Array.from({ length: 24 }, (_, i) => ({ c: i === 0 ? "green" : "red" }))); };

  const step = () => {
    setGen((g) => g + 1);
    setPop((old) => {
      let survivors: Bug[];
      if (mode === "selection") {
        // crows eat red beetles more often (green is camouflaged)
        survivors = old.filter((b) => (b.c === "green" ? Math.random() < 0.92 : Math.random() < 0.45));
      } else {
        // an elephant crushes a random patch — colour is irrelevant
        survivors = old.filter(() => Math.random() < 0.5);
      }
      if (survivors.length === 0) survivors = [old[0]];
      const next: Bug[] = [];
      while (next.length < 24) next.push({ ...survivors[Math.floor(Math.random() * survivors.length)] });
      return next;
    });
  };

  const green = pop.filter((b) => b.c === "green").length;

  return (
    <SimFrame title="Beetles, crows and one unlucky elephant" onReset={reset}
      caption="Same starting population, two different mechanisms. Run each for several generations and watch how differently they behave.">
      <Choice label="What is acting on the population" value={mode} onChange={(v) => { setMode(v as typeof mode); reset(); }}
        options={[{ v: "selection", l: "Crows eat beetles (natural selection)" }, { v: "drift", l: "An elephant tramples them (genetic drift)" }]} />

      <div className="mt-4 grid grid-cols-8 gap-2 rounded-xl bg-emerald-900/10 p-4 sm:grid-cols-12">
        {pop.map((b, i) => (
          <div key={i} className="aspect-square rounded-full transition-colors"
            style={{ background: b.c === "green" ? "#22c55e" : "#ef4444" }} />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button onClick={step} className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-[12px] font-medium text-white">
          Next generation
        </button>
        <span className="text-[0.9rem] muted">Generation {gen} · {green} green, {24 - green} red</span>
      </div>

      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        {mode === "selection"
          ? "Green beetles are harder for crows to spot on green leaves, so they survive and breed more often. The population shifts because the variation gives a real advantage — that is natural selection."
          : "Colour makes no difference to being trampled. The population still drifts, but purely by accident, and it can go either way — that is genetic drift. Run it a few times and you will get different answers."}
      </p>
    </SimFrame>
  );
}
