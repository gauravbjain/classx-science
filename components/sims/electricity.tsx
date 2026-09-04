"use client";
import React, { useEffect, useRef, useState } from "react";
import { SimFrame, Slider, Choice, Readout } from "./shell";

/* ============================================================== OHM'S LAW */
export function OhmsLaw() {
  const [V, setV] = useState(6);
  const [R, setR] = useState(3);
  const I = V / R;
  const P = V * I;
  const [t, setT] = useState(0);

  useEffect(() => {
    let raf = 0;
    const loop = () => { setT((x) => x + 1); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const dots = 14;
  const speed = Math.min(3.2, I * 0.5);
  const perim = 1080;

  // graph
  const gx = (v: number) => 470 + (v / 12) * 240;
  const gy = (i: number) => 240 - (i / 6) * 170;

  return (
    <SimFrame title="Ohm's law lab" onReset={() => { setV(6); setR(3); }}
      caption="Turn the voltage up and the current rises in exact proportion. Turn the resistance up and it falls. That proportionality is Ohm's law.">
      <svg viewBox="0 0 760 300" className="w-full select-none" style={{ maxHeight: 300 }}>
        {/* circuit loop */}
        <rect x={60} y={70} width={330} height={160} rx={10} fill="none" stroke="#64748b" strokeWidth={3} />
        {/* battery */}
        <g transform="translate(225,230)">
          <rect x={-46} y={-9} width={92} height={18} fill="var(--surface)" />
          <line x1={-16} y1={-16} x2={-16} y2={16} stroke="#334155" strokeWidth={4} />
          <line x1={-4} y1={-9} x2={-4} y2={9} stroke="#334155" strokeWidth={4} />
          <line x1={8} y1={-16} x2={8} y2={16} stroke="#334155" strokeWidth={4} />
          <line x1={20} y1={-9} x2={20} y2={9} stroke="#334155" strokeWidth={4} />
          <text x={0} y={34} fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.75}>{V.toFixed(1)} V</text>
        </g>
        {/* resistor */}
        <g transform="translate(225,70)">
          <rect x={-42} y={-12} width={84} height={24} rx={4} fill="var(--surface-2)" stroke="#f59e0b" strokeWidth={2.5} />
          <text x={0} y={5} fontSize={12} textAnchor="middle" fill="#b45309" fontWeight={700}>{R.toFixed(1)} Ω</text>
        </g>
        {/* ammeter */}
        <g transform="translate(60,150)">
          <circle r={24} fill="var(--surface)" stroke="#0ea5e9" strokeWidth={2.5} />
          <text y={5} fontSize={15} textAnchor="middle" fill="#0284c7" fontWeight={700}>A</text>
        </g>
        {/* voltmeter across resistor */}
        <g transform="translate(390,150)">
          <circle r={24} fill="var(--surface)" stroke="#a855f7" strokeWidth={2.5} />
          <text y={5} fontSize={15} textAnchor="middle" fill="#9333ea" fontWeight={700}>V</text>
        </g>

        {/* moving charges */}
        {Array.from({ length: dots }).map((_, k) => {
          const d = ((t * speed + (k * perim) / dots) % perim);
          let x = 60, y = 70;
          if (d < 330) { x = 60 + d; y = 70; }
          else if (d < 490) { x = 390; y = 70 + (d - 330); }
          else if (d < 820) { x = 390 - (d - 490); y = 230; }
          else { x = 60; y = 230 - (d - 820); }
          return <circle key={k} cx={x} cy={y} r={4} fill="#0ea5e9" opacity={0.9} />;
        })}

        {/* graph */}
        <g>
          <line x1={470} y1={240} x2={730} y2={240} stroke="currentColor" opacity={0.35} />
          <line x1={470} y1={240} x2={470} y2={60} stroke="currentColor" opacity={0.35} />
          <text x={735} y={244} fontSize={11} fill="currentColor" opacity={0.6}>V</text>
          <text x={462} y={58} fontSize={11} fill="currentColor" opacity={0.6} textAnchor="end">I</text>
          <line x1={gx(0)} y1={gy(0)} x2={gx(12)} y2={gy(Math.min(6, 12 / R))} stroke="#0ea5e9" strokeWidth={2.5} />
          <circle cx={gx(V)} cy={gy(Math.min(6, I))} r={5} fill="#f97316" />
          <text x={478} y={78} fontSize={11} fill="currentColor" opacity={0.55}>slope = 1/R</text>
        </g>
      </svg>

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        <Slider label="Battery voltage V" value={V} min={0} max={12} step={0.5} onChange={setV} unit=" V" />
        <Slider label="Resistance R" value={R} min={0.5} max={12} step={0.5} onChange={setR} unit=" Ω" />
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "Current I = V/R", v: `${I.toFixed(2)} A`, hi: true },
          { k: "Power P = VI", v: `${P.toFixed(1)} W`, hi: true },
          { k: "Heat in 1 min", v: `${(P * 60).toFixed(0)} J` },
          { k: "Charge in 1 min", v: `${(I * 60).toFixed(0)} C` },
        ]} />
      </div>
    </SimFrame>
  );
}

