"use client";
import React, { useMemo, useRef, useState } from "react";
import { SimFrame, Slider, Choice, Readout, useDrag } from "./shell";

/* ---------------------------------------------------------------- helpers */
const AX = 170;           // principal axis (svg y)
const VB = { w: 760, h: 320 };
const XMIN = -72, XMAX = 36;
const S = 700 / (XMAX - XMIN);
const px = (rx: number) => 30 + (rx - XMIN) * S;
const py = (ry: number) => AX - ry * S;
const clampY = (v: number) => Math.max(-24, Math.min(24, v));

function Arrow({ x, y0, y1, color, dashed }: { x: number; y0: number; y1: number; color: string; dashed?: boolean }) {
  const up = y1 < y0;
  return (
    <g stroke={color} fill={color} strokeWidth={2.5} strokeDasharray={dashed ? "5 4" : undefined}>
      <line x1={x} y1={y0} x2={x} y2={y1} strokeLinecap="round" />
      <polygon points={`${x},${y1} ${x - 5},${y1 + (up ? 9 : -9)} ${x + 5},${y1 + (up ? 9 : -9)}`} stroke="none" />
    </g>
  );
}

function Ray({ from, to, color, dashed, arrow = true }: { from: [number, number]; to: [number, number]; color: string; dashed?: boolean; arrow?: boolean }) {
  const mx = (from[0] + to[0]) / 2, my = (from[1] + to[1]) / 2;
  const ang = (Math.atan2(to[1] - from[1], to[0] - from[0]) * 180) / Math.PI;
  return (
    <g>
      <line x1={from[0]} y1={from[1]} x2={to[0]} y2={to[1]} stroke={color} strokeWidth={1.8} strokeDasharray={dashed ? "5 4" : undefined} opacity={dashed ? 0.55 : 1} />
      {arrow && !dashed && (
        <polygon points="0,-3.5 8,0 0,3.5" fill={color} transform={`translate(${mx},${my}) rotate(${ang})`} />
      )}
    </g>
  );
}

/** Extend from point p along unit dir by length L */
const ext = (p: [number, number], d: [number, number], L: number): [number, number] => [p[0] + d[0] * L, p[1] + d[1] * L];
function unit(a: [number, number], b: [number, number]): [number, number] {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const m = Math.hypot(dx, dy) || 1;
  return [dx / m, dy / m];
}

