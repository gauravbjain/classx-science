"use client";
import React, { useMemo, useState } from "react";
import { SimFrame, Slider, Choice, Readout, Verdict } from "./shell";

/* --------------------------------------------------------------- helpers */
/** Drop a leading coefficient of 1 or −1, as printed maths does. */
const lead = (a: number, v = "x²") => (a === 1 ? v : a === -1 ? `−${v}` : `${a}${v}`);

/* ------------------------------------------------------------- graph frame */
const W = 640, H = 380;
function Grid({ sx, sy, ox = W / 2, oy = H / 2, xmax = 8, ymax = 10 }:
  { sx: number; sy: number; ox?: number; oy?: number; xmax?: number; ymax?: number }) {
  const lines = [];
  for (let i = -xmax; i <= xmax; i++)
    lines.push(<line key={`v${i}`} x1={ox + i * sx} y1={0} x2={ox + i * sx} y2={H}
      stroke="currentColor" strokeWidth={i === 0 ? 1.6 : 0.6} opacity={i === 0 ? 0.5 : 0.13} />);
  for (let i = -ymax; i <= ymax; i++)
    lines.push(<line key={`h${i}`} x1={0} y1={oy - i * sy} x2={W} y2={oy - i * sy}
      stroke="currentColor" strokeWidth={i === 0 ? 1.6 : 0.6} opacity={i === 0 ? 0.5 : 0.13} />);
  return (
    <g>
      {lines}
      <text x={W - 12} y={oy - 8} fontSize={12} textAnchor="end" fill="currentColor" opacity={0.5}>x</text>
      <text x={ox + 8} y={14} fontSize={12} fill="currentColor" opacity={0.5}>y</text>
    </g>
  );
}