/* ======================================================= SERIES / PARALLEL */
export function SeriesParallel() {
  const [mode, setMode] = useState<"series" | "parallel">("series");
  const [rs, setRs] = useState([2, 4, 6]);
  const V = 12;
  const Req = mode === "series" ? rs.reduce((a, b) => a + b, 0) : 1 / rs.reduce((a, b) => a + 1 / b, 0);
  const Itot = V / Req;
  const branch = rs.map((r) => (mode === "series" ? Itot : V / r));
  const drops = rs.map((r, k) => (mode === "series" ? Itot * r : V));
  const power = rs.map((r, k) => branch[k] * drops[k]);
  const maxP = Math.max(...power);

  const set = (i: number, v: number) => setRs((a) => a.map((x, k) => (k === i ? v : x)));

  return (
    <SimFrame title="Series vs parallel" onReset={() => { setMode("series"); setRs([2, 4, 6]); }}
      caption="Same three resistors, same battery — only the wiring changes. Watch what happens to the total resistance and to the brightness of each bulb.">
      <div className="mb-3"><Choice value={mode} onChange={(v) => setMode(v as typeof mode)}
        options={[{ v: "series", l: "Series" }, { v: "parallel", l: "Parallel" }]} /></div>

      <svg viewBox="0 0 760 240" className="w-full select-none" style={{ maxHeight: 250 }}>
        {mode === "series" ? (
          <g>
            <rect x={70} y={50} width={620} height={140} rx={10} fill="none" stroke="#64748b" strokeWidth={3} />
            {rs.map((r, k) => (
              <g key={k} transform={`translate(${190 + k * 190},50)`}>
                <rect x={-46} y={-13} width={92} height={26} rx={4} fill="var(--surface-2)" stroke="#f59e0b" strokeWidth={2.5} />
                <text x={0} y={5} fontSize={12} textAnchor="middle" fill="#b45309" fontWeight={700}>R{k + 1} = {r}Ω</text>
                <circle cx={0} cy={44} r={16} fill="#fde68a" fillOpacity={Math.max(0.12, power[k] / (maxP || 1))} stroke="#f59e0b" strokeWidth={2} />
                <text x={0} y={49} fontSize={10} textAnchor="middle" fill="#92400e" fontWeight={700}>{power[k].toFixed(1)}W</text>
              </g>
            ))}
            <g transform="translate(380,190)">
              <rect x={-40} y={-9} width={80} height={18} fill="var(--surface)" />
              <line x1={-12} y1={-16} x2={-12} y2={16} stroke="#334155" strokeWidth={4} />
              <line x1={0} y1={-9} x2={0} y2={9} stroke="#334155" strokeWidth={4} />
              <line x1={12} y1={-16} x2={12} y2={16} stroke="#334155" strokeWidth={4} />
              <text x={0} y={34} fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.75}>12 V</text>
            </g>
          </g>
        ) : (
          <g>
            <line x1={120} y1={40} x2={660} y2={40} stroke="#64748b" strokeWidth={3} />
            <line x1={120} y1={175} x2={660} y2={175} stroke="#64748b" strokeWidth={3} />
            {rs.map((r, k) => {
              const x = 230 + k * 165;
              return (
                <g key={k}>
                  <line x1={x} y1={40} x2={x} y2={78} stroke="#64748b" strokeWidth={3} />
                  <rect x={x - 44} y={78} width={88} height={26} rx={4} fill="var(--surface-2)" stroke="#f59e0b" strokeWidth={2.5} />
                  <text x={x} y={96} fontSize={12} textAnchor="middle" fill="#b45309" fontWeight={700}>R{k + 1} = {r}Ω</text>
                  <line x1={x} y1={104} x2={x} y2={132} stroke="#64748b" strokeWidth={3} />
                  <circle cx={x} cy={148} r={16} fill="#fde68a" fillOpacity={Math.max(0.12, power[k] / (maxP || 1))} stroke="#f59e0b" strokeWidth={2} />
                  <text x={x} y={153} fontSize={10} textAnchor="middle" fill="#92400e" fontWeight={700}>{power[k].toFixed(1)}W</text>
                  <line x1={x} y1={164} x2={x} y2={175} stroke="#64748b" strokeWidth={3} />
                  <text x={x + 50} y={122} fontSize={11} fill="#0284c7" fontWeight={600}>{branch[k].toFixed(2)}A</text>
                </g>
              );
            })}
            <line x1={120} y1={40} x2={120} y2={175} stroke="#64748b" strokeWidth={3} />
            <g transform="translate(120,108)">
              <rect x={-9} y={-24} width={18} height={48} fill="var(--surface)" />
              <line x1={-16} y1={-12} x2={16} y2={-12} stroke="#334155" strokeWidth={4} />
              <line x1={-9} y1={0} x2={9} y2={0} stroke="#334155" strokeWidth={4} />
              <line x1={-16} y1={12} x2={16} y2={12} stroke="#334155" strokeWidth={4} />
              <text x={-24} y={4} fontSize={12} textAnchor="end" fill="currentColor" opacity={0.75}>12 V</text>
            </g>
          </g>
        )}
      </svg>

      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        {rs.map((r, k) => (
          <Slider key={k} label={`R${k + 1}`} value={r} min={1} max={12} onChange={(v) => set(k, v)} unit=" Ω" />
        ))}
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "Equivalent R", v: `${Req.toFixed(2)} Ω`, hi: true },
          { k: "Total current", v: `${Itot.toFixed(2)} A`, hi: true },
          { k: "Total power", v: `${(V * Itot).toFixed(1)} W` },
          { k: "Compare", v: mode === "series" ? "R<sub>eq</sub> &gt; biggest R" : "R<sub>eq</sub> &lt; smallest R" },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        {mode === "series"
          ? "In series the same current flows through everything, but the voltage splits up. Add a resistor and the total resistance goes up — everything dims."
          : "In parallel every branch gets the full 12 V, so each one draws its own current. Adding a branch lowers the total resistance and the battery has to supply more current. That is why home appliances are wired in parallel."}
      </p>
    </SimFrame>
  );
}

