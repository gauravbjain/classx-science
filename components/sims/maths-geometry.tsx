"use client";
import React, { useRef, useState } from "react";
import { SimFrame, Slider, Choice, Readout, Verdict, useDrag } from "./shell";

const r2 = (x: number) => Math.round(x * 100) / 100;

/* ================================================= SIMILAR TRIANGLES / BPT */
export function SimilarTriangles() {
  const [k, setK] = useState(0.45);          // where DE sits along AB, as a fraction from A
  const A = { x: 320, y: 40 }, B = { x: 110, y: 300 }, C = { x: 540, y: 300 };
  const D = { x: A.x + (B.x - A.x) * k, y: A.y + (B.y - A.y) * k };
  const E = { x: A.x + (C.x - A.x) * k, y: A.y + (C.y - A.y) * k };

  const len = (p: { x: number; y: number }, q: { x: number; y: number }) => Math.hypot(q.x - p.x, q.y - p.y);
  const AD = len(A, D), DB = len(D, B), AE = len(A, E), EC = len(E, C);
  const ratio1 = AD / DB, ratio2 = AE / EC;

  return (
    <SimFrame title="Basic Proportionality Theorem (Thales)" onReset={() => setK(0.45)}
      caption="Slide the parallel line anywhere you like. The two ratios stay equal — that is the whole theorem, and it is one you must be able to prove.">
      <svg viewBox="0 0 640 360" className="w-full select-none" style={{ maxHeight: 340 }}>
        <polygon points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`} fill="#10b981" fillOpacity={0.08} stroke="#10b981" strokeWidth={2.5} />
        <line x1={D.x} y1={D.y} x2={E.x} y2={E.y} stroke="#f59e0b" strokeWidth={3} />
        {/* parallel ticks */}
        {[[D, E], [B, C]].map(([p, q], i) => {
          const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
          return <g key={i}>
            <line x1={mx - 5} y1={my - 7} x2={mx + 3} y2={my + 7} stroke="#f59e0b" strokeWidth={2} />
            <line x1={mx + 3} y1={my - 7} x2={mx + 11} y2={my + 7} stroke="#f59e0b" strokeWidth={2} />
          </g>;
        })}
        {[[A, "A", -8, -12], [B, "B", -18, 20], [C, "C", 12, 20], [D, "D", -22, 4], [E, "E", 12, 4]].map(([p, l, dx, dy], i) => {
          const pt = p as { x: number; y: number };
          return <g key={i}>
            <circle cx={pt.x} cy={pt.y} r={4.5} fill="#065f46" />
            <text x={pt.x + (dx as number)} y={pt.y + (dy as number)} fontSize={14} fontWeight={700} fill="currentColor">{l as string}</text>
          </g>;
        })}
        <text x={330} y={340} fontSize={12} textAnchor="middle" fill="#f59e0b" fontWeight={600}>DE ∥ BC</text>
      </svg>

      <Slider label="Position of DE along AB" value={k} min={0.12} max={0.85} step={0.01} onChange={setK} fmt={(v) => `${Math.round(v * 100)}%`} />
      <div className="mt-3">
        <Readout items={[
          { k: "AD / DB", v: r2(ratio1).toFixed(2), hi: true },
          { k: "AE / EC", v: r2(ratio2).toFixed(2), hi: true },
          { k: "AD : AB", v: `${r2(AD / (AD + DB)).toFixed(2)}` },
          { k: "△ADE ~ △ABC", v: "always" },
        ]} />
      </div>
      <div className="mt-3">
        <Verdict ok={Math.abs(ratio1 - ratio2) < 0.01}>
          <strong>AD/DB = AE/EC.</strong> A line drawn parallel to one side of a triangle divides the other two sides
          in the same ratio. The converse is also true and equally examinable: if the ratios are equal, the line
          <em> must</em> be parallel.
        </Verdict>
      </div>
    </SimFrame>
  );
}

/* =========================================================== COORDINATE PLANE */
export function CoordinatePlane() {
  const [P, setP] = useState({ x: -3, y: 2 });
  const [Q, setQ] = useState({ x: 4, y: -3 });
  const [m, setM] = useState(2), [n, setN] = useState(3);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useDrag(svgRef);

  const W = 640, H = 400, sx = 34, sy = 34, ox = W / 2, oy = H / 2;
  const px = (x: number) => ox + x * sx, py = (y: number) => oy - y * sy;

  const dist = Math.hypot(Q.x - P.x, Q.y - P.y);
  const mid = { x: (P.x + Q.x) / 2, y: (P.y + Q.y) / 2 };
  const sec = { x: (m * Q.x + n * P.x) / (m + n), y: (m * Q.y + n * P.y) / (m + n) };

  const snap = (v: number) => Math.max(-8, Math.min(8, Math.round(v)));

  return (
    <SimFrame title="Distance, midpoint and section formula" onReset={() => { setP({ x: -3, y: 2 }); setQ({ x: 4, y: -3 }); setM(2); setN(3); }}
      caption="Drag P and Q. The distance formula is just Pythagoras; the section formula is a weighted average — heavier weight pulls the point closer.">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none" style={{ maxHeight: 380 }}>
        {Array.from({ length: 17 }).map((_, i) => {
          const v = i - 8;
          return <g key={i}>
            <line x1={px(v)} y1={0} x2={px(v)} y2={H} stroke="currentColor" strokeWidth={v === 0 ? 1.6 : 0.6} opacity={v === 0 ? 0.5 : 0.12} />
            <line x1={0} y1={py(v * (sy / sx) * (sx / sy))} x2={W} y2={py(v)} stroke="currentColor" strokeWidth={v === 0 ? 1.6 : 0.6} opacity={v === 0 ? 0.5 : 0.12} />
          </g>;
        })}
        {/* right triangle showing pythagoras */}
        <polyline points={`${px(P.x)},${py(P.y)} ${px(Q.x)},${py(P.y)} ${px(Q.x)},${py(Q.y)}`}
          fill="none" stroke="#06b6d4" strokeWidth={1.8} strokeDasharray="5 4" />
        <text x={(px(P.x) + px(Q.x)) / 2} y={py(P.y) - 8} fontSize={11.5} textAnchor="middle" fill="#06b6d4">
          |x₂−x₁| = {Math.abs(Q.x - P.x)}
        </text>
        <text x={px(Q.x) + 8} y={(py(P.y) + py(Q.y)) / 2} fontSize={11.5} fill="#06b6d4">
          |y₂−y₁| = {Math.abs(Q.y - P.y)}
        </text>

        <line x1={px(P.x)} y1={py(P.y)} x2={px(Q.x)} y2={py(Q.y)} stroke="#8b5cf6" strokeWidth={2.6} />

        <circle cx={px(mid.x)} cy={py(mid.y)} r={5} fill="#10b981" />
        <text x={px(mid.x) + 9} y={py(mid.y) + 16} fontSize={11} fill="#10b981" fontWeight={600}>midpoint</text>
        <circle cx={px(sec.x)} cy={py(sec.y)} r={6} fill="#f59e0b" />
        <text x={px(sec.x) + 9} y={py(sec.y) - 10} fontSize={11} fill="#f59e0b" fontWeight={700}>{m}:{n}</text>

        {[{ p: P, set: setP, l: "P", c: "#7c3aed" }, { p: Q, set: setQ, l: "Q", c: "#7c3aed" }].map((o, i) => (
          <g key={i} style={{ cursor: "grab" }}
            onPointerDown={(e) => drag(e, (X, Y) => o.set({ x: snap((X - ox) / sx), y: snap((oy - Y) / sy) }))}>
            <circle cx={px(o.p.x)} cy={py(o.p.y)} r={16} fill={o.c} opacity={0.13} />
            <circle cx={px(o.p.x)} cy={py(o.p.y)} r={7} fill={o.c} />
            <text x={px(o.p.x) + 12} y={py(o.p.y) - 12} fontSize={13} fontWeight={700} fill={o.c}>
              {o.l}({o.p.x}, {o.p.y})
            </text>
          </g>
        ))}
      </svg>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Ratio m" value={m} min={1} max={6} onChange={setM} />
        <Slider label="Ratio n" value={n} min={1} max={6} onChange={setN} />
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "Distance PQ", v: `${r2(dist).toFixed(2)}`, hi: true },
          { k: "Midpoint", v: `(${r2(mid.x)}, ${r2(mid.y)})` },
          { k: `Point dividing ${m}:${n}`, v: `(${r2(sec.x)}, ${r2(sec.y)})`, hi: true },
          { k: "Δx, Δy", v: `${Q.x - P.x}, ${Q.y - P.y}` },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        Distance = √[(x₂−x₁)² + (y₂−y₁)²] — the dashed right triangle is why. Section formula:
        ((mx₂+nx₁)/(m+n), (my₂+ny₁)/(m+n)). Set m = n and the orange point lands exactly on the green midpoint.
      </p>
    </SimFrame>
  );
}

/* ============================================================= TRIG RATIOS */
export function TrigRatios() {
  const [deg, setDeg] = useState(30);
  const rad = (deg * Math.PI) / 180;
  const adj = 300, opp = adj * Math.tan(rad), hyp = Math.hypot(adj, opp);
  const scale = Math.min(1, 240 / Math.max(opp, 1));
  const a = adj * scale, o = opp * scale, h = hyp * scale;

  const Ox = 120, Oy = 310;
  const exact: Record<number, string[]> = {
    0: ["0", "1", "0"], 30: ["1/2", "√3/2", "1/√3"], 45: ["1/√2", "1/√2", "1"],
    60: ["√3/2", "1/2", "√3"], 90: ["1", "0", "not defined"],
  };
  const ex = exact[deg];

  return (
    <SimFrame title="What the trigonometric ratios actually are" onReset={() => setDeg(30)}
      caption="Nothing more than three fractions of the sides of a right triangle. Change the angle and watch which fraction grows.">
      <svg viewBox="0 0 640 360" className="w-full select-none" style={{ maxHeight: 340 }}>
        <polygon points={`${Ox},${Oy} ${Ox + a},${Oy} ${Ox + a},${Oy - o}`} fill="#f59e0b" fillOpacity={0.1} stroke="#f59e0b" strokeWidth={2.5} />
        {/* right angle box */}
        <polyline points={`${Ox + a - 16},${Oy} ${Ox + a - 16},${Oy - 16} ${Ox + a},${Oy - 16}`} fill="none" stroke="#f59e0b" strokeWidth={1.8} />
        {/* angle arc */}
        <path d={`M ${Ox + 52} ${Oy} A 52 52 0 0 0 ${Ox + 52 * Math.cos(rad)} ${Oy - 52 * Math.sin(rad)}`} fill="none" stroke="#8b5cf6" strokeWidth={2} />
        <text x={Ox + 66} y={Oy - 16} fontSize={15} fill="#8b5cf6" fontWeight={700}>θ = {deg}°</text>

        <text x={Ox + a / 2} y={Oy + 24} fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75}>
          adjacent (base) = {r2(adj)}
        </text>
        <text x={Ox + a + 12} y={Oy - o / 2} fontSize={13} fill="currentColor" opacity={0.75}>
          opposite = {r2(opp)}
        </text>
        <text x={Ox + a / 2 - 70} y={Oy - o / 2 - 12} fontSize={13} fill="currentColor" opacity={0.75}
          transform={`rotate(${-(Math.atan2(o, a) * 180) / Math.PI} ${Ox + a / 2 - 70} ${Oy - o / 2 - 12})`}>
          hypotenuse = {r2(hyp)}
        </text>
      </svg>

      <Slider label="Angle θ" value={deg} min={5} max={85} onChange={setDeg} unit="°" />
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[30, 45, 60].map((d) => (
          <button key={d} onClick={() => setDeg(d)}
            className="rounded-full border hairline px-3 py-1 text-[12px] font-medium transition hover:bg-[var(--surface-2)]">
            {d}°
          </button>
        ))}
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "sin θ = opp/hyp", v: `${(opp / hyp).toFixed(4)}${ex ? ` = ${ex[0]}` : ""}`, hi: true },
          { k: "cos θ = adj/hyp", v: `${(adj / hyp).toFixed(4)}${ex ? ` = ${ex[1]}` : ""}`, hi: true },
          { k: "tan θ = opp/adj", v: `${Math.tan(rad).toFixed(4)}${ex ? ` = ${ex[2]}` : ""}`, hi: true },
          { k: "sin²θ + cos²θ", v: `${((opp / hyp) ** 2 + (adj / hyp) ** 2).toFixed(4)}` },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        sin²θ + cos²θ always comes to exactly 1, whatever angle you choose — that is the identity, and it is
        Pythagoras in disguise. As θ grows, sin rises to 1 and cos falls to 0, which is why tan runs away to infinity.
      </p>
    </SimFrame>
  );
}

/* ====================================================== HEIGHTS & DISTANCES */
export function HeightsDistances() {
  const [d, setD] = useState(30);
  const [deg, setDeg] = useState(45);
  const rad = (deg * Math.PI) / 180;
  const h = d * Math.tan(rad);

  const scale = Math.min(420 / Math.max(d, 1), 220 / Math.max(h, 1));
  const Ox = 90, Oy = 300;
  const tx = Ox + d * scale, ty = Oy - h * scale;

  return (
    <SimFrame title="Heights and distances" onReset={() => { setD(30); setDeg(45); }}
      caption="Every word problem in this chapter reduces to one picture: a right triangle where you know one side and one angle.">
      <svg viewBox="0 0 640 340" className="w-full select-none" style={{ maxHeight: 330 }}>
        <line x1={40} y1={Oy} x2={600} y2={Oy} stroke="#78350f" strokeWidth={3} opacity={0.5} />
        {/* tower */}
        <rect x={tx - 12} y={ty} width={24} height={Oy - ty} fill="#0ea5e9" fillOpacity={0.3} stroke="#0284c7" strokeWidth={2} />
        {/* line of sight */}
        <line x1={Ox} y1={Oy} x2={tx} y2={ty} stroke="#f59e0b" strokeWidth={2.4} strokeDasharray="6 4" />
        {/* angle arc */}
        <path d={`M ${Ox + 46} ${Oy} A 46 46 0 0 0 ${Ox + 46 * Math.cos(rad)} ${Oy - 46 * Math.sin(rad)}`} fill="none" stroke="#8b5cf6" strokeWidth={2} />
        <text x={Ox + 56} y={Oy - 14} fontSize={13} fill="#8b5cf6" fontWeight={700}>{deg}°</text>
        {/* observer */}
        <circle cx={Ox} cy={Oy - 14} r={8} fill="#111827" />
        <rect x={Ox - 6} y={Oy - 6} width={12} height={16} rx={3} fill="#111827" />
        {/* labels */}
        <text x={(Ox + tx) / 2} y={Oy + 22} fontSize={13} textAnchor="middle" fill="currentColor" opacity={0.75}>
          distance = {d} m
        </text>
        <text x={tx + 20} y={(ty + Oy) / 2} fontSize={13} fill="#0284c7" fontWeight={700}>
          h = {r2(h)} m
        </text>
      </svg>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Distance from the tower" value={d} min={5} max={80} onChange={setD} unit=" m" />
        <Slider label="Angle of elevation" value={deg} min={10} max={80} onChange={setDeg} unit="°" />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[30, 45, 60].map((x) => (
          <button key={x} onClick={() => setDeg(x)}
            className="rounded-full border hairline px-3 py-1 text-[12px] font-medium transition hover:bg-[var(--surface-2)]">
            {x}°
          </button>
        ))}
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "tan θ = h / d", v: Math.tan(rad).toFixed(3), hi: true },
          { k: "Height h = d·tan θ", v: `${r2(h)} m`, hi: true },
          { k: "Line of sight", v: `${r2(Math.hypot(d, h))} m` },
          { k: "At 45°", v: "h = d exactly" },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        {deg === 45
          ? "At exactly 45° the height equals the distance — tan 45° = 1. Examiners love this because it needs no calculation."
          : deg < 45
            ? "Below 45° the tower is shorter than your distance from it, because tan θ < 1."
            : "Above 45° the tower is taller than your distance from it, because tan θ > 1."}
        {" "}The board restricts these problems to 30°, 45° and 60°, and to at most two right triangles.
      </p>
    </SimFrame>
  );
}

/* =========================================================== CIRCLE TANGENTS */
export function CircleTangents() {
  const [dist, setDist] = useState(230);
  const R = 90, Cx = 250, Cy = 190;
  const Px = Cx + dist, Py = Cy;
  const L = Math.sqrt(Math.max(dist * dist - R * R, 1));
  const alpha = Math.acos(R / dist);              // angle at centre between CP and radius to touch point
  const T1 = { x: Cx + R * Math.cos(alpha), y: Cy - R * Math.sin(alpha) };
  const T2 = { x: Cx + R * Math.cos(alpha), y: Cy + R * Math.sin(alpha) };
  const angleP = 2 * Math.asin(R / dist) * 180 / Math.PI;

  return (
    <SimFrame title="Two tangents from an external point" onReset={() => setDist(230)}
      caption="Slide the point in and out. The two tangent lengths stay equal — and each one always meets the radius at exactly 90°.">
      <svg viewBox="0 0 640 380" className="w-full select-none" style={{ maxHeight: 360 }}>
        <circle cx={Cx} cy={Cy} r={R} fill="#10b981" fillOpacity={0.07} stroke="#10b981" strokeWidth={2.5} />
        <circle cx={Cx} cy={Cy} r={4} fill="#065f46" />
        <text x={Cx - 8} y={Cy + 20} fontSize={13} fontWeight={700} fill="currentColor">O</text>

        {[T1, T2].map((T, i) => (
          <g key={i}>
            <line x1={Px} y1={Py} x2={T.x} y2={T.y} stroke="#f59e0b" strokeWidth={2.6} />
            <line x1={Cx} y1={Cy} x2={T.x} y2={T.y} stroke="#10b981" strokeWidth={2} strokeDasharray="5 4" />
            {/* right-angle marker at T */}
            <rect x={-7} y={-7} width={14} height={14} fill="none" stroke="#0f766e" strokeWidth={1.8}
              transform={`translate(${T.x},${T.y}) rotate(${(Math.atan2(T.y - Cy, T.x - Cx) * 180) / Math.PI + 45})`} />
            <circle cx={T.x} cy={T.y} r={4.5} fill="#b45309" />
            <text x={T.x - 24} y={T.y + (i === 0 ? -10 : 22)} fontSize={13} fontWeight={700} fill="#b45309">
              {i === 0 ? "A" : "B"}
            </text>
          </g>
        ))}
        <line x1={Cx} y1={Cy} x2={Px} y2={Py} stroke="currentColor" strokeWidth={1.4} opacity={0.4} strokeDasharray="4 4" />
        <circle cx={Px} cy={Py} r={6} fill="#7c3aed" />
        <text x={Px + 12} y={Py + 5} fontSize={13} fontWeight={700} fill="#7c3aed">P</text>
      </svg>

      <Slider label="How far P is from the centre" value={dist} min={R + 18} max={330} onChange={setDist} fmt={(v) => `${r2(v / 10)}`} unit=" units" />
      <div className="mt-3">
        <Readout items={[
          { k: "Radius r", v: `${r2(R / 10)}` },
          { k: "OP", v: `${r2(dist / 10)}` },
          { k: "PA = PB = √(OP²−r²)", v: `${r2(L / 10)}`, hi: true },
          { k: "Angle APB", v: `${r2(angleP)}°`, hi: true },
        ]} />
      </div>
      <div className="mt-3">
        <Verdict ok={true}>
          Both theorems you must be able to <strong>prove</strong> are visible here: the tangent is perpendicular to the
          radius at the point of contact (the small squares at A and B), and the two tangents drawn from an external
          point are equal in length. Notice too that ∠APB + ∠AOB = 180° always.
        </Verdict>
      </div>
    </SimFrame>
  );
}

/* =========================================================== SECTOR & SEGMENT */
export function SectorSegment() {
  const [ang, setAng] = useState(90);
  const [r, setR] = useState(7);
  const rad = (ang * Math.PI) / 180;
  const R = 120, Cx = 320, Cy = 200;

  const areaCircle = Math.PI * r * r;
  const areaSector = (ang / 360) * areaCircle;
  const areaTri = 0.5 * r * r * Math.sin(rad);
  const areaSegment = areaSector - areaTri;
  const arc = (ang / 360) * 2 * Math.PI * r;

  const x1 = Cx + R, y1 = Cy;
  const x2 = Cx + R * Math.cos(rad), y2 = Cy - R * Math.sin(rad);
  const large = ang > 180 ? 1 : 0;

  return (
    <SimFrame title="Sector and segment" onReset={() => { setAng(90); setR(7); }}
      caption="A sector is the pizza slice. A segment is the slice minus the triangle — the curved bit left over.">
      <svg viewBox="0 0 640 380" className="w-full select-none" style={{ maxHeight: 340 }}>
        <circle cx={Cx} cy={Cy} r={R} fill="none" stroke="#0ea5e9" strokeWidth={2.5} opacity={0.5} />
        <path d={`M ${Cx} ${Cy} L ${x1} ${y1} A ${R} ${R} 0 ${large} 0 ${x2} ${y2} Z`}
          fill="#0ea5e9" fillOpacity={0.22} stroke="#0284c7" strokeWidth={2} />
        <path d={`M ${x1} ${y1} A ${R} ${R} 0 ${large} 0 ${x2} ${y2} Z`}
          fill="#f43f5e" fillOpacity={0.35} stroke="#e11d48" strokeWidth={2} />
        <circle cx={Cx} cy={Cy} r={4} fill="#0369a1" />
        <text x={Cx + 26} y={Cy - 12} fontSize={13} fill="#0369a1" fontWeight={700}>{ang}°</text>
        <text x={Cx + R / 2} y={Cy + 20} fontSize={12} fill="#0369a1">r = {r}</text>
        <g transform="translate(480,300)">
          <rect x={0} y={-10} width={14} height={12} fill="#0ea5e9" fillOpacity={0.22} stroke="#0284c7" />
          <text x={20} y={0} fontSize={12} fill="currentColor" opacity={0.75}>sector</text>
          <rect x={0} y={10} width={14} height={12} fill="#f43f5e" fillOpacity={0.35} stroke="#e11d48" />
          <text x={20} y={20} fontSize={12} fill="currentColor" opacity={0.75}>segment</text>
        </g>
      </svg>

      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Central angle θ" value={ang} min={10} max={300} onChange={setAng} unit="°" />
        <Slider label="Radius r" value={r} min={2} max={14} onChange={setR} unit=" cm" />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[60, 90, 120].map((x) => (
          <button key={x} onClick={() => setAng(x)}
            className="rounded-full border hairline px-3 py-1 text-[12px] font-medium transition hover:bg-[var(--surface-2)]">
            {x}°
          </button>
        ))}
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "Area of sector", v: `${r2(areaSector)} cm²`, hi: true },
          { k: "Area of segment", v: `${r2(areaSegment)} cm²`, hi: true },
          { k: "Length of arc", v: `${r2(arc)} cm` },
          { k: "Area of circle", v: `${r2(areaCircle)} cm²` },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        Sector = (θ/360)·πr², arc = (θ/360)·2πr. Segment = sector − triangle, where the triangle&apos;s area is
        ½r²sin θ. The syllabus restricts central angles to 60°, 90° and 120°, so those three are worth knowing cold.
      </p>
    </SimFrame>
  );
}

/* ============================================================ SOLIDS COMBO */
const COMBOS = [
  { v: "icecream", l: "Cone + hemisphere", note: "An ice-cream cone. The flat circular faces join, so neither is part of the surface." },
  { v: "capsule", l: "Cylinder + 2 hemispheres", note: "A capsule or a gas cylinder. Two hemispheres make one whole sphere's curved area." },
  { v: "tent", l: "Cylinder + cone", note: "A circus tent. Canvas covers the curved surfaces only — the floor is not canvas." },
];

export function SolidsCombo() {
  const [kind, setKind] = useState("icecream");
  const [r, setR] = useState(7);
  const [h, setH] = useState(12);
  const l = Math.sqrt(r * r + h * h);
  const P = Math.PI;

  let volume = 0, surface = 0, formulaV = "", formulaS = "";
  if (kind === "icecream") {
    volume = (1 / 3) * P * r * r * h + (2 / 3) * P * r ** 3;
    surface = P * r * l + 2 * P * r * r;
    formulaV = "⅓πr²h + ⅔πr³";
    formulaS = "πrl + 2πr²";
  } else if (kind === "capsule") {
    volume = P * r * r * h + (4 / 3) * P * r ** 3;
    surface = 2 * P * r * h + 4 * P * r * r;
    formulaV = "πr²h + 4/3·πr³";
    formulaS = "2πrh + 4πr²";
  } else {
    volume = P * r * r * h + (1 / 3) * P * r * r * r;
    surface = 2 * P * r * h + P * r * Math.sqrt(r * r + r * r);
    formulaV = "πr²h + ⅓πr²h₍cone₎";
    formulaS = "2πrh + πrl";
  }

  const S = 9, Cx = 320, base = 300;
  const rr = r * S, hh = h * S;

  return (
    <SimFrame title="Combinations of solids" onReset={() => { setKind("icecream"); setR(7); setH(12); }}
      caption="Volumes always add. Surface areas do not — the faces that get glued together disappear, and that is where marks are lost.">
      <svg viewBox="0 0 640 340" className="w-full select-none" style={{ maxHeight: 320 }}>
        {kind === "icecream" && (
          <g>
            <path d={`M ${Cx - rr} ${base - hh} L ${Cx} ${base} L ${Cx + rr} ${base - hh} Z`}
              fill="#0ea5e9" fillOpacity={0.25} stroke="#0284c7" strokeWidth={2} />
            <path d={`M ${Cx - rr} ${base - hh} A ${rr} ${rr} 0 0 1 ${Cx + rr} ${base - hh}`}
              fill="#8b5cf6" fillOpacity={0.3} stroke="#7c3aed" strokeWidth={2} />
            <ellipse cx={Cx} cy={base - hh} rx={rr} ry={rr * 0.22} fill="none" stroke="#7c3aed" strokeWidth={1.4} strokeDasharray="4 3" />
          </g>
        )}
        {kind === "capsule" && (
          <g>
            <rect x={Cx - rr} y={base - hh - rr} width={rr * 2} height={hh} fill="#0ea5e9" fillOpacity={0.25} stroke="#0284c7" strokeWidth={2} />
            <path d={`M ${Cx - rr} ${base - hh - rr} A ${rr} ${rr} 0 0 1 ${Cx + rr} ${base - hh - rr}`} fill="#8b5cf6" fillOpacity={0.3} stroke="#7c3aed" strokeWidth={2} />
            <path d={`M ${Cx - rr} ${base - rr} A ${rr} ${rr} 0 0 0 ${Cx + rr} ${base - rr}`} fill="#8b5cf6" fillOpacity={0.3} stroke="#7c3aed" strokeWidth={2} />
          </g>
        )}
        {kind === "tent" && (
          <g>
            <rect x={Cx - rr} y={base - hh} width={rr * 2} height={hh} fill="#0ea5e9" fillOpacity={0.25} stroke="#0284c7" strokeWidth={2} />
            <path d={`M ${Cx - rr} ${base - hh} L ${Cx} ${base - hh - rr} L ${Cx + rr} ${base - hh} Z`}
              fill="#8b5cf6" fillOpacity={0.3} stroke="#7c3aed" strokeWidth={2} />
            <ellipse cx={Cx} cy={base} rx={rr} ry={rr * 0.22} fill="#0ea5e9" fillOpacity={0.18} stroke="#0284c7" strokeWidth={1.6} />
          </g>
        )}
        <line x1={Cx - rr} y1={base + 22} x2={Cx + rr} y2={base + 22} stroke="currentColor" opacity={0.5} />
        <text x={Cx} y={base + 38} fontSize={12} textAnchor="middle" fill="currentColor" opacity={0.7}>2r = {2 * r} cm</text>
      </svg>

      <Choice label="Shape" value={kind} onChange={setKind} options={COMBOS.map((c) => ({ v: c.v, l: c.l }))} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label="Radius r" value={r} min={2} max={12} onChange={setR} unit=" cm" />
        <Slider label="Height h" value={h} min={4} max={22} onChange={setH} unit=" cm" />
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "Volume", v: `${r2(volume)} cm³`, hi: true },
          { k: "Surface area", v: `${r2(surface)} cm²`, hi: true },
          { k: "Slant height l", v: `${r2(l)} cm` },
          { k: "Formula (V)", v: formulaV },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        {COMBOS.find((c) => c.v === kind)!.note} Surface area here is <strong>{formulaS}</strong> — count only the faces
        you could actually paint.
      </p>
    </SimFrame>
  );
}