/* ====================================================== POLYNOMIAL GRAPH */
export function PolynomialGraph() {
  const [deg, setDeg] = useState(2);
  const [a, setA] = useState(1);
  const [b, setB] = useState(-1);
  const [c, setC] = useState(-6);
  const [d, setD] = useState(0);

  const sx = 36, sy = 17;
  const f = (x: number) => deg === 1 ? a * x + b : deg === 2 ? a * x * x + b * x + c : a * x ** 3 + b * x * x + c * x + d;

  const path = useMemo(() => {
    const pts: string[] = [];
    for (let px = 0; px <= W; px += 2) {
      const x = (px - W / 2) / sx;
      const y = f(x);
      const py = H / 2 - y * sy;
      if (py > -400 && py < H + 400) pts.push(`${px},${py.toFixed(1)}`);
      else pts.push("");
    }
    return pts.filter(Boolean).join(" ");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, b, c, d, deg]);

  // zeros
  const zeros = useMemo(() => {
    if (deg === 1) return a === 0 ? [] : [-b / a];
    if (deg === 2) {
      if (a === 0) return b === 0 ? [] : [-c / b];
      const D = b * b - 4 * a * c;
      if (D < 0) return [];
      if (D === 0) return [-b / (2 * a)];
      return [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)];
    }
    const out: number[] = [];
    let prev = f(-9);
    for (let x = -9; x <= 9; x += 0.01) {
      const cur = f(x);
      if (prev === 0 || (prev < 0) !== (cur < 0)) {
        if (!out.some((z) => Math.abs(z - x) < 0.2)) out.push(parseFloat(x.toFixed(2)));
      }
      prev = cur;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [a, b, c, d, deg]);

  const sum = deg === 2 && a !== 0 ? -b / a : null;
  const prod = deg === 2 && a !== 0 ? c / a : null;

  const expr = deg === 1
    ? `${lead(a, "x")} ${b >= 0 ? "+" : "−"} ${Math.abs(b)}`
    : deg === 2
      ? `${lead(a)} ${b >= 0 ? "+" : "−"} ${Math.abs(b)}x ${c >= 0 ? "+" : "−"} ${Math.abs(c)}`
      : `${lead(a, "x³")} ${b >= 0 ? "+" : "−"} ${Math.abs(b)}x² ${c >= 0 ? "+" : "−"} ${Math.abs(c)}x ${d >= 0 ? "+" : "−"} ${Math.abs(d)}`;

  return (
    <SimFrame title="Zeros of a polynomial" onReset={() => { setDeg(2); setA(1); setB(-1); setC(-6); setD(0); }}
      caption="A zero of p(x) is where the graph crosses the x-axis. A polynomial of degree n crosses it at most n times — that is the whole idea.">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" style={{ maxHeight: 360 }}>
        <Grid sx={sx} sy={sy} />
        <polyline points={path} fill="none" stroke="#8b5cf6" strokeWidth={2.6} />
        {zeros.map((z, i) => (
          <g key={i}>
            <circle cx={W / 2 + z * sx} cy={H / 2} r={6} fill="#f43f5e" />
            <text x={W / 2 + z * sx} y={H / 2 + 24} fontSize={12} textAnchor="middle" fill="#f43f5e" fontWeight={700}>
              {z.toFixed(2).replace(/\.00$/, "")}
            </text>
          </g>
        ))}
      </svg>

      <div className="mb-3 rounded-lg bg-[var(--surface-2)] px-4 py-2 text-center font-serif text-[1.15rem]">
        p(x) = {expr}
      </div>

      <Choice label="Degree" value={deg} onChange={setDeg}
        options={[{ v: 1, l: "Linear" }, { v: 2, l: "Quadratic" }, { v: 3, l: "Cubic" }]} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label="a" value={a} min={-3} max={3} step={0.5} onChange={setA} />
        <Slider label="b" value={b} min={-8} max={8} onChange={setB} />
        {deg >= 2 && <Slider label="c" value={c} min={-8} max={8} onChange={setC} />}
        {deg === 3 && <Slider label="d" value={d} min={-8} max={8} onChange={setD} />}
      </div>

      <div className="mt-3">
        <Readout items={[
          { k: "Number of zeros", v: String(zeros.length), hi: true },
          { k: "Zeros", v: zeros.length ? zeros.map((z) => z.toFixed(2).replace(/\.00$/, "")).join(", ") : "none (graph misses the axis)", hi: true },
          { k: "Sum α+β", v: sum === null ? "—" : `${sum.toFixed(2)}  (−b/a)` },
          { k: "Product αβ", v: prod === null ? "—" : `${prod.toFixed(2)}  (c/a)` },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        {deg === 2 && zeros.length === 0 && "The parabola never touches the x-axis, so this quadratic has no real zeros — its discriminant is negative."}
        {deg === 2 && zeros.length === 1 && "The parabola just touches the axis — two equal zeros, discriminant exactly zero."}
        {deg === 2 && zeros.length === 2 && "Two distinct zeros. Check them: their sum should equal −b/a and their product c/a."}
        {deg === 1 && "A linear polynomial has exactly one zero — a straight line crosses the x-axis once (unless it is horizontal)."}
        {deg === 3 && "A cubic has at most three zeros. Change the coefficients and watch the count drop to two or one."}
      </p>
    </SimFrame>
  );
}

/* ================================================= PAIR OF LINEAR EQUATIONS */
export function LinearPair() {
  const [a1, setA1] = useState(2); const [b1, setB1] = useState(3); const [c1, setC1] = useState(6);
  const [a2, setA2] = useState(4); const [b2, setB2] = useState(-1); const [c2, setC2] = useState(5);
  const sx = 34, sy = 17;

  const det = a1 * b2 - a2 * b1;
  const rA = a2 === 0 ? Infinity : a1 / a2;
  const rB = b2 === 0 ? Infinity : b1 / b2;
  const rC = c2 === 0 ? Infinity : c1 / c2;
  const eq = (p: number, q: number) => Math.abs(p - q) < 1e-9;

  const kind = det !== 0
    ? "unique"
    : eq(rA, rB) && eq(rB, rC) ? "infinite" : "none";

  const ix = det !== 0 ? (c1 * b2 - c2 * b1) / det : null;
  const iy = det !== 0 ? (a1 * c2 - a2 * c1) / det : null;

  const lineFor = (a: number, b: number, c: number) => {
    // a x + b y = c
    if (b === 0) {
      if (a === 0) return null;
      const x = c / a;
      return { x1: W / 2 + x * sx, y1: 0, x2: W / 2 + x * sx, y2: H };
    }
    const yAt = (x: number) => (c - a * x) / b;
    const xL = -W / 2 / sx, xR = W / 2 / sx;
    return { x1: 0, y1: H / 2 - yAt(xL) * sy, x2: W, y2: H / 2 - yAt(xR) * sy };
  };
  const L1 = lineFor(a1, b1, c1), L2 = lineFor(a2, b2, c2);

  const fmt = (a: number, b: number, c: number) =>
    `${lead(a, "x")} ${b >= 0 ? "+" : "−"} ${Math.abs(b) === 1 ? "" : Math.abs(b)}y = ${c}`;

  return (
    <SimFrame title="Pair of linear equations" onReset={() => { setA1(2); setB1(3); setC1(6); setA2(4); setB2(-1); setC2(5); }}
      caption="Two lines can meet once, never, or everywhere. Those three pictures are exactly the three answers a pair of linear equations can have.">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" style={{ maxHeight: 340 }}>
        <Grid sx={sx} sy={sy} />
        {L1 && <line {...L1} stroke="#8b5cf6" strokeWidth={2.6} />}
        {L2 && <line {...L2} stroke="#f59e0b" strokeWidth={2.6} />}
        {ix !== null && iy !== null && Math.abs(ix) < 10 && Math.abs(iy) < 11 && (
          <g>
            <circle cx={W / 2 + ix * sx} cy={H / 2 - iy * sy} r={7} fill="#10b981" />
            <text x={W / 2 + ix * sx + 12} y={H / 2 - iy * sy - 10} fontSize={12} fill="#10b981" fontWeight={700}>
              ({ix.toFixed(2)}, {iy.toFixed(2)})
            </text>
          </g>
        )}
      </svg>

      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg px-3 py-2 text-center font-serif text-[1.02rem]" style={{ background: "color-mix(in srgb, #8b5cf6 12%, transparent)" }}>
          {fmt(a1, b1, c1)}
        </div>
        <div className="rounded-lg px-3 py-2 text-center font-serif text-[1.02rem]" style={{ background: "color-mix(in srgb, #f59e0b 14%, transparent)" }}>
          {fmt(a2, b2, c2)}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="a₁" value={a1} min={-6} max={6} onChange={setA1} />
        <Slider label="b₁" value={b1} min={-6} max={6} onChange={setB1} />
        <Slider label="c₁" value={c1} min={-9} max={9} onChange={setC1} />
        <Slider label="a₂" value={a2} min={-6} max={6} onChange={setA2} />
        <Slider label="b₂" value={b2} min={-6} max={6} onChange={setB2} />
        <Slider label="c₂" value={c2} min={-9} max={9} onChange={setC2} />
      </div>

      <div className="mt-4">
        <Verdict ok={kind === "unique" ? true : kind === "infinite" ? null : false}>
          {kind === "unique" && <><strong>Consistent, unique solution.</strong> a₁/a₂ ≠ b₁/b₂, so the lines intersect at exactly one point.</>}
          {kind === "infinite" && <><strong>Consistent, infinitely many solutions.</strong> a₁/a₂ = b₁/b₂ = c₁/c₂, so the two equations describe the <em>same</em> line — they are coincident.</>}
          {kind === "none" && <><strong>Inconsistent, no solution.</strong> a₁/a₂ = b₁/b₂ but ≠ c₁/c₂, so the lines are parallel and never meet.</>}
        </Verdict>
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "a₁/a₂", v: isFinite(rA) ? rA.toFixed(2) : "∞" },
          { k: "b₁/b₂", v: isFinite(rB) ? rB.toFixed(2) : "∞" },
          { k: "c₁/c₂", v: isFinite(rC) ? rC.toFixed(2) : "∞" },
          { k: "Lines are", v: kind === "unique" ? "intersecting" : kind === "infinite" ? "coincident" : "parallel", hi: true },
        ]} />
      </div>
    </SimFrame>
  );
}

/* ========================================================= QUADRATIC ROOTS */
export function QuadraticRoots() {
  const [a, setA] = useState(1); const [b, setB] = useState(-5); const [c, setC] = useState(6);
  const A = a === 0 ? 1 : a;
  const D = b * b - 4 * A * c;
  const r1 = D >= 0 ? (-b + Math.sqrt(D)) / (2 * A) : null;
  const r2 = D >= 0 ? (-b - Math.sqrt(D)) / (2 * A) : null;
  const sx = 34, sy = 15;

  const path = useMemo(() => {
    const pts: string[] = [];
    for (let px = 0; px <= W; px += 2) {
      const x = (px - W / 2) / sx;
      const y = A * x * x + b * x + c;
      const py = H / 2 - y * sy;
      if (py > -500 && py < H + 500) pts.push(`${px},${py.toFixed(1)}`);
    }
    return pts.join(" ");
  }, [A, b, c]);

  const vx = -b / (2 * A), vy = A * vx * vx + b * vx + c;

  return (
    <SimFrame title="The discriminant decides everything" onReset={() => { setA(1); setB(-5); setC(6); }}
      caption="D = b² − 4ac. Positive: the parabola cuts the axis twice. Zero: it just touches. Negative: it misses entirely.">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" style={{ maxHeight: 340 }}>
        <Grid sx={sx} sy={sy} ymax={12} />
        <polyline points={path} fill="none" stroke="#8b5cf6" strokeWidth={2.6} />
        {[r1, r2].map((r, i) => r === null || !isFinite(r) ? null : (
          <g key={i}>
            <circle cx={W / 2 + r * sx} cy={H / 2} r={6} fill="#f43f5e" />
            <text x={W / 2 + r * sx} y={H / 2 + 24} fontSize={12} textAnchor="middle" fill="#f43f5e" fontWeight={700}>
              {r.toFixed(2).replace(/\.00$/, "")}
            </text>
          </g>
        ))}
        {isFinite(vx) && (
          <circle cx={W / 2 + vx * sx} cy={H / 2 - vy * sy} r={4} fill="#10b981" />
        )}
      </svg>

      <div className="mb-3 rounded-lg bg-[var(--surface-2)] px-4 py-2 text-center font-serif text-[1.15rem]">
        {lead(A)} {b >= 0 ? "+" : "−"} {Math.abs(b)}x {c >= 0 ? "+" : "−"} {Math.abs(c)} = 0
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="a" value={a} min={-4} max={4} onChange={setA} />
        <Slider label="b" value={b} min={-10} max={10} onChange={setB} />
        <Slider label="c" value={c} min={-10} max={10} onChange={setC} />
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "D = b² − 4ac", v: D.toFixed(0), hi: true },
          { k: "Nature of roots", v: D > 0 ? "Real, distinct" : D === 0 ? "Real, equal" : "No real roots", hi: true },
          { k: "Root 1", v: r1 === null ? "—" : r1.toFixed(3).replace(/0+$/, "").replace(/\.$/, "") },
          { k: "Root 2", v: r2 === null ? "—" : r2.toFixed(3).replace(/0+$/, "").replace(/\.$/, "") },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        {D > 0 && "Two different points of contact with the x-axis — two distinct real roots."}
        {D === 0 && "The vertex sits exactly on the x-axis, so both roots are the same number. This is the case examiners use for 'find k such that the roots are equal'."}
        {D < 0 && "The whole parabola stays on one side of the x-axis. There is no real number that makes the expression zero."}
      </p>
    </SimFrame>
  );
}