/* ============================================================ POWER & BILL */
const APPLIANCES = [
  { n: "LED bulb", w: 9 }, { n: "Ceiling fan", w: 75 }, { n: "Fridge", w: 200 },
  { n: "TV", w: 120 }, { n: "Geyser", w: 2000 }, { n: "Air conditioner", w: 1500 },
  { n: "Iron", w: 1000 }, { n: "Laptop", w: 60 },
];

export function PowerBill() {
  const [idx, setIdx] = useState(4);
  const [hrs, setHrs] = useState(1);
  const [rate, setRate] = useState(8);
  const a = APPLIANCES[idx];
  const kwhDay = (a.w * hrs) / 1000;
  const kwhMonth = kwhDay * 30;
  const cost = kwhMonth * rate;

  return (
    <SimFrame title="What actually runs up the electricity bill" onReset={() => { setIdx(4); setHrs(1); setRate(8); }}
      caption="1 kWh = 1 unit = 3.6 × 10⁶ J. Bills are charged per unit, which is why a 2000 W geyser for 30 minutes costs more than an LED bulb running all month.">
      <Choice label="Appliance" value={idx} onChange={setIdx} options={APPLIANCES.map((x, i) => ({ v: i, l: `${x.n} · ${x.w}W` }))} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label="Hours used per day" value={hrs} min={0.25} max={24} step={0.25} onChange={setHrs} unit=" h" />
        <Slider label="Tariff" value={rate} min={3} max={14} step={0.5} onChange={setRate} fmt={(v) => `₹${v.toFixed(1)}`} unit="/unit" />
      </div>
      <div className="mt-4">
        <Readout items={[
          { k: "Energy / day", v: `${kwhDay.toFixed(2)} kWh` },
          { k: "Units / month", v: `${kwhMonth.toFixed(1)}`, hi: true },
          { k: "Cost / month", v: `₹${cost.toFixed(0)}`, hi: true },
          { k: "In joules / day", v: `${(kwhDay * 3.6).toFixed(2)}×10⁶ J` },
        ]} />
      </div>
      <div className="mt-4 h-6 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-500 transition-all"
          style={{ width: `${Math.min(100, (kwhMonth / 450) * 100)}%` }} />
      </div>
      <p className="mt-2 text-[0.82rem] faint">Bar shows this one appliance against a typical 450-unit household month.</p>
    </SimFrame>
  );
}

