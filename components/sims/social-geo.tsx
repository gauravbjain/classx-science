"use client";
import React, { useMemo, useState } from "react";
import { SimFrame, Choice, Readout, Verdict } from "./shell";
import { Explorer, SortDrill, CompareBars } from "./social-core";

/* ========================================================= INDIA LOCATOR */
type Place = { n: string; st: string; lat: number; lon: number; cat: string };

const CATS = [
  { v: "dams", l: "Dams & projects", hue: "#0ea5e9" },
  { v: "minerals", l: "Minerals & oil", hue: "#78350f" },
  { v: "power", l: "Power plants", hue: "#f59e0b" },
  { v: "steel", l: "Iron & steel", hue: "#475569" },
  { v: "textile", l: "Cotton textile", hue: "#db2777" },
  { v: "software", l: "Software parks", hue: "#7c3aed" },
  { v: "ports", l: "Sea ports", hue: "#0891b2" },
  { v: "airports", l: "Airports", hue: "#dc2626" },
  { v: "crops", l: "Leading crop states", hue: "#16a34a" },
  { v: "history", l: "History map work", hue: "#c2410c" },
];

const PLACES: Place[] = [
  { n: "Salal", st: "Jammu & Kashmir · Chenab", lat: 33.14, lon: 74.81, cat: "dams" },
  { n: "Bhakra Nangal", st: "Punjab–Himachal · Satluj", lat: 31.41, lon: 76.43, cat: "dams" },
  { n: "Tehri", st: "Uttarakhand · Bhagirathi", lat: 30.38, lon: 78.48, cat: "dams" },
  { n: "Rana Pratap Sagar", st: "Rajasthan · Chambal", lat: 24.92, lon: 75.58, cat: "dams" },
  { n: "Sardar Sarovar", st: "Gujarat · Narmada", lat: 21.83, lon: 73.75, cat: "dams" },
  { n: "Hirakud", st: "Odisha · Mahanadi", lat: 21.52, lon: 83.87, cat: "dams" },
  { n: "Nagarjuna Sagar", st: "Telangana–Andhra · Krishna", lat: 16.57, lon: 79.31, cat: "dams" },
  { n: "Tungabhadra", st: "Karnataka · Tungabhadra", lat: 15.26, lon: 76.33, cat: "dams" },

  { n: "Mayurbhanj", st: "Odisha · iron ore", lat: 22.0, lon: 86.4, cat: "minerals" },
  { n: "Durg", st: "Chhattisgarh · iron ore", lat: 21.19, lon: 81.28, cat: "minerals" },
  { n: "Bailadila", st: "Chhattisgarh · iron ore", lat: 18.66, lon: 81.25, cat: "minerals" },
  { n: "Bellary", st: "Karnataka · iron ore", lat: 15.15, lon: 76.92, cat: "minerals" },
  { n: "Kudremukh", st: "Karnataka · iron ore", lat: 13.2, lon: 75.25, cat: "minerals" },
  { n: "Raniganj", st: "West Bengal · coal", lat: 23.62, lon: 87.13, cat: "minerals" },
  { n: "Bokaro", st: "Jharkhand · coal", lat: 23.79, lon: 85.96, cat: "minerals" },
  { n: "Talcher", st: "Odisha · coal", lat: 20.95, lon: 85.23, cat: "minerals" },
  { n: "Neyveli", st: "Tamil Nadu · lignite", lat: 11.6, lon: 79.48, cat: "minerals" },
  { n: "Digboi", st: "Assam · oil", lat: 27.39, lon: 95.62, cat: "minerals" },
  { n: "Naharkatia", st: "Assam · oil", lat: 27.29, lon: 95.34, cat: "minerals" },
  { n: "Mumbai High", st: "Offshore · oil", lat: 19.5, lon: 71.3, cat: "minerals" },
  { n: "Bassein", st: "Offshore · oil", lat: 19.0, lon: 71.9, cat: "minerals" },
  { n: "Kalol", st: "Gujarat · oil", lat: 23.25, lon: 72.5, cat: "minerals" },
  { n: "Ankleshwar", st: "Gujarat · oil", lat: 21.63, lon: 73.0, cat: "minerals" },

  { n: "Namrup", st: "Assam · thermal", lat: 27.19, lon: 95.32, cat: "power" },
  { n: "Singrauli", st: "Uttar Pradesh · thermal", lat: 24.2, lon: 82.67, cat: "power" },
  { n: "Ramagundam", st: "Telangana · thermal", lat: 18.76, lon: 79.47, cat: "power" },
  { n: "Narora", st: "Uttar Pradesh · nuclear", lat: 28.16, lon: 78.4, cat: "power" },
  { n: "Kakrapara", st: "Gujarat · nuclear", lat: 21.24, lon: 73.35, cat: "power" },
  { n: "Tarapur", st: "Maharashtra · nuclear", lat: 19.83, lon: 72.66, cat: "power" },
  { n: "Kalpakkam", st: "Tamil Nadu · nuclear", lat: 12.56, lon: 80.17, cat: "power" },

  { n: "Durgapur", st: "West Bengal", lat: 23.52, lon: 87.31, cat: "steel" },
  { n: "Bokaro Steel", st: "Jharkhand", lat: 23.67, lon: 86.15, cat: "steel" },
  { n: "Jamshedpur", st: "Jharkhand", lat: 22.8, lon: 86.2, cat: "steel" },
  { n: "Bhilai", st: "Chhattisgarh", lat: 21.21, lon: 81.38, cat: "steel" },
  { n: "Vijayanagar", st: "Karnataka", lat: 15.17, lon: 76.65, cat: "steel" },
  { n: "Salem", st: "Tamil Nadu", lat: 11.66, lon: 78.15, cat: "steel" },

  { n: "Mumbai", st: "Maharashtra", lat: 19.08, lon: 72.88, cat: "textile" },
  { n: "Indore", st: "Madhya Pradesh", lat: 22.72, lon: 75.86, cat: "textile" },
  { n: "Surat", st: "Gujarat", lat: 21.17, lon: 72.83, cat: "textile" },
  { n: "Kanpur", st: "Uttar Pradesh", lat: 26.45, lon: 80.33, cat: "textile" },
  { n: "Coimbatore", st: "Tamil Nadu", lat: 11.02, lon: 76.96, cat: "textile" },

  { n: "Noida", st: "Uttar Pradesh", lat: 28.54, lon: 77.39, cat: "software" },
  { n: "Gandhinagar", st: "Gujarat", lat: 23.22, lon: 72.65, cat: "software" },
  { n: "Mumbai STP", st: "Maharashtra", lat: 19.08, lon: 72.88, cat: "software" },
  { n: "Pune", st: "Maharashtra", lat: 18.52, lon: 73.86, cat: "software" },
  { n: "Hyderabad", st: "Telangana", lat: 17.39, lon: 78.49, cat: "software" },
  { n: "Bengaluru", st: "Karnataka", lat: 12.97, lon: 77.59, cat: "software" },
  { n: "Chennai STP", st: "Tamil Nadu", lat: 13.08, lon: 80.27, cat: "software" },
  { n: "Thiruvananthapuram", st: "Kerala", lat: 8.52, lon: 76.94, cat: "software" },

  { n: "Kandla (Deendayal)", st: "Gujarat", lat: 23.03, lon: 70.22, cat: "ports" },
  { n: "Mumbai Port", st: "Maharashtra", lat: 18.94, lon: 72.84, cat: "ports" },
  { n: "Marmagao", st: "Goa", lat: 15.4, lon: 73.8, cat: "ports" },
  { n: "New Mangalore", st: "Karnataka", lat: 12.92, lon: 74.8, cat: "ports" },
  { n: "Kochi", st: "Kerala", lat: 9.97, lon: 76.26, cat: "ports" },
  { n: "Tuticorin", st: "Tamil Nadu", lat: 8.76, lon: 78.13, cat: "ports" },
  { n: "Chennai Port", st: "Tamil Nadu", lat: 13.1, lon: 80.3, cat: "ports" },
  { n: "Visakhapatnam", st: "Andhra Pradesh", lat: 17.69, lon: 83.28, cat: "ports" },
  { n: "Paradip", st: "Odisha", lat: 20.32, lon: 86.61, cat: "ports" },
  { n: "Haldia", st: "West Bengal", lat: 22.06, lon: 88.1, cat: "ports" },

  { n: "Amritsar (Raja Sansi)", st: "Punjab", lat: 31.71, lon: 74.8, cat: "airports" },
  { n: "Delhi (IGI)", st: "Delhi", lat: 28.56, lon: 77.1, cat: "airports" },
  { n: "Mumbai (CSMI)", st: "Maharashtra", lat: 19.09, lon: 72.87, cat: "airports" },
  { n: "Chennai (Meenambakkam)", st: "Tamil Nadu", lat: 12.99, lon: 80.17, cat: "airports" },
  { n: "Kolkata (NSCB)", st: "West Bengal", lat: 22.65, lon: 88.45, cat: "airports" },
  { n: "Hyderabad (Rajiv Gandhi)", st: "Telangana", lat: 17.24, lon: 78.43, cat: "airports" },

  { n: "Rice", st: "West Bengal", lat: 22.7, lon: 87.6, cat: "crops" },
  { n: "Wheat", st: "Uttar Pradesh", lat: 27.4, lon: 80.2, cat: "crops" },
  { n: "Sugarcane", st: "Uttar Pradesh", lat: 26.2, lon: 81.8, cat: "crops" },
  { n: "Tea", st: "Assam", lat: 26.4, lon: 92.9, cat: "crops" },
  { n: "Coffee", st: "Karnataka", lat: 13.4, lon: 75.7, cat: "crops" },
  { n: "Rubber", st: "Kerala", lat: 10.0, lon: 76.6, cat: "crops" },
  { n: "Cotton", st: "Gujarat", lat: 22.3, lon: 71.2, cat: "crops" },
  { n: "Jute", st: "West Bengal", lat: 24.3, lon: 88.3, cat: "crops" },

  { n: "Jallianwala Bagh", st: "Amritsar, 1919", lat: 31.62, lon: 74.88, cat: "history" },
  { n: "Champaran", st: "Bihar · indigo satyagraha", lat: 26.75, lon: 84.75, cat: "history" },
  { n: "Kheda", st: "Gujarat · peasant satyagraha", lat: 22.75, lon: 72.68, cat: "history" },
  { n: "Ahmedabad", st: "Gujarat · mill workers", lat: 23.03, lon: 72.58, cat: "history" },
  { n: "Dandi", st: "Gujarat · salt march 1930", lat: 20.92, lon: 72.71, cat: "history" },
  { n: "Calcutta session", st: "Congress, September 1920", lat: 22.57, lon: 88.36, cat: "history" },
  { n: "Nagpur session", st: "Congress, December 1920", lat: 21.15, lon: 79.09, cat: "history" },
  { n: "Madras session", st: "Congress, 1927", lat: 13.08, lon: 80.27, cat: "history" },
];