/* ============================================================ AP EXPLORER */
export function APExplorer() {
  const [a, setA] = useState(3);
  const [d, setD] = useState(4);
  const [n, setN] = useState(8);
  const terms = Array.from({ length: n }, (_, i) => a + i * d);
  const an = a + (n - 1) * d;
  const Sn = (n / 2) * (2 * a + (n - 1) * d);
  const maxAbs = Math.max(...terms.map(Math.abs), 1);

  return (
    <SimFrame title="Arithmetic progression" onReset={() => { setA(3); setD(4); setN(8); }}
      caption="Every AP is just 'start somewhere, add the same thing each time'. The bars show the terms; the formulas below are only shortcuts for counting them.">
      <div className="mb-4 flex h-40 items-end gap-1.5">
        {terms.map((t, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end">
            <span className="mb-1 font-mono text-[10.5px] font-semibold tabular-nums">{t}</span>
            <div className="w-full rounded-t transition-all"
              style={{
                height: `${(Math.abs(t) / maxAbs) * 100}%`,
                minHeight: 3,
                background: t < 0 ? "#f43f5e" : "#8b5cf6",
                opacity: 0.35 + (i / terms.length) * 0.65,
              }} />
            <span className="mt-1 text-[9.5px] faint">a<sub>{i + 1}</sub></span>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Slider label="First term a" value={a} min={-10} max={20} onChange={setA} />
        <Slider label="Common difference d" value={d} min={-8} max={10} onChange={setD} />
        <Slider label="Number of terms n" value={n} min={3} max={14} onChange={setN} />
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "aₙ = a + (n−1)d", v: `${an}`, hi: true },
          { k: "Sₙ = n/2 [2a+(n−1)d]", v: `${Sn}`, hi: true },
          { k: "Also Sₙ = n/2 (a + aₙ)", v: `${(n / 2) * (a + an)}` },
          { k: "Sequence", v: d > 0 ? "increasing" : d < 0 ? "decreasing" : "constant" },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        Set d to a negative value and watch the bars fall — the terms eventually go below zero. &ldquo;Which term of this
        AP is the first negative one?&rdquo; is a standard question, and it is just solving a + (n−1)d &lt; 0.
      </p>
    </SimFrame>
  );
}

/* ========================================================== FACTOR / HCF LCM */
const primeFactors = (n: number) => {
  const out: number[] = [];
  let x = n;
  for (let p = 2; p * p <= x; p++) while (x % p === 0) { out.push(p); x /= p; }
  if (x > 1) out.push(x);
  return out;
};
const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));