/* =========================================================== MIRROR RAYS */
export function MirrorRay() {
  const [concave, setConcave] = useState(true);
  const [F, setF] = useState(12);          // focal length magnitude, cm
  const [d, setD] = useState(30);          // object distance, cm (positive number)
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useDrag(svgRef);
  const h = 11;                            // object height cm

  const f = concave ? -F : F;
  const u = -d;
  const invV = 1 / f - 1 / u;
  const v = Math.abs(invV) < 1e-6 ? Infinity : 1 / invV;
  const m = -v / u;
  const hi = m * h;
  const real = v < 0 && isFinite(v);
  const finite = isFinite(v) && Math.abs(v) < 400;

  const reset = () => { setConcave(true); setF(12); setD(30); };

  // geometry
  const objTop: [number, number] = [px(u), py(h)];
  const P: [number, number] = [px(0), py(0)];
  const hitA: [number, number] = [px(0), py(h)];       // parallel ray hits mirror
  const imgPt: [number, number] = [px(finite ? v : XMIN), py(finite ? clampY(hi) : 0)];

  const rays = useMemo(() => {
    if (!finite) return null;
    const mk = (hit: [number, number]) => {
      let dir = unit(hit, imgPt);
      if (!real) dir = [-dir[0], -dir[1]];            // virtual: real ray travels away
      return { hit, solid: ext(hit, dir, 260), dashed: !real ? imgPt : null };
    };
    return [mk(hitA), mk(P)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, F, concave]);

  const mirrorPath = concave
    ? `M ${px(0) - 22} ${AX - 92} Q ${px(0) + 26} ${AX} ${px(0) - 22} ${AX + 92}`
    : `M ${px(0) + 22} ${AX - 92} Q ${px(0) - 26} ${AX} ${px(0) + 22} ${AX + 92}`;

  const nature = !finite
    ? "No image forms — the reflected rays come out parallel (object is at the focus)."
    : real
      ? `Real, inverted, ${Math.abs(m) > 1.02 ? "magnified" : Math.abs(m) < 0.98 ? "diminished" : "same size"} — catch it on a screen.`
      : `Virtual, erect, ${Math.abs(m) > 1.02 ? "magnified" : "diminished"} — only seen by looking into the mirror.`;

  return (
    <SimFrame title="Spherical mirror ray tracer" onReset={reset}
      caption="Drag the orange object arrow. Watch how the image flips the instant the object crosses the focus F.">
      <svg ref={svgRef} viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full touch-none select-none" style={{ maxHeight: 340 }}>
        {/* principal axis */}
        <line x1={20} y1={AX} x2={740} y2={AX} stroke="currentColor" strokeWidth={1} opacity={0.22} />
        {/* mirror */}
        <path d={mirrorPath} fill="none" stroke="#64748b" strokeWidth={5} strokeLinecap="round" />
        <path d={mirrorPath} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round" transform={`translate(${concave ? 5 : -5},0)`} opacity={0.5} />

        {/* F and C */}
        {[{ x: f, l: "F" }, { x: 2 * f, l: "C" }].map((p) => (
          <g key={p.l}>
            <circle cx={px(p.x)} cy={AX} r={3} fill="#94a3b8" />
            <text x={px(p.x)} y={AX + 18} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.6}>{p.l}</text>
          </g>
        ))}
        <text x={px(0)} y={AX + 18} textAnchor="middle" fontSize={12} fill="currentColor" opacity={0.6}>P</text>

        {/* rays */}
        {rays?.map((r, i) => (
          <g key={i}>
            <Ray from={objTop} to={r.hit} color="#f97316" />
            <Ray from={r.hit} to={r.solid} color="#f97316" />
            {r.dashed && <Ray from={r.hit} to={r.dashed} color="#f97316" dashed arrow={false} />}
          </g>
        ))}

        {/* image */}
        {finite && (
          <>
            <Arrow x={px(v)} y0={AX} y1={py(clampY(hi))} color={real ? "#10b981" : "#10b981"} dashed={!real} />
            <text x={px(v)} y={py(clampY(hi)) + (hi > 0 ? -12 : 20)} textAnchor="middle" fontSize={11} fill="#10b981" fontWeight={600}>
              image
            </text>
          </>
        )}

        {/* object (draggable) */}
        <g onPointerDown={(e) => drag(e, (x) => {
          const rx = (x - 30) / S + XMIN;
          setD(Math.min(68, Math.max(2, -rx)));
        })} style={{ cursor: "ew-resize" }}>
          <rect x={px(u) - 16} y={py(h) - 12} width={32} height={h * S + 24} fill="transparent" />
          <Arrow x={px(u)} y0={AX} y1={py(h)} color="#f97316" />
          <circle cx={px(u)} cy={py(h)} r={7} fill="#f97316" opacity={0.25} />
          <text x={px(u)} y={py(h) - 14} textAnchor="middle" fontSize={11} fill="#f97316" fontWeight={600}>drag</text>
        </g>
      </svg>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Choice label="Mirror" value={concave ? "cc" : "cx"} onChange={(v) => setConcave(v === "cc")}
          options={[{ v: "cc", l: "Concave" }, { v: "cx", l: "Convex" }]} />
        <Slider label="Focal length f" value={F} min={6} max={26} onChange={setF} unit=" cm" />
      </div>
      <div className="mt-3">
        <Slider label="Object distance u" value={d} min={2} max={68} onChange={setD} unit=" cm" />
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "u", v: `${u.toFixed(0)} cm` },
          { k: "f", v: `${f.toFixed(0)} cm` },
          { k: "v", v: finite ? `${v.toFixed(1)} cm` : "∞", hi: true },
          { k: "m", v: finite ? m.toFixed(2) : "—", hi: true },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">{nature}</p>
    </SimFrame>
  );
}