/* ========================================================= MAGNETIC FIELD */
export function MagneticField() {
  const [kind, setKind] = useState<"straight" | "loop" | "solenoid">("straight");
  const [dir, setDir] = useState(1);
  const [I, setI] = useState(5);
  const rings = [30, 55, 82, 112];

  return (
    <SimFrame title="Magnetic field around a current" onReset={() => { setKind("straight"); setDir(1); setI(5); }}
      caption="Right-hand thumb rule: point your right thumb along the current, and your curled fingers show which way the field lines circle.">
      <svg viewBox="0 0 760 290" className="w-full select-none" style={{ maxHeight: 290 }}>
        {kind === "straight" && (
          <g>
            <line x1={380} y1={20} x2={380} y2={270} stroke="#ef4444" strokeWidth={5} />
            <polygon points={`375,${dir > 0 ? 60 : 230} 385,${dir > 0 ? 60 : 230} 380,${dir > 0 ? 40 : 250}`} fill="#ef4444" />
            <text x={396} y={dir > 0 ? 46 : 256} fontSize={12} fill="#ef4444" fontWeight={700}>I</text>
            {rings.map((r) => (
              <g key={r}>
                <ellipse cx={380} cy={145} rx={r} ry={r * 0.32} fill="none" stroke="#0ea5e9"
                  strokeWidth={Math.max(1, 2.6 - r / 60)} opacity={Math.max(0.25, 1 - r / 150) * (0.4 + I / 16)} />
                <polygon points="0,-4 8,0 0,4" fill="#0ea5e9"
                  opacity={Math.max(0.3, 1 - r / 150)}
                  transform={`translate(${380 + (dir > 0 ? r : -r)},145) rotate(${dir > 0 ? -90 : 90})`} />
              </g>
            ))}
            <text x={40} y={40} fontSize={12} fill="currentColor" opacity={0.65}>
              Field circles are closer together near the wire — the field is strongest there.
            </text>
          </g>
        )}
        {kind === "loop" && (
          <g>
            <ellipse cx={380} cy={145} rx={95} ry={95} fill="none" stroke="#ef4444" strokeWidth={5} />
            {[-1, 1].map((s) => (
              <g key={s}>
                {[0, 1, 2].map((k) => (
                  <ellipse key={k} cx={380 + s * (30 + k * 30)} cy={145} rx={22 + k * 20} ry={70 - k * 14}
                    fill="none" stroke="#0ea5e9" strokeWidth={1.8} opacity={0.55} />
                ))}
              </g>
            ))}
            <line x1={200} y1={145} x2={560} y2={145} stroke="#0ea5e9" strokeWidth={2.4} />
            <polygon points="0,-5 10,0 0,5" fill="#0ea5e9" transform={`translate(${dir > 0 ? 545 : 215},145) rotate(${dir > 0 ? 0 : 180})`} />
            <text x={380} y={262} fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.65}>
              Inside the loop every bit of the wire pushes the field the same way — so the field there is strong and straight.
            </text>
          </g>
        )}
        {kind === "solenoid" && (
          <g>
            {Array.from({ length: 9 }).map((_, k) => (
              <ellipse key={k} cx={230 + k * 38} cy={145} rx={13} ry={58} fill="none" stroke="#ef4444" strokeWidth={4} />
            ))}
            <line x1={150} y1={145} x2={620} y2={145} stroke="#0ea5e9" strokeWidth={3} />
            {[105, 185].map((dy) => (
              <path key={dy} d={`M 600 145 C 700 145 700 ${dy} 500 ${dy} C 260 ${dy} 180 ${dy} 160 145`} fill="none" stroke="#0ea5e9" strokeWidth={2} opacity={0.6} />
            ))}
            <polygon points="0,-6 12,0 0,6" fill="#0ea5e9" transform={`translate(${dir > 0 ? 600 : 170},145) rotate(${dir > 0 ? 0 : 180})`} />
            <text x={dir > 0 ? 640 : 118} y={150} fontSize={16} fontWeight={700} fill="#ef4444">N</text>
            <text x={dir > 0 ? 122 : 636} y={150} fontSize={16} fontWeight={700} fill="#334155">S</text>
            <text x={380} y={266} fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.65}>
              A solenoid behaves exactly like a bar magnet — uniform field inside, poles at the ends.
            </text>
          </g>
        )}
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Conductor" value={kind} onChange={(v) => setKind(v as typeof kind)}
          options={[{ v: "straight", l: "Straight wire" }, { v: "loop", l: "Circular loop" }, { v: "solenoid", l: "Solenoid" }]} />
        <Choice label="Current direction" value={dir} onChange={setDir}
          options={[{ v: 1, l: "Forward" }, { v: -1, l: "Reversed" }]} />
      </div>
      <div className="mt-3"><Slider label="Current strength" value={I} min={1} max={15} onChange={setI} unit=" A" /></div>
    </SimFrame>
  );
}