export function FactorHcfLcm() {
  const [m, setM] = useState(96);
  const [n, setN] = useState(404);
  const fm = primeFactors(m), fn = primeFactors(n);
  const h = gcd(m, n), l = (m * n) / h;

  const group = (f: number[]) => {
    const c: Record<number, number> = {};
    f.forEach((p) => (c[p] = (c[p] ?? 0) + 1));
    return Object.entries(c).map(([p, e]) => (e > 1 ? `${p}<sup>${e}</sup>` : p)).join(" × ");
  };

  return (
    <SimFrame title="Prime factorisation, HCF and LCM" onReset={() => { setM(96); setN(404); }}
      caption="The Fundamental Theorem of Arithmetic says every number has exactly one prime factorisation. HCF and LCM are just read off it.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="First number" value={m} min={2} max={500} onChange={setM} />
        <Slider label="Second number" value={n} min={2} max={500} onChange={setN} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {[{ v: m, f: fm }, { v: n, f: fn }].map((x, i) => (
          <div key={i} className="rounded-xl border hairline px-4 py-3">
            <div className="text-[11px] font-bold uppercase tracking-wider faint">{x.v}</div>
            <div className="mt-1 font-mono text-[1.05rem]" dangerouslySetInnerHTML={{ __html: group(x.f) }} />
            <div className="mt-1 text-[11.5px] faint">
              {x.f.length === 1 ? "prime" : `${x.f.length} prime factors`}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <Readout items={[
          { k: "HCF", v: String(h), hi: true },
          { k: "LCM", v: String(l), hi: true },
          { k: "HCF × LCM", v: String(h * l) },
          { k: "m × n", v: String(m * n) },
        ]} />
      </div>
      <div className="mt-3">
        <Verdict ok={h * l === m * n}>
          HCF × LCM = {h * l} and m × n = {m * n}. The identity <strong>HCF(m,n) × LCM(m,n) = m × n</strong> holds
          — and it only ever holds for <em>two</em> numbers, never three.
        </Verdict>
      </div>
    </SimFrame>
  );
}