/* ============================================================= LENS RAYS */
export function LensRay() {
  const [convex, setConvex] = useState(true);
  const [F, setF] = useState(15);
  const [d, setD] = useState(35);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useDrag(svgRef);
  const h = 11;

  const f = convex ? F : -F;
  const u = -d;
  const invV = 1 / f + 1 / u;
  const v = Math.abs(invV) < 1e-6 ? Infinity : 1 / invV;
  const m = v / u;
  const hi = m * h;
  const real = v > 0 && isFinite(v);
  const finite = isFinite(v) && Math.abs(v) < 400;
  const P_dioptre = 100 / f;

  const reset = () => { setConvex(true); setF(15); setD(35); };

  const objTop: [number, number] = [px(u), py(h)];
  const O: [number, number] = [px(0), py(0)];
  const hitA: [number, number] = [px(0), py(h)];
  const imgPt: [number, number] = [px(finite ? v : XMAX), py(finite ? clampY(hi) : 0)];

  const rays = finite ? [hitA, O].map((hit) => {
    let dir = unit(hit, imgPt);
    if (!real) dir = [-dir[0], -dir[1]];
    return { hit, solid: ext(hit, dir, 300), dashed: !real ? imgPt : null };
  }) : null;

  const lensPath = convex
    ? `M ${px(0)} ${AX - 95} Q ${px(0) + 20} ${AX} ${px(0)} ${AX + 95} Q ${px(0) - 20} ${AX} ${px(0)} ${AX - 95}`
    : `M ${px(0) - 13} ${AX - 95} Q ${px(0) + 7} ${AX} ${px(0) - 13} ${AX + 95} L ${px(0) + 13} ${AX + 95} Q ${px(0) - 7} ${AX} ${px(0) + 13} ${AX - 95} Z`;

  const nature = !finite
    ? "The refracted rays leave parallel — the image is at infinity (object sits at F)."
    : real
      ? `Real, inverted, ${Math.abs(m) > 1.02 ? "magnified" : Math.abs(m) < 0.98 ? "diminished" : "same size"} — forms on the other side of the lens.`
      : `Virtual, erect, ${Math.abs(m) > 1.02 ? "magnified" : "diminished"} — on the same side as the object.`;

  return (
    <SimFrame title="Lens ray tracer" onReset={reset}
      caption="A convex lens can make images bigger, smaller, upright or upside-down. A concave lens only ever does one thing.">
      <svg ref={svgRef} viewBox={`0 0 ${VB.w} ${VB.h}`} className="w-full touch-none select-none" style={{ maxHeight: 340 }}>
        <line x1={20} y1={AX} x2={740} y2={AX} stroke="currentColor" strokeWidth={1} opacity={0.22} />
        <path d={lensPath} fill="#38bdf8" fillOpacity={0.18} stroke="#0ea5e9" strokeWidth={2.5} />

        {[{ x: f, l: "F" }, { x: -f, l: "F′" }, { x: 2 * f, l: "2F" }, { x: -2 * f, l: "2F′" }].map((p) => (
          <g key={p.l}>
            <circle cx={px(p.x)} cy={AX} r={3} fill="#94a3b8" />
            <text x={px(p.x)} y={AX + 18} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.6}>{p.l}</text>
          </g>
        ))}
        <text x={px(0)} y={AX + 18} textAnchor="middle" fontSize={11} fill="currentColor" opacity={0.6}>O</text>

        {rays?.map((r, i) => (
          <g key={i}>
            <Ray from={objTop} to={r.hit} color="#f97316" />
            <Ray from={r.hit} to={r.solid} color="#f97316" />
            {r.dashed && <Ray from={r.hit} to={r.dashed} color="#f97316" dashed arrow={false} />}
          </g>
        ))}

        {finite && (
          <>
            <Arrow x={px(v)} y0={AX} y1={py(clampY(hi))} color="#10b981" dashed={!real} />
            <text x={px(v)} y={py(clampY(hi)) + (hi > 0 ? -12 : 20)} textAnchor="middle" fontSize={11} fill="#10b981" fontWeight={600}>image</text>
          </>
        )}

        <g onPointerDown={(e) => drag(e, (x) => {
          const rx = (x - 30) / S + XMIN;
          setD(Math.min(68, Math.max(3, -rx)));
        })} style={{ cursor: "ew-resize" }}>
          <rect x={px(u) - 16} y={py(h) - 12} width={32} height={h * S + 24} fill="transparent" />
          <Arrow x={px(u)} y0={AX} y1={py(h)} color="#f97316" />
          <circle cx={px(u)} cy={py(h)} r={7} fill="#f97316" opacity={0.25} />
          <text x={px(u)} y={py(h) - 14} textAnchor="middle" fontSize={11} fill="#f97316" fontWeight={600}>drag</text>
        </g>
      </svg>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Choice label="Lens" value={convex ? "cx" : "cc"} onChange={(v) => setConvex(v === "cx")}
          options={[{ v: "cx", l: "Convex (converging)" }, { v: "cc", l: "Concave (diverging)" }]} />
        <Slider label="Focal length f" value={F} min={8} max={30} onChange={setF} unit=" cm" />
      </div>
      <div className="mt-3"><Slider label="Object distance u" value={d} min={3} max={68} onChange={setD} unit=" cm" /></div>
      <div className="mt-3">
        <Readout items={[
          { k: "u", v: `${u.toFixed(0)} cm` },
          { k: "v", v: finite ? `${v.toFixed(1)} cm` : "∞", hi: true },
          { k: "m", v: finite ? m.toFixed(2) : "—", hi: true },
          { k: "Power", v: `${P_dioptre.toFixed(2)} D` },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">{nature}</p>
    </SimFrame>
  );
}

/* ======================================================== REFRACTION SLAB */
const MEDIA = [
  { v: "water", l: "Water", n: 1.33 },
  { v: "glass", l: "Glass", n: 1.5 },
  { v: "diamond", l: "Diamond", n: 2.42 },
];

export function RefractionSlab() {
  const [i, setI] = useState(45);
  const [mi, setMi] = useState("glass");
  const n = MEDIA.find((m) => m.v === mi)!.n;
  const r = (Math.asin(Math.sin((i * Math.PI) / 180) / n) * 180) / Math.PI;
  const critical = (Math.asin(1 / n) * 180) / Math.PI;

  const cx = 380, top = 90, bot = 230, thick = bot - top;
  const iRad = (i * Math.PI) / 180, rRad = (r * Math.PI) / 180;
  // entry point on top face
  const ex = cx, ey = top;
  const inLen = 150;
  const startX = ex - Math.sin(iRad) * inLen, startY = ey - Math.cos(iRad) * inLen;
  const exX = ex + Math.tan(rRad) * thick, exY = bot;
  const outLen = 150;
  const endX = exX + Math.sin(iRad) * outLen, endY = exY + Math.cos(iRad) * outLen;
  const lateral = thick * Math.sin(iRad - rRad) / Math.cos(rRad);

  return (
    <SimFrame title="Refraction through a glass slab" onReset={() => { setI(45); setMi("glass"); }}
      caption="Notice: the ray comes out parallel to how it went in, just shifted sideways. That shift is the lateral displacement.">
      <svg viewBox="0 0 760 340" className="w-full select-none" style={{ maxHeight: 320 }}>
        {/* slab */}
        <rect x={180} y={top} width={400} height={thick} fill="#38bdf8" fillOpacity={0.16} stroke="#0ea5e9" strokeWidth={2} />
        <text x={196} y={top + thick / 2 + 5} fontSize={12} fill="#0ea5e9" fontWeight={600}>
          {MEDIA.find((m) => m.v === mi)!.l} · n = {n}
        </text>
        {/* normals */}
        <line x1={ex} y1={top - 130} x2={ex} y2={top + 40} stroke="currentColor" strokeDasharray="4 4" opacity={0.4} />
        <line x1={exX} y1={bot - 40} x2={exX} y2={bot + 130} stroke="currentColor" strokeDasharray="4 4" opacity={0.4} />
        {/* dashed continuation of original path */}
        <line x1={ex} y1={ey} x2={ex + Math.sin(iRad) * 300} y2={ey + Math.cos(iRad) * 300} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={1.4} opacity={0.6} />

        <Ray from={[startX, startY]} to={[ex, ey]} color="#ef4444" />
        <Ray from={[ex, ey]} to={[exX, exY]} color="#ef4444" />
        <Ray from={[exX, exY]} to={[endX, endY]} color="#ef4444" />

        {/* angle arcs */}
        <path d={`M ${ex} ${ey - 46} A 46 46 0 0 0 ${ex - Math.sin(iRad) * 46} ${ey - Math.cos(iRad) * 46}`} fill="none" stroke="#f59e0b" strokeWidth={1.6} />
        <text x={ex - Math.sin(iRad / 2) * 62} y={ey - Math.cos(iRad / 2) * 62 + 4} fontSize={13} fill="#f59e0b" fontWeight={600} textAnchor="middle">∠i</text>
        <path d={`M ${ex} ${ey + 46} A 46 46 0 0 0 ${ex + Math.sin(rRad) * 46} ${ey + Math.cos(rRad) * 46}`} fill="none" stroke="#10b981" strokeWidth={1.6} />
        <text x={ex + Math.sin(rRad / 2) * 64} y={ey + Math.cos(rRad / 2) * 64 + 4} fontSize={13} fill="#10b981" fontWeight={600} textAnchor="middle">∠r</text>

        {/* lateral shift marker */}
        <line x1={ex + Math.sin(iRad) * (thick / Math.cos(iRad))} y1={bot} x2={exX} y2={bot} stroke="#a855f7" strokeWidth={3} />
      </svg>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label="Angle of incidence i" value={i} min={0} max={80} onChange={setI} unit="°" />
        <Choice label="Medium" value={mi} onChange={setMi} options={MEDIA.map((m) => ({ v: m.v, l: m.l }))} />
      </div>
      <div className="mt-3">
        <Readout items={[
          { k: "∠i", v: `${i}°` },
          { k: "∠r", v: `${r.toFixed(1)}°`, hi: true },
          { k: "sin i / sin r", v: n.toFixed(2), hi: true },
          { k: "Critical angle", v: `${critical.toFixed(1)}°` },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        Going into a denser medium the ray bends <strong>towards</strong> the normal, so ∠r &lt; ∠i. Lateral shift right now: {(lateral / 3).toFixed(1)} units.
      </p>
    </SimFrame>
  );
}

/* ============================================================ EYE DEFECTS */
export function EyeDefects() {
  const [defect, setDefect] = useState<"normal" | "myopia" | "hyper">("myopia");
  const [corrected, setCorrected] = useState(false);

  const retinaX = 470;
  const focusX = defect === "normal" || corrected ? retinaX : defect === "myopia" ? retinaX - 42 : retinaX + 46;
  const info = {
    normal: { t: "Normal eye", d: "Parallel rays from a distant object land exactly on the retina. Far point = infinity, near point = 25 cm.", lens: "" },
    myopia: { t: "Myopia (short-sightedness)", d: "The eyeball is too long or the lens too powerful, so distant rays focus in front of the retina. Distant things look blurred.", lens: "Concave lens (−ve power) spreads the rays out a little first, pushing the focus back onto the retina." },
    hyper: { t: "Hypermetropia (long-sightedness)", d: "The eyeball is too short or the lens too weak, so rays would focus behind the retina. Nearby things look blurred.", lens: "Convex lens (+ve power) converges the rays a little first, pulling the focus forward onto the retina." },
  }[defect];

  return (
    <SimFrame title="Why glasses work" onReset={() => { setDefect("myopia"); setCorrected(false); }}
      caption="The eye's job is to land the image exactly on the retina. A corrective lens simply nudges the focus point back where it belongs.">
      <svg viewBox="0 0 760 300" className="w-full select-none" style={{ maxHeight: 280 }}>
        {/* incoming parallel rays */}
        {[-45, -15, 15, 45].map((off, i) => {
          const y = 150 + off;
          const lensX = 300;
          const eyeLensX = 360;
          const bendY = 150 + off * 0.15;
          return (
            <g key={i}>
              <line x1={40} y1={y} x2={corrected && defect !== "normal" ? lensX : eyeLensX} y2={y} stroke="#f59e0b" strokeWidth={1.8} />
              {corrected && defect !== "normal" && (
                <line x1={lensX} y1={y} x2={eyeLensX} y2={defect === "myopia" ? y + off * 0.12 : y - off * 0.12} stroke="#f59e0b" strokeWidth={1.8} />
              )}
              <line
                x1={eyeLensX}
                y1={corrected && defect !== "normal" ? (defect === "myopia" ? y + off * 0.12 : y - off * 0.12) : y}
                x2={focusX} y2={150} stroke="#f59e0b" strokeWidth={1.8}
              />
              <line x1={focusX} y1={150} x2={focusX + 90} y2={150 - (bendY - 150) * 6 - off * 0.9} stroke="#f59e0b" strokeWidth={1.2} opacity={0.35} />
            </g>
          );
        })}

        {/* eyeball */}
        <ellipse cx={430} cy={150} rx={95} ry={80} fill="#fef3c7" fillOpacity={0.35} stroke="#a16207" strokeWidth={2} />
        {/* eye lens */}
        <ellipse cx={360} cy={150} rx={11} ry={44} fill="#38bdf8" fillOpacity={0.4} stroke="#0284c7" strokeWidth={2} />
        <text x={360} y={218} fontSize={11} textAnchor="middle" fill="currentColor" opacity={0.6}>eye lens</text>
        {/* retina */}
        <path d={`M ${retinaX + 45} 90 A 80 80 0 0 1 ${retinaX + 45} 210`} fill="none" stroke="#dc2626" strokeWidth={4} />
        <text x={retinaX + 62} y={150} fontSize={11} fill="#dc2626" fontWeight={600}>retina</text>

        {/* corrective lens */}
        {corrected && defect !== "normal" && (
          <g>
            {defect === "myopia" ? (
              <path d="M 291 96 Q 306 150 291 204 L 309 204 Q 294 150 309 96 Z" fill="#a855f7" fillOpacity={0.25} stroke="#9333ea" strokeWidth={2} />
            ) : (
              <path d="M 300 96 Q 316 150 300 204 Q 284 150 300 96 Z" fill="#a855f7" fillOpacity={0.25} stroke="#9333ea" strokeWidth={2} />
            )}
            <text x={300} y={228} fontSize={11} textAnchor="middle" fill="#9333ea" fontWeight={600}>
              {defect === "myopia" ? "concave (−D)" : "convex (+D)"}
            </text>
          </g>
        )}

        {/* focus marker */}
        <circle cx={focusX} cy={150} r={6} fill={focusX === retinaX ? "#10b981" : "#dc2626"} />
        <text x={focusX} y={128} fontSize={11} textAnchor="middle" fontWeight={600} fill={focusX === retinaX ? "#10b981" : "#dc2626"}>
          {focusX === retinaX ? "sharp" : "blurred"}
        </text>
      </svg>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <Choice label="Eye" value={defect} onChange={(v) => setDefect(v as typeof defect)}
          options={[{ v: "normal", l: "Normal" }, { v: "myopia", l: "Myopia" }, { v: "hyper", l: "Hypermetropia" }]} />
        <button
          disabled={defect === "normal"}
          onClick={() => setCorrected((c) => !c)}
          className={`rounded-full px-4 py-1.5 text-[12px] font-medium transition disabled:opacity-40 ${corrected ? "bg-emerald-500 text-white" : "border hairline hover:bg-[var(--surface-2)]"}`}
        >
          {corrected ? "Glasses on" : "Put glasses on"}
        </button>
      </div>
      <div className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-3">
        <div className="text-[13px] font-semibold">{info.t}</div>
        <p className="mt-1 text-[0.88rem] muted">{info.d}</p>
        {info.lens && <p className="mt-1.5 text-[0.88rem] text-[var(--accent)]">{info.lens}</p>}
      </div>
    </SimFrame>
  );
}

/* ======================================================= PRISM DISPERSION */
const SPECTRUM = [
  { c: "#8b00ff", n: 1.532, l: "Violet" },
  { c: "#4b0082", n: 1.528, l: "Indigo" },
  { c: "#0000ff", n: 1.525, l: "Blue" },
  { c: "#00b400", n: 1.519, l: "Green" },
  { c: "#ffd400", n: 1.517, l: "Yellow" },
  { c: "#ff7f00", n: 1.514, l: "Orange" },
  { c: "#ff0000", n: 1.513, l: "Red" },
];

export function PrismDispersion() {
  const [i, setI] = useState(48);
  const A = 60;
  const apex: [number, number] = [330, 90];
  const bl: [number, number] = [250, 226];
  const br: [number, number] = [410, 226];

  const entry: [number, number] = [292, 155];
  const iRad = (i * Math.PI) / 180;

  return (
    <SimFrame title="A prism splits white light" onReset={() => setI(48)}
      caption="Every colour has a slightly different speed inside glass, so every colour bends by a slightly different amount. Violet bends most, red least.">
      <svg viewBox="0 0 760 320" className="w-full select-none" style={{ maxHeight: 300 }}>
        <polygon points={`${apex[0]},${apex[1]} ${bl[0]},${bl[1]} ${br[0]},${br[1]}`} fill="#bae6fd" fillOpacity={0.3} stroke="#0ea5e9" strokeWidth={2} />
        <text x={330} y={112} fontSize={12} textAnchor="middle" fill="#0284c7" fontWeight={600}>A = {A}°</text>

        {/* incident white ray */}
        <line x1={entry[0] - 190} y1={entry[1] - 190 * Math.tan(iRad - 0.5)} x2={entry[0]} y2={entry[1]} stroke="#e5e7eb" strokeWidth={5} />
        <line x1={entry[0] - 190} y1={entry[1] - 190 * Math.tan(iRad - 0.5)} x2={entry[0]} y2={entry[1]} stroke="#9ca3af" strokeWidth={1.5} />
        <text x={entry[0] - 150} y={entry[1] - 190 * Math.tan(iRad - 0.5) + 4} fontSize={12} fill="currentColor" opacity={0.7}>white light</text>

        {/* inside + emergent spectrum */}
        {SPECTRUM.map((s, k) => {
          const spread = (s.n - 1.513) * 400;
          const exit: [number, number] = [372 + k * 0.6, 176 + k * 1.1];
          const outAng = 0.10 + spread * 0.9 + (i - 48) * 0.004;
          return (
            <g key={s.l}>
              <line x1={entry[0]} y1={entry[1]} x2={exit[0]} y2={exit[1]} stroke={s.c} strokeWidth={2} opacity={0.85} />
              <line x1={exit[0]} y1={exit[1]} x2={exit[0] + 300} y2={exit[1] + 300 * outAng} stroke={s.c} strokeWidth={2.4} />
              <text x={exit[0] + 306} y={exit[1] + 300 * outAng + 4} fontSize={11} fill={s.c} fontWeight={600}>{s.l}</text>
            </g>
          );
        })}
      </svg>
      <Slider label="Angle of incidence on the first face" value={i} min={35} max={65} onChange={setI} unit="°" />
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        Band order to remember: <strong>VIBGYOR</strong> — Violet bends the most (highest refractive index), Red the least.
        A second, inverted prism recombines them back into white light — Newton&apos;s famous experiment.
      </p>
    </SimFrame>
  );
}

/* ============================================================= SCATTERING */
export function Scattering() {
  const [alt, setAlt] = useState(70);            // sun altitude in degrees
  const pathLen = 1 / Math.max(0.12, Math.sin((alt * Math.PI) / 180));
  const t = Math.min(1, (pathLen - 1) / 5.5);
  const skyTop = `rgb(${Math.round(70 + t * 60)}, ${Math.round(130 - t * 60)}, ${Math.round(220 - t * 110)})`;
  const skyBot = `rgb(${Math.round(160 + t * 90)}, ${Math.round(200 - t * 90)}, ${Math.round(245 - t * 175)})`;
  const sunColor = `rgb(255, ${Math.round(240 - t * 130)}, ${Math.round(190 - t * 175)})`;
  const sunX = 120 + (1 - alt / 90) * 480;
  const sunY = 210 - Math.sin((alt * Math.PI) / 180) * 150;

  return (
    <SimFrame title="Why the sky changes colour" onReset={() => setAlt(70)}
      caption="Blue light scatters ~16× more than red. When sunlight has to travel further through the air, the blue is scattered away before it reaches you.">
      <svg viewBox="0 0 760 300" className="w-full select-none" style={{ maxHeight: 280 }}>
        <defs>
          <linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop} />
            <stop offset="100%" stopColor={skyBot} />
          </linearGradient>
        </defs>
        <rect x={0} y={0} width={760} height={230} fill="url(#skyg)" rx={12} />
        <rect x={0} y={230} width={760} height={70} fill="#2f3e2f" rx={12} />
        <circle cx={sunX} cy={sunY} r={26} fill={sunColor} />
        <circle cx={sunX} cy={sunY} r={40} fill={sunColor} opacity={0.25} />
        {/* atmosphere path */}
        <line x1={sunX} y1={sunY} x2={640} y2={228} stroke="#ffffff" strokeWidth={2} strokeDasharray="6 5" opacity={0.55} />
        <text x={(sunX + 640) / 2} y={(sunY + 228) / 2 - 8} fontSize={12} fill="#fff" opacity={0.85} textAnchor="middle">
          air path ≈ {pathLen.toFixed(1)}×
        </text>
        {/* observer */}
        <circle cx={648} cy={214} r={9} fill="#111827" />
        <rect x={642} y={222} width={12} height={16} rx={3} fill="#111827" />
      </svg>
      <Slider label="Sun's height above the horizon" value={alt} min={4} max={90} onChange={setAlt} unit="°" />
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        {alt > 45
          ? "Sun overhead: short path through the atmosphere. Blue is scattered in all directions — so the whole sky looks blue."
          : alt > 18
            ? "Sun getting lower: the path is longer, more blue is being scattered out, and the sun starts turning yellow."
            : "Sun at the horizon: the path is longest. Nearly all the blue and green has been scattered away, so what reaches you is red-orange."}
      </p>
    </SimFrame>
  );
}
