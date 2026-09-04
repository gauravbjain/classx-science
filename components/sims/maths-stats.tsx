"use client";
import React, { useState } from "react";
import { SimFrame, Slider, Choice, Readout } from "./shell";

const r2 = (x: number) => Math.round(x * 100) / 100;

/* =========================================================== GROUPED DATA */
const CLASSES = [
  [0, 10], [10, 20], [20, 30], [30, 40], [40, 50], [50, 60],
];

export function GroupedData() {
  const [f, setF] = useState([5, 8, 15, 12, 7, 3]);
  const [method, setMethod] = useState<"direct" | "assumed" | "step">("direct");
  const h = 10;
  const x = CLASSES.map(([a, b]) => (a + b) / 2);
  const N = f.reduce((a, b) => a + b, 0);

  const a0 = x[Math.floor(x.length / 2)];              // assumed mean
  const sumFX = f.reduce((s, fi, i) => s + fi * x[i], 0);
  const sumFD = f.reduce((s, fi, i) => s + fi * (x[i] - a0), 0);
  const sumFU = f.reduce((s, fi, i) => s + fi * ((x[i] - a0) / h), 0);
  const mean = sumFX / N;

  // median
  const cf: number[] = [];
  f.reduce((s, fi) => { const t = s + fi; cf.push(t); return t; }, 0);
  const medIdx = cf.findIndex((c) => c >= N / 2);
  const lMed = CLASSES[medIdx][0];
  const cfPrev = medIdx === 0 ? 0 : cf[medIdx - 1];
  const median = lMed + ((N / 2 - cfPrev) / f[medIdx]) * h;

  // mode
  const modIdx = f.indexOf(Math.max(...f));
  const f1 = f[modIdx], f0 = modIdx > 0 ? f[modIdx - 1] : 0, f2 = modIdx < f.length - 1 ? f[modIdx + 1] : 0;
  const denom = 2 * f1 - f0 - f2;
  const mode = denom === 0 ? NaN : CLASSES[modIdx][0] + ((f1 - f0) / denom) * h;

  const maxF = Math.max(...f, 1);
  const set = (i: number, v: number) => setF((arr) => arr.map((y, k) => (k === i ? v : y)));

  return (
    <SimFrame title="Mean, median and mode of grouped data" onReset={() => { setF([5, 8, 15, 12, 7, 3]); setMethod("direct"); }}
      caption="Drag the bars. Watch the three averages move apart — they answer different questions, which is exactly why the board asks for all three.">
      <div className="mb-4 flex h-40 items-end gap-2">
        {f.map((fi, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end">
            <span className="mb-1 font-mono text-[11px] font-semibold">{fi}</span>
            <div className="w-full rounded-t transition-all"
              style={{ height: `${(fi / maxF) * 100}%`, minHeight: 2, background: i === modIdx ? "#a855f7" : "#c4b5fd" }} />
            <span className="mt-1 text-[9.5px] faint">{CLASSES[i][0]}–{CLASSES[i][1]}</span>
          </div>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {f.map((fi, i) => (
          <Slider key={i} label={`${CLASSES[i][0]}–${CLASSES[i][1]}`} value={fi} min={0} max={20} onChange={(v) => set(i, v)} />
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border hairline">
        <table className="w-full min-w-[30rem] text-[0.86rem]">
          <thead>
            <tr className="bg-[var(--surface-2)] text-[11px] uppercase tracking-wider faint">
              <th className="px-3 py-2 text-left">Class</th>
              <th className="px-3 py-2">x<sub>i</sub></th>
              <th className="px-3 py-2">f<sub>i</sub></th>
              {method === "direct" && <th className="px-3 py-2">f<sub>i</sub>x<sub>i</sub></th>}
              {method === "assumed" && <th className="px-3 py-2">d<sub>i</sub> = x<sub>i</sub>−a</th>}
              {method === "assumed" && <th className="px-3 py-2">f<sub>i</sub>d<sub>i</sub></th>}
              {method === "step" && <th className="px-3 py-2">u<sub>i</sub> = d<sub>i</sub>/h</th>}
              {method === "step" && <th className="px-3 py-2">f<sub>i</sub>u<sub>i</sub></th>}
              <th className="px-3 py-2">cf</th>
            </tr>
          </thead>
          <tbody className="text-center font-mono tabular-nums">
            {f.map((fi, i) => (
              <tr key={i} className="border-t hairline">
                <td className="px-3 py-1.5 text-left">{CLASSES[i][0]}–{CLASSES[i][1]}</td>
                <td className="px-3 py-1.5">{x[i]}</td>
                <td className="px-3 py-1.5">{fi}</td>
                {method === "direct" && <td className="px-3 py-1.5">{fi * x[i]}</td>}
                {method === "assumed" && <td className="px-3 py-1.5">{x[i] - a0}</td>}
                {method === "assumed" && <td className="px-3 py-1.5">{fi * (x[i] - a0)}</td>}
                {method === "step" && <td className="px-3 py-1.5">{(x[i] - a0) / h}</td>}
                {method === "step" && <td className="px-3 py-1.5">{fi * ((x[i] - a0) / h)}</td>}
                <td className="px-3 py-1.5 faint">{cf[i]}</td>
              </tr>
            ))}
            <tr className="border-t hairline bg-[var(--surface-2)] font-semibold">
              <td className="px-3 py-1.5 text-left">Σ</td>
              <td />
              <td className="px-3 py-1.5">{N}</td>
              {method === "direct" && <td className="px-3 py-1.5">{sumFX}</td>}
              {method === "assumed" && <td />}
              {method === "assumed" && <td className="px-3 py-1.5">{sumFD}</td>}
              {method === "step" && <td />}
              {method === "step" && <td className="px-3 py-1.5">{sumFU}</td>}
              <td />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3">
        <Choice label="Method for the mean" value={method} onChange={(v) => setMethod(v as typeof method)}
          options={[{ v: "direct", l: "Direct" }, { v: "assumed", l: "Assumed mean" }, { v: "step", l: "Step deviation" }]} />
      </div>
      <div className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 font-serif text-[1.02rem]">
        {method === "direct" && <>Mean = Σf<sub>i</sub>x<sub>i</sub> / Σf<sub>i</sub> = {sumFX} / {N} = <strong>{r2(mean)}</strong></>}
        {method === "assumed" && <>Mean = a + Σf<sub>i</sub>d<sub>i</sub>/Σf<sub>i</sub> = {a0} + ({sumFD}/{N}) = <strong>{r2(mean)}</strong></>}
        {method === "step" && <>Mean = a + h·(Σf<sub>i</sub>u<sub>i</sub>/Σf<sub>i</sub>) = {a0} + 10×({sumFU}/{N}) = <strong>{r2(mean)}</strong></>}
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "Mean", v: `${r2(mean)}`, hi: true },
          { k: "Median", v: `${r2(median)}`, hi: true },
          { k: "Mode", v: isNaN(mode) ? "—" : `${r2(mode)}`, hi: true },
          { k: "Total Σfᵢ", v: `${N}` },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        All three methods give the <em>same</em> mean — assumed mean and step deviation just make the arithmetic
        smaller. The empirical relationship <strong>3 Median = Mode + 2 Mean</strong> holds approximately; check it
        against the numbers above.
      </p>
    </SimFrame>
  );
}

/* =========================================================== PROBABILITY */
type Exp = "die" | "twodice" | "coins";

export function ProbabilitySim() {
  const [exp, setExp] = useState<Exp>("die");
  const [counts, setCounts] = useState<number[]>(Array(6).fill(0));
  const [trials, setTrials] = useState(0);

  const cfg = {
    die: { n: 6, labels: ["1", "2", "3", "4", "5", "6"], theo: Array(6).fill(1 / 6), title: "Rolling one die" },
    twodice: { n: 11, labels: ["2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], theo: [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1].map((v) => v / 36), title: "Sum of two dice" },
    coins: { n: 4, labels: ["0 H", "1 H", "2 H", "3 H"], theo: [1 / 8, 3 / 8, 3 / 8, 1 / 8], title: "Heads in three coin tosses" },
  }[exp];

  const pick = (e: Exp) => {
    setExp(e);
    setCounts(Array(e === "die" ? 6 : e === "twodice" ? 11 : 4).fill(0));
    setTrials(0);
  };

  const run = (n: number) => {
    setCounts((old) => {
      const next = [...old];
      for (let i = 0; i < n; i++) {
        let idx = 0;
        if (exp === "die") idx = Math.floor(Math.random() * 6);
        else if (exp === "twodice") idx = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6);
        else idx = [0, 1, 2].reduce((s) => s + (Math.random() < 0.5 ? 1 : 0), 0);
        next[idx]++;
      }
      return next;
    });
    setTrials((t) => t + n);
  };

  const maxP = Math.max(...cfg.theo, ...counts.map((c) => (trials ? c / trials : 0)), 0.01);

  return (
    <SimFrame title="Theoretical vs experimental probability" onReset={() => pick(exp)}
      caption="Roll a few times and the bars are all over the place. Roll a few thousand and they settle onto the theory. That is what probability actually promises.">
      <Choice label="Experiment" value={exp} onChange={(v) => pick(v as Exp)}
        options={[{ v: "die", l: "One die" }, { v: "twodice", l: "Two dice (sum)" }, { v: "coins", l: "Three coins" }]} />

      <div className="mt-4 flex h-48 items-end gap-1.5">
        {cfg.labels.map((lab, i) => {
          const empirical = trials ? counts[i] / trials : 0;
          return (
            <div key={i} className="flex flex-1 flex-col items-center justify-end">
              <div className="flex h-full w-full items-end justify-center gap-[3px]">
                <div className="w-1/2 rounded-t bg-[#a855f7] transition-all"
                  style={{ height: `${(empirical / maxP) * 100}%`, minHeight: 2 }} title="experimental" />
                <div className="w-1/2 rounded-t border-2 border-dashed border-[#0ea5e9] bg-[#0ea5e9]/15"
                  style={{ height: `${(cfg.theo[i] / maxP) * 100}%`, minHeight: 2 }} title="theoretical" />
              </div>
              <span className="mt-1 text-[10px] faint">{lab}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-1 flex gap-4 text-[11.5px] muted">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-[#a855f7]" /> experimental</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm border-2 border-dashed border-[#0ea5e9]" /> theoretical</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {[1, 10, 100, 1000].map((n) => (
          <button key={n} onClick={() => run(n)}
            className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-[12px] font-medium text-white">
            +{n} {n === 1 ? "trial" : "trials"}
          </button>
        ))}
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "Trials so far", v: String(trials), hi: true },
          { k: "Most likely outcome", v: cfg.labels[cfg.theo.indexOf(Math.max(...cfg.theo))] },
          { k: "Its theoretical P", v: `${r2(Math.max(...cfg.theo) * 100)}%` },
          { k: "Its experimental P", v: trials ? `${r2((counts[cfg.theo.indexOf(Math.max(...cfg.theo))] / trials) * 100)}%` : "—", hi: true },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        {exp === "twodice"
          ? "A sum of 7 is the most likely because it can happen six different ways (1+6, 2+5, 3+4 and their reverses), while 2 can happen only one way. Probability counts outcomes, not values."
          : "Every outcome here is equally likely, so P(E) = number of favourable outcomes ÷ total number of outcomes. Note P always sits between 0 and 1, and P(E) + P(not E) = 1."}
      </p>
    </SimFrame>
  );
}