/* ============================================================ FLEMING LHR */
export function FlemingLHR() {
  const [cur, setCur] = useState<"right" | "left">("right");
  const [field, setField] = useState<"in" | "out">("in");
  // F = I x B. current right (+x), field into page (-z) => F = x̂ × (−ẑ) = +ŷ (up on screen means −y svg)
  const up = (cur === "right") === (field === "in");

  return (
    <SimFrame title="Fleming's left-hand rule" onReset={() => { setCur("right"); setField("in"); }}
      caption="First finger = Field, seCond finger = Current, thuMb = Motion (force). Flip either one and the force flips; flip both and it stays put.">
      <svg viewBox="0 0 760 280" className="w-full select-none" style={{ maxHeight: 280 }}>
        {/* magnet poles */}
        <rect x={110} y={40} width={70} height={200} rx={6} fill="#ef4444" fillOpacity={0.75} />
        <text x={145} y={148} fontSize={26} textAnchor="middle" fill="#fff" fontWeight={700}>N</text>
        <rect x={580} y={40} width={70} height={200} rx={6} fill="#3b82f6" fillOpacity={0.75} />
        <text x={615} y={148} fontSize={26} textAnchor="middle" fill="#fff" fontWeight={700}>S</text>

        {/* field markers */}
        {Array.from({ length: 20 }).map((_, k) => {
          const x = 210 + (k % 5) * 85, y = 70 + Math.floor(k / 5) * 50;
          return field === "in" ? (
            <g key={k} opacity={0.5}>
              <circle cx={x} cy={y} r={9} fill="none" stroke="#3b82f6" strokeWidth={1.6} />
              <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} stroke="#3b82f6" strokeWidth={1.6} />
              <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} stroke="#3b82f6" strokeWidth={1.6} />
            </g>
          ) : (
            <g key={k} opacity={0.5}>
              <circle cx={x} cy={y} r={9} fill="none" stroke="#3b82f6" strokeWidth={1.6} />
              <circle cx={x} cy={y} r={2.6} fill="#3b82f6" />
            </g>
          );
        })}

        {/* conductor */}
        <line x1={200} y1={165} x2={570} y2={165} stroke="#f59e0b" strokeWidth={7} strokeLinecap="round" />
        <polygon points="0,-8 16,0 0,8" fill="#f59e0b"
          transform={`translate(${cur === "right" ? 540 : 230},165) rotate(${cur === "right" ? 0 : 180})`} />
        <text x={385} y={192} fontSize={13} textAnchor="middle" fill="#b45309" fontWeight={700}>current I</text>

        {/* force arrow */}
        <g transform={`translate(385,165)`}>
          <line x1={0} y1={0} x2={0} y2={up ? -95 : 95} stroke="#10b981" strokeWidth={6} strokeLinecap="round" />
          <polygon points={`0,${up ? -110 : 110} -11,${up ? -88 : 88} 11,${up ? -88 : 88}`} fill="#10b981" />
          <text x={24} y={up ? -80 : 88} fontSize={14} fill="#10b981" fontWeight={700}>Force F</text>
        </g>
      </svg>
      <div className="grid gap-3 sm:grid-cols-2">
        <Choice label="Current direction" value={cur} onChange={(v) => setCur(v as typeof cur)}
          options={[{ v: "right", l: "→ Right" }, { v: "left", l: "← Left" }]} />
        <Choice label="Magnetic field" value={field} onChange={(v) => setField(v as typeof field)}
          options={[{ v: "in", l: "⊗ Into page" }, { v: "out", l: "⊙ Out of page" }]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        The force is <strong>perpendicular to both</strong> the current and the field — and it is largest when they are at 90° to each other,
        which is exactly how a motor is built.
      </p>
    </SimFrame>
  );
}