/** Coarse schematic outline, for orientation only — not a survey map. */
const OUTLINE: [number, number][] = [
  [34.5, 74.5], [35.3, 77.4], [34.2, 78.9], [32.5, 79.2], [30.4, 81.0], [28.6, 83.8],
  [27.5, 88.2], [27.9, 92.0], [28.3, 95.4], [27.0, 97.3], [24.2, 97.2], [23.2, 93.3],
  [22.0, 92.4], [21.5, 89.5], [21.7, 87.0], [19.0, 85.0], [15.9, 82.3], [13.1, 80.3],
  [9.2, 79.3], [8.1, 77.6], [10.3, 76.0], [13.0, 74.6], [15.5, 73.7], [19.0, 72.7],
  [21.0, 72.6], [22.3, 69.0], [23.7, 68.2], [24.7, 71.0], [27.7, 71.0], [29.5, 73.9],
  [32.0, 74.5],
];

export function IndiaLocator() {
  const [cat, setCat] = useState("dams");
  const [sel, setSel] = useState<Place | null>(null);
  const [mode, setMode] = useState<"explore" | "test">("explore");
  const [target, setTarget] = useState<Place | null>(null);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [feedback, setFeedback] = useState<null | boolean>(null);

  const W = 620, H = 620;
  const LON0 = 67.5, LON1 = 98.5, LAT0 = 6.5, LAT1 = 37.5;
  const px = (lon: number) => ((lon - LON0) / (LON1 - LON0)) * W;
  const py = (lat: number) => H - ((lat - LAT0) / (LAT1 - LAT0)) * H;

  const shown = useMemo(() => PLACES.filter((p) => p.cat === cat), [cat]);
  const hue = CATS.find((c) => c.v === cat)!.hue;

  const nextQuestion = () => {
    setTarget(shown[Math.floor(Math.random() * shown.length)]);
    setFeedback(null);
    setSel(null);
  };
  const startTest = () => { setMode("test"); setScore({ right: 0, total: 0 }); nextQuestion(); };
  const reset = () => { setMode("explore"); setSel(null); setTarget(null); setFeedback(null); setScore({ right: 0, total: 0 }); };

  const clickPlace = (p: Place) => {
    if (mode === "explore") { setSel(p); return; }
    if (feedback !== null) return;
    const ok = p.n === target?.n;
    setFeedback(ok);
    setSel(p);
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
  };

  return (
    <SimFrame title="Map work practice" onReset={reset}
      caption="Everything on the CBSE map list, plotted at its real latitude and longitude. The outline is schematic — it is there for orientation, not for tracing.">
      <div className="flex flex-wrap gap-1.5">
        {CATS.map((c) => (
          <button key={c.v} onClick={() => { setCat(c.v); setSel(null); setTarget(null); setMode("explore"); }}
            className="rounded-full px-2.5 py-1 text-[11.5px] font-medium transition"
            style={cat === c.v
              ? { background: c.hue, color: "#fff" }
              : { border: "1px solid var(--line)", color: "var(--ink-2)" }}>
            {c.l}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full select-none" style={{ maxHeight: 560 }}>
        {[70, 75, 80, 85, 90, 95].map((lon) => (
          <g key={lon}>
            <line x1={px(lon)} y1={0} x2={px(lon)} y2={H} stroke="currentColor" opacity={0.09} />
            <text x={px(lon) + 3} y={H - 5} fontSize={9} fill="currentColor" opacity={0.4}>{lon}°E</text>
          </g>
        ))}
        {[10, 15, 20, 25, 30, 35].map((lat) => (
          <g key={lat}>
            <line x1={0} y1={py(lat)} x2={W} y2={py(lat)} stroke="currentColor" opacity={0.09} />
            <text x={3} y={py(lat) - 3} fontSize={9} fill="currentColor" opacity={0.4}>{lat}°N</text>
          </g>
        ))}
        <polygon points={OUTLINE.map(([la, lo]) => `${px(lo)},${py(la)}`).join(" ")}
          fill="var(--surface-2)" stroke="var(--line-strong)" strokeWidth={1.6} />
        <line x1={0} y1={py(23.5)} x2={W} y2={py(23.5)} stroke="#f59e0b" strokeWidth={1.2} strokeDasharray="7 5" opacity={0.7} />
        <text x={W - 6} y={py(23.5) - 5} fontSize={9.5} textAnchor="end" fill="#b45309">Tropic of Cancer</text>

        {shown.map((p, i) => {
          const isSel = sel?.n === p.n;
          return (
            <g key={i} onClick={() => clickPlace(p)} style={{ cursor: "pointer" }}>
              <circle cx={px(p.lon)} cy={py(p.lat)} r={16} fill={hue} opacity={isSel ? 0.22 : 0} />
              <circle cx={px(p.lon)} cy={py(p.lat)} r={isSel ? 6.5 : 5} fill={hue}
                stroke="var(--surface)" strokeWidth={1.4} />
              {mode === "explore" && (
                <text x={px(p.lon) + 9} y={py(p.lat) + 3.5} fontSize={9.5}
                  fill="currentColor" opacity={isSel ? 1 : 0.62} fontWeight={isSel ? 700 : 500}>
                  {p.n}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {mode === "explore" ? (
        <>
          {sel ? (
            <div className="rounded-xl border hairline p-4 fade-up">
              <div className="font-semibold">{sel.n}</div>
              <div className="mt-0.5 text-[0.88rem] muted">{sel.st}</div>
              <div className="mt-1.5 font-mono text-[11.5px] faint">
                {sel.lat.toFixed(2)}°N, {sel.lon.toFixed(2)}°E
              </div>
            </div>
          ) : (
            <p className="rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
              Tap any marker to see which state it is in. {shown.length} locations in this layer.
            </p>
          )}
          <button onClick={startTest}
            className="mt-3 rounded-full px-5 py-2 text-[13px] font-medium text-white" style={{ background: hue }}>
            Test me on this layer
          </button>
        </>
      ) : (
        <>
          <div className="rounded-xl border hairline p-4">
            <div className="text-[11px] font-bold uppercase tracking-wider faint">Find this location</div>
            <div className="mt-1 text-[1.05rem] font-semibold">{target?.n}</div>
            {feedback !== null && (
              <div className="mt-3">
                <Verdict ok={feedback}>
                  {feedback
                    ? <>Correct — <strong>{target?.n}</strong> is in {target?.st}.</>
                    : <>Not quite. You picked <strong>{sel?.n}</strong>. {target?.n} is in {target?.st}.</>}
                </Verdict>
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button onClick={nextQuestion}
              className="rounded-full px-4 py-1.5 text-[12px] font-medium text-white" style={{ background: hue }}>
              Next location
            </button>
            <button onClick={reset} className="rounded-full border hairline px-4 py-1.5 text-[12px] font-medium">
              Back to exploring
            </button>
            <span className="ml-auto font-mono text-[13px] font-semibold tabular-nums">
              {score.right}/{score.total}
            </span>
          </div>
        </>
      )}
    </SimFrame>
  );
}

/* ============================================================== LAND USE */
const LAND = [
  { n: "Net sown area", v: 43.4, c: "#16a34a" },
  { n: "Forest", v: 23.3, c: "#166534" },
  { n: "Not available for cultivation", v: 13.9, c: "#94a3b8" },
  { n: "Fallow land", v: 10.6, c: "#d97706" },
  { n: "Culturable waste", v: 4.4, c: "#a16207" },
  { n: "Pasture & tree crops", v: 4.4, c: "#65a30d" },
];

export function LandUse() {
  const [sel, setSel] = useState(0);
  const total = LAND.reduce((a, b) => a + b.v, 0);
  let acc = 0;
  const R = 100, C = 120;

  return (
    <SimFrame title="How India's land is used" onReset={() => setSel(0)}
      caption="Figures follow the NCERT land-use table, as a percentage of the reporting area. Land-use data is available for only about 93% of the total geographical area.">
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <svg viewBox="0 0 240 240" className="w-full max-w-[220px] select-none">
          {LAND.map((s, i) => {
            const a0 = (acc / total) * 2 * Math.PI - Math.PI / 2;
            acc += s.v;
            const a1 = (acc / total) * 2 * Math.PI - Math.PI / 2;
            const large = a1 - a0 > Math.PI ? 1 : 0;
            const r = i === sel ? R + 8 : R;
            const x0 = C + r * Math.cos(a0), y0 = C + r * Math.sin(a0);
            const x1 = C + r * Math.cos(a1), y1 = C + r * Math.sin(a1);
            return (
              <path key={i} d={`M ${C} ${C} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`}
                fill={s.c} opacity={i === sel ? 1 : 0.72} stroke="var(--surface)" strokeWidth={1.5}
                onClick={() => setSel(i)} style={{ cursor: "pointer" }} />
            );
          })}
        </svg>
        <div className="w-full space-y-1">
          {LAND.map((s, i) => (
            <button key={i} onClick={() => setSel(i)}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left transition ${i === sel ? "bg-[var(--surface-2)]" : ""}`}>
              <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: s.c }} />
              <span className="min-w-0 flex-1 truncate text-[0.88rem]">{s.n}</span>
              <span className="font-mono text-[12.5px] font-semibold tabular-nums">{s.v}%</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-4 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        The National Forest Policy target is <strong>33%</strong> of the geographical area under forest, and India is
        well short of it. Net sown area also varies enormously — over 80% in Punjab and Haryana, under 10% in
        Arunachal Pradesh, Mizoram, Manipur and the Andaman &amp; Nicobar Islands.
      </p>
    </SimFrame>
  );
}

/* ======================================================= CROPPING SEASONS */
const SEASONS = [
  {
    v: "rabi", l: "Rabi", sow: "October – December", harvest: "April – June",
    crops: "Wheat, barley, peas, gram, mustard",
    where: "Punjab, Haryana, Himachal Pradesh, Jammu & Kashmir, Uttarakhand, Uttar Pradesh",
    note: "Needs a cool growing season. Precipitation from western temperate cyclones in winter helps these crops, and the Green Revolution supplied the high-yielding varieties.",
    months: [9, 10, 11, 0, 1, 2, 3, 4, 5],
  },
  {
    v: "kharif", l: "Kharif", sow: "June – July, with the monsoon", harvest: "September – October",
    crops: "Rice, maize, jowar, bajra, tur, moong, urad, cotton, jute, groundnut, soybean",
    where: "Assam, West Bengal, coastal Odisha, Andhra Pradesh, Telangana, Tamil Nadu, Kerala, Maharashtra, Uttar Pradesh, Bihar",
    note: "Grown with the onset of the monsoon. In Assam, West Bengal and Odisha three crops of paddy are raised in a year — Aus, Aman and Boro.",
    months: [5, 6, 7, 8, 9],
  },
  {
    v: "zaid", l: "Zaid", sow: "Between rabi and kharif — the short summer season", harvest: "Before the monsoon",
    crops: "Watermelon, muskmelon, cucumber, vegetables, fodder crops",
    where: "Grown on irrigated land wherever water is available in summer",
    note: "Sugarcane takes almost a year to grow, so it does not belong to any of the three seasons.",
    months: [2, 3, 4, 5],
  },
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function CroppingSeasons() {
  const [v, setV] = useState("rabi");
  const s = SEASONS.find((x) => x.v === v)!;
  return (
    <SimFrame title="The three cropping seasons" onReset={() => setV("rabi")}
      caption="India's farming year is shaped by the monsoon. Which crop grows when follows from when the water arrives.">
      <Choice value={v} onChange={setV} options={SEASONS.map((x) => ({ v: x.v, l: x.l }))} />
      <div className="mt-4 flex gap-[3px]">
        {MONTHS.map((m, i) => (
          <div key={m} className="flex-1 text-center">
            <div className="h-9 rounded transition-all"
              style={{ background: s.months.includes(i) ? "#16a34a" : "var(--surface-2)" }} />
            <div className="mt-1 text-[9.5px] faint">{m}</div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Readout items={[
          { k: "Sown", v: s.sow, hi: true },
          { k: "Harvested", v: s.harvest, hi: true },
        ]} />
      </div>
      <div className="mt-3 rounded-xl border hairline p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider faint">Main crops</div>
        <p className="mt-1 text-[0.92rem]">{s.crops}</p>
        <div className="mt-3 text-[11px] font-bold uppercase tracking-wider faint">Important states</div>
        <p className="mt-1 text-[0.9rem] muted">{s.where}</p>
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">{s.note}</p>
    </SimFrame>
  );
}

/* ==================================================== GEOGRAPHY EXPLORERS */
export const WildlifeStatus = () => (
  <Explorer title="How species are classified" accent="#059669"
    caption="These are the categories the NCERT uses. Learn one Indian example for each — that is exactly what the question asks for."
    cards={[
      { n: "Normal", tag: "Not at risk", d: "Species whose population levels are considered normal for their survival.", extra: "Examples: cattle, sal, pine, rodents." },
      { n: "Endangered", tag: "In danger of extinction", d: "Species in danger of extinction. Their survival is unlikely if the negative factors continue to operate.", extra: "Examples: black buck, crocodile, Indian wild ass, Indian rhino, lion-tailed macaque, sangai — the brow-antlered deer of Manipur." },
      { n: "Vulnerable", tag: "Heading that way", d: "Species whose population has declined to levels from which it is likely to move into the endangered category if the negative factors continue to operate.", extra: "Examples: blue sheep, Asiatic elephant, Gangetic dolphin." },
      { n: "Rare", tag: "Small populations", d: "Species with small populations which may move into the endangered or vulnerable category if the negative factors affecting them continue.", extra: "Examples: Himalayan brown bear, wild Asiatic buffalo, desert fox, hornbill." },
      { n: "Endemic", tag: "Found nowhere else", d: "Species found only in some particular areas, usually isolated by natural or geographical barriers.", extra: "Examples: Andaman teal, Nicobar pigeon, Andaman wild pig, Arunachal mithun." },
      { n: "Extinct", tag: "Gone", d: "Species not found after repeated searches of known or likely areas. A species may be extinct from a local area, a region, a country, a continent, or the whole earth.", extra: "Examples: Asiatic cheetah — declared extinct in India in 1952 — and the pink-head duck." },
    ]} />
);

export const DamTradeoffs = () => (
  <Explorer title="Multi-purpose projects: the case for and against" accent="#0284c7"
    caption="Nehru called dams the 'temples of modern India'. Half a century later the argument had turned. A five-mark question wants both sides."
    cards={[
      { n: "What they are for", tag: "Purpose", d: "A dam serves several purposes at once — irrigation, electricity generation, water supply for domestic and industrial use, flood control, recreation, inland navigation and fish breeding. That is why they are called multi-purpose.", extra: "Bhakra Nangal on the Satluj-Beas does water storage and electricity; Hirakud on the Mahanadi does flood control and water conservation." },
      { n: "Irrigation and food", tag: "For", d: "Canal irrigation from these projects made intensive multi-cropping possible and underpinned the Green Revolution.", extra: "But it also shifted the cropping pattern towards water-intensive commercial crops, with ecological consequences that are still being paid for." },
      { n: "Displacement", tag: "Against", d: "Large dams submerge existing settlements. Local people lose their land and their livelihood, and get very little in return for what is described as national development.", extra: "The Narmada Bachao Andolan mobilised tribal people, farmers and environmentalists against the Sardar Sarovar dam." },
      { n: "Ecological cost", tag: "Against", d: "Dams fragment rivers, making it harder for aquatic fauna to migrate and spawn. Flooding of vegetation and soil leads to its decomposition over time.", extra: "Excessive sedimentation at the bottom of the reservoir makes it rockier and a poorer habitat for the river's aquatic life." },
      { n: "Floods they were meant to stop", tag: "Against", d: "Dams built to control floods have sometimes triggered them, because of sedimentation in the reservoir. Unexpectedly heavy rainfall has forced sudden large releases of water.", extra: "The 2006 floods in Maharashtra and Gujarat were made worse by releases from dams after heavy rainfall." },
      { n: "Conflict over water", tag: "Against", d: "Inter-state disputes are common. Farmers in Gujarat and Madhya Pradesh have protested over the Sardar Sarovar; the Krishna–Godavari dispute sets Karnataka, Andhra Pradesh and Maharashtra against one another.", extra: "Even within one state, users at the tail end of a canal get less water than those near its head." },
      { n: "Rainwater harvesting", tag: "The alternative", d: "In hill regions, 'guls' and 'kuls' divert stream water. In Rajasthan, rooftop rainwater is stored in underground tanks called 'tankas'. In the semi-arid west, 'khadins' and 'johads' capture flood water.", extra: "Gendathur, a village near Mysuru in Karnataka, has nearly every house harvesting rooftop rainwater — evidence that small local systems can work where large ones fail." },
    ]} />
);

export const EnergyMix = () => (
  <Explorer title="Conventional and non-conventional energy" accent="#f59e0b"
    caption="Know which is which, and one reason each matters. India's energy problem is not only supply — it is what that supply costs the environment."
    cards={[
      { n: "Coal", tag: "Conventional", d: "India's most abundant fossil fuel and the source of most of its commercial energy. It occurs in Gondwana deposits over 200 million years old in the Damodar valley, and in younger tertiary deposits in the north-east.", extra: "Gondwana coalfields: Jharia, Raniganj, Bokaro. Tertiary coal: Meghalaya, Assam, Arunachal Pradesh, Nagaland." },
      { n: "Petroleum", tag: "Conventional", d: "Provides fuel for heat and lighting, lubricants for machinery, and raw materials for petrochemicals. About 63% of India's petroleum production comes from Mumbai High, 18% from Gujarat and 16% from Assam.", extra: "Digboi in Assam is the oldest oil-producing field in the country." },
      { n: "Natural gas", tag: "Conventional", d: "An important clean energy resource, used both as a fuel and as an industrial raw material. Large reserves lie in the Krishna-Godavari basin, along the west coast, and in Rajasthan and the Andaman Islands.", extra: "The Hazira–Vijaipur–Jagdishpur pipeline links the Mumbai High and Bassein fields to the fertiliser, power and industrial complexes of western and northern India." },
      { n: "Electricity", tag: "Conventional", d: "Generated in two main ways — hydro electricity from flowing water, and thermal electricity by burning coal, petroleum or natural gas. Thermal plants use non-renewable fuels.", extra: "Bhakra Nangal, Damodar Valley and Kopili Hydel are major hydel projects; there are over 300 thermal plants in the country." },
      { n: "Solar", tag: "Non-conventional", d: "India is a tropical country with enormous scope for solar energy. Photovoltaic technology converts sunlight directly into electricity.", extra: "The largest solar plant at Madhapur near Bhuj uses solar energy to sterilise milk cans. Solar power can also reduce rural dependence on firewood and dung cakes." },
      { n: "Wind", tag: "Non-conventional", d: "India already has a large wind power capacity. The largest wind farm cluster runs from Nagarcoil to Madurai in Tamil Nadu.", extra: "Andhra Pradesh, Karnataka, Gujarat, Kerala, Maharashtra and Lakshadweep also have effective wind farms." },
      { n: "Biogas", tag: "Non-conventional", d: "Shrubs, farm waste, and animal and human waste are used to produce biogas for domestic use in rural areas. Plants using cattle dung are known as 'Gobar gas plants'.", extra: "They give a double benefit — energy, and improved manure. They also reduce the burning of dung cakes, which destroys nutrients." },
      { n: "Tidal and geothermal", tag: "Non-conventional", d: "Tidal energy uses floodgate dams built across inlets. The Gulf of Khambhat, the Gulf of Kachchh and the Gangetic delta in the Sundarban region all have potential. Geothermal energy uses heat from the earth's interior.", extra: "Two experimental geothermal projects: the Parvati valley near Manikaran in Himachal Pradesh, and the Puga Valley in Ladakh." },
    ]} />
);

export const IndustryLocation = () => (
  <SortDrill title="Why is that industry there?"
    caption="Industry locates where the total cost of production is lowest. Match each example to the factor that decided it."
    buckets={[
      { k: "raw", l: "Raw material", hue: "#78350f" },
      { k: "mkt", l: "Market", hue: "#0891b2" },
      { k: "lab", l: "Labour / skill", hue: "#7c3aed" },
    ]}
    items={[
      { n: "Sugar mills in Uttar Pradesh and Maharashtra", k: "raw", note: "Sugarcane loses sucrose quickly after cutting, so mills must sit inside the cane belt." },
      { n: "Iron and steel at Bhilai and Bokaro", k: "raw", note: "Located in and around the Chhotanagpur plateau for cheap iron ore, coal and other minerals close together." },
      { n: "Software parks at Bengaluru and Hyderabad", k: "lab", note: "IT depends on a pool of skilled, educated workers rather than on any raw material." },
      { n: "Cotton textiles at Coimbatore and Mumbai", k: "lab", note: "Cotton textiles need abundant skilled labour, alongside capital and a market." },
      { n: "Agro-processing near large cities", k: "mkt", note: "Perishable processed food is made close to where it will be sold." },
      { n: "Petro-chemical plants near refineries", k: "raw", note: "The raw material is bulky and expensive to move, so processing happens at the source." },
      { n: "Aluminium smelting in Odisha and Jharkhand", k: "raw", note: "Bauxite is bulky, and smelting needs a regular supply of electricity — both are available there." },
      { n: "Cement plants near limestone quarries", k: "raw", note: "Cement needs bulky, heavy raw materials — limestone, silica, gypsum — so it locates at the source." },
    ]}
    hint="The general rule: industries using <strong>bulky raw material that loses weight</strong> during processing locate near the raw material. Industries whose product is bulky, perishable or fragile locate near the <strong>market</strong>. Knowledge industries follow <strong>skilled labour</strong>." />
);

export const TransportCompare = () => (
  <CompareBars title="India's transport network" accent="#059669"
    caption="Lifelines of the National Economy is assessed by map pointing in the board exam, but the comparison itself turns up in case-study questions."
    rows={[
      { n: "Roadways", v: { share: 85, cost: 20, speed: 55, reach: 95 } },
      { n: "Railways", v: { share: 12, cost: 12, speed: 60, reach: 60 } },
      { n: "Pipelines", v: { share: 2, cost: 5, speed: 10, reach: 20 } },
      { n: "Waterways", v: { share: 1, cost: 3, speed: 15, reach: 25 } },
      { n: "Airways", v: { share: 1, cost: 100, speed: 100, reach: 40 } },
    ]}
    metrics={[
      { k: "share", l: "Share of passenger traffic", unit: "%", better: "high", max: 100 },
      { k: "cost", l: "Relative cost", unit: "", better: "low", max: 100 },
      { k: "speed", l: "Relative speed", unit: "", better: "high", max: 100 },
      { k: "reach", l: "Door-to-door reach", unit: "", better: "high", max: 100 },
    ]}
    insight={(m) =>
      m.k === "share"
        ? "Roadways carry about <strong>85% of passenger traffic</strong> and around 70% of freight in India. Construction cost is far lower than for railways, roads can cross broken terrain, and they offer door-to-door service — which is also why they feed traffic into the railways."
        : m.k === "cost"
          ? "Pipelines are the cheapest way to move liquids and gases over long distances, with very low running costs, though the initial cost of laying them is high. Airways are the most expensive, which is why they carry so little by volume despite being fastest."
          : m.k === "speed"
            ? "Airways are the fastest and are indispensable for difficult terrain — the north-eastern states, high mountains and dense forests. But the cost puts them out of reach for most people."
            : "Only roads deliver door to door, which is their decisive advantage. Waterways are the cheapest for heavy and bulky goods but reach only where rivers and canals go — India has about 95 navigable waterways, of which a few are declared National Waterways."} />
);