/* ======================================================= DOMESTIC CIRCUIT */
export function DomesticCircuit() {
  const [fault, setFault] = useState<"none" | "overload" | "short" | "leak">("none");
  const blown = fault === "overload" || fault === "short";
  const msg = {
    none: { t: "Everything normal", d: "Current flows in through the live wire, through the appliance, and back out through the neutral. The earth wire carries nothing." },
    overload: { t: "Overload", d: "Too many high-power appliances on one circuit. Current exceeds the fuse rating, the fuse wire melts and breaks the circuit before the wiring can overheat." },
    short: { t: "Short circuit", d: "Live and neutral touch directly. Resistance collapses to nearly zero, so current shoots up enormously — the fuse or MCB trips instantly." },
    leak: { t: "Earth leakage", d: "The live wire touches the metal body of the appliance. The earth wire gives that current a low-resistance path straight into the ground, so you don't get a shock." },
  }[fault];

  return (
    <SimFrame title="Inside a domestic circuit" onReset={() => setFault("none")}
      caption="Live (red) at 220 V, neutral (black) at 0 V, earth (green) as the safety escape route. Try each fault and watch what protects you.">
      <svg viewBox="0 0 760 280" className="w-full select-none" style={{ maxHeight: 280 }}>
        {/* mains */}
        <text x={40} y={44} fontSize={12} fill="currentColor" opacity={0.6}>Mains 220 V</text>
        <line x1={40} y1={60} x2={200} y2={60} stroke="#ef4444" strokeWidth={4} />
        <line x1={40} y1={200} x2={680} y2={200} stroke="#111827" strokeWidth={4} />
        <text x={44} y={218} fontSize={11} fill="currentColor" opacity={0.6}>Neutral</text>
        <text x={44} y={54} fontSize={11} fill="#ef4444" opacity={0.9}>Live</text>

        {/* fuse / MCB */}
        <g transform="translate(200,60)">
          <rect x={0} y={-14} width={70} height={28} rx={5} fill="var(--surface-2)" stroke="#64748b" strokeWidth={2} />
          {blown ? (
            <>
              <line x1={8} y1={0} x2={28} y2={0} stroke="#ef4444" strokeWidth={3} />
              <line x1={42} y1={0} x2={62} y2={0} stroke="#ef4444" strokeWidth={3} />
              <text x={35} y={-20} fontSize={11} textAnchor="middle" fill="#ef4444" fontWeight={700}>TRIPPED</text>
            </>
          ) : (
            <line x1={8} y1={0} x2={62} y2={0} stroke="#10b981" strokeWidth={3} />
          )}
          <text x={35} y={30} fontSize={11} textAnchor="middle" fill="currentColor" opacity={0.6}>fuse / MCB</text>
        </g>

        <line x1={270} y1={60} x2={520} y2={60} stroke={blown ? "#94a3b8" : "#ef4444"} strokeWidth={4} />

        {/* appliance */}
        <g transform="translate(520,60)">
          <rect x={-2} y={0} width={4} height={40} fill={blown ? "#94a3b8" : "#ef4444"} />
          <rect x={-70} y={40} width={140} height={100} rx={8} fill="var(--surface-2)" stroke="#64748b" strokeWidth={2.5} />
          <text x={0} y={78} fontSize={13} textAnchor="middle" fill="currentColor" fontWeight={600}>Appliance</text>
          <circle cx={0} cy={104} r={14} fill="#fde68a" fillOpacity={blown ? 0.1 : 0.95} stroke="#f59e0b" strokeWidth={2} />
          <rect x={-2} y={140} width={4} height={60} fill="#111827" />
        </g>

        {/* short circuit link */}
        {fault === "short" && (
          <path d="M 400 60 L 390 110 L 412 110 L 396 200" fill="none" stroke="#f97316" strokeWidth={4} />
        )}
        {/* earth wire */}
        <line x1={590} y1={100} x2={690} y2={100} stroke="#16a34a" strokeWidth={4} strokeDasharray={fault === "leak" ? undefined : "6 5"} />
        <line x1={690} y1={100} x2={690} y2={240} stroke="#16a34a" strokeWidth={4} strokeDasharray={fault === "leak" ? undefined : "6 5"} />
        <line x1={660} y1={240} x2={720} y2={240} stroke="#16a34a" strokeWidth={5} />
        <line x1={670} y1={250} x2={710} y2={250} stroke="#16a34a" strokeWidth={4} />
        <line x1={680} y1={260} x2={700} y2={260} stroke="#16a34a" strokeWidth={3} />
        <text x={700} y={92} fontSize={11} fill="#16a34a" fontWeight={600}>Earth</text>
        {fault === "leak" && <text x={596} y={128} fontSize={11} fill="#16a34a" fontWeight={700}>leakage current escapes safely →</text>}
      </svg>
      <Choice label="Simulate" value={fault} onChange={(v) => setFault(v as typeof fault)}
        options={[{ v: "none", l: "Normal" }, { v: "overload", l: "Overload" }, { v: "short", l: "Short circuit" }, { v: "leak", l: "Earth leakage" }]} />
      <div className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-3">
        <div className="text-[13px] font-semibold">{msg.t}</div>
        <p className="mt-1 text-[0.88rem] muted">{msg.d}</p>
      </div>
    </SimFrame>
  );
}
