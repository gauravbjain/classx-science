"use client";
import React, { useState } from "react";
import { SimFrame, Choice, Readout, Slider, Verdict } from "./shell";
import { CompareBars, Explorer } from "./social-core";

const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

/* ================================================= DEVELOPMENT INDICATORS */
export const DevelopmentCompare = () => (
  <CompareBars title="Why income alone is not development" accent="#c026d3"
    caption="Three states, four measures. Switch between them and watch the ranking change — that change is the whole argument of the chapter."
    rows={[
      { n: "Haryana", v: { income: 236147, imr: 30, literacy: 82, nar: 61 } },
      { n: "Kerala", v: { income: 204105, imr: 7, literacy: 94, nar: 83 } },
      { n: "Bihar", v: { income: 40982, imr: 32, literacy: 62, nar: 43 } },
    ]}
    metrics={[
      { k: "income", l: "Per capita income", unit: "", better: "high", max: 250000 },
      { k: "imr", l: "Infant mortality rate", unit: " per 1000", better: "low", max: 40 },
      { k: "literacy", l: "Literacy rate", unit: "%", better: "high", max: 100 },
      { k: "nar", l: "Net attendance ratio, class 9–10", unit: "%", better: "high", max: 100 },
    ]}
    insight={(m) =>
      m.k === "income"
        ? "On income alone, Haryana comes first. If per capita income were the whole story, the chapter would end here — and the NCERT would not have written it."
        : m.k === "imr"
          ? "Kerala's infant mortality rate is <strong>7 per 1000</strong> against Haryana's 30, despite Haryana having the higher income. Kerala has better basic health and education facilities, and money in the hand cannot buy what a state does not provide."
          : m.k === "literacy"
            ? "Kerala leads again. Income can buy a private tutor, but not a functioning school system — which is why the two rankings come apart."
            : "Kerala's net attendance ratio is far ahead. This is the clearest illustration of why the <strong>Human Development Index</strong> combines income with health and education instead of using income by itself."} />
);

/* ================================================= SECTORS OF THE ECONOMY */
const YEARS = [
  { v: "1973", l: "1973–74", gdp: [40, 20, 40], emp: [74, 11, 15] },
  { v: "2013", l: "2013–14", gdp: [20, 24, 56], emp: [50, 22, 28] },
];
const SECTORS = ["Primary", "Secondary", "Tertiary"];
const SEC_COLOR = ["#16a34a", "#0ea5e9", "#c026d3"];

export function SectorsEconomy() {
  const [y, setY] = useState("2013");
  const d = YEARS.find((x) => x.v === y)!;
  const gap = d.emp[0] - d.gdp[0];

  return (
    <SimFrame title="Where output comes from, and where people work" onReset={() => setY("2013")}
      caption="Figures follow the NCERT charts. The gap between the two bars for the primary sector is the single most important number in this chapter.">
      <Choice label="Year" value={y} onChange={setY} options={YEARS.map((x) => ({ v: x.v, l: x.l }))} />

      <div className="mt-5 space-y-5">
        {SECTORS.map((s, i) => (
          <div key={s}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[0.92rem] font-semibold">{s} sector</span>
              <span className="text-[11.5px] faint">
                {i === 0 ? "agriculture, forestry, fishing, mining" : i === 1 ? "manufacturing, construction" : "trade, transport, banking, services"}
              </span>
            </div>
            {[["Share of GDP", d.gdp[i]], ["Share of employment", d.emp[i]]].map(([lab, v], k) => (
              <div key={k} className="mb-1 flex items-center gap-3">
                <span className="w-40 shrink-0 text-[11.5px] muted">{lab as string}</span>
                <div className="min-w-0 flex-1">
                  <div className="h-6 rounded-md transition-all"
                    style={{
                      width: `${v as number}%`,
                      background: SEC_COLOR[i],
                      opacity: k === 0 ? 1 : 0.45,
                    }} />
                </div>
                <span className="w-12 shrink-0 text-right font-mono text-[12.5px] font-semibold tabular-nums">{v as number}%</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Readout items={[
          { k: "Largest producer", v: `${SECTORS[d.gdp.indexOf(Math.max(...d.gdp))]} sector`, hi: true },
          { k: "Largest employer", v: `${SECTORS[d.emp.indexOf(Math.max(...d.emp))]} sector`, hi: true },
          { k: "Primary sector gap", v: `${gap} points` },
          { k: "Meaning", v: "Underemployment" },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        {y === "2013"
          ? <>In 2013–14 the primary sector produced only about <strong>20% of GDP</strong> but employed roughly <strong>50% of workers</strong>. More than half the workforce is producing a fifth of the output — which means many of those people are not fully employed. This is <strong>disguised unemployment</strong>, and it is why the MGNREGA guarantees 100 days of work a year.</>
          : <>In 1973–74 the primary sector was both the largest producer <em>and</em> by far the largest employer. Compare it with 2013–14: production shifted decisively to services, but employment did not follow. That mismatch is the problem the chapter is about.</>}
      </p>
    </SimFrame>
  );
}

/* ========================================================= MONEY & CREDIT */
export function MoneyCredit() {
  const [amount, setAmount] = useState(50000);
  const [months, setMonths] = useState(12);
  const [rateF, setRateF] = useState(12);
  const [rateI, setRateI] = useState(48);

  const costF = amount * (rateF / 100) * (months / 12);
  const costI = amount * (rateI / 100) * (months / 12);
  const extra = costI - costF;

  return (
    <SimFrame title="What a loan actually costs" onReset={() => { setAmount(50000); setMonths(12); setRateF(12); setRateI(48); }}
      caption="Moneylenders commonly charge 3–5% a month, which is 36–60% a year. Change the numbers and see what that difference means to a household.">
      <div className="grid gap-3 sm:grid-cols-2">
        <Slider label="Loan amount" value={amount} min={5000} max={300000} step={5000} onChange={setAmount} fmt={(v) => inr(v)} />
        <Slider label="Loan period" value={months} min={3} max={36} step={3} onChange={setMonths} unit=" months" />
        <Slider label="Formal sector rate (bank / cooperative)" value={rateF} min={7} max={20} onChange={setRateF} unit="% a year" />
        <Slider label="Informal sector rate (moneylender)" value={rateI} min={24} max={72} step={2} onChange={setRateI} unit="% a year" />
      </div>

      <div className="mt-5 space-y-3">
        {[
          { l: "Formal sector", sub: "Banks and cooperatives · supervised by the RBI", cost: costF, rate: rateF, c: "#16a34a" },
          { l: "Informal sector", sub: "Moneylenders, traders, employers · nobody supervises them", cost: costI, rate: rateI, c: "#e11d48" },
        ].map((r) => (
          <div key={r.l} className="rounded-xl border hairline p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <div className="font-semibold" style={{ color: r.c }}>{r.l}</div>
                <div className="text-[11.5px] faint">{r.sub}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[1.15rem] font-bold tabular-nums">{inr(r.cost)}</div>
                <div className="text-[11px] faint">interest paid</div>
              </div>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (r.cost / Math.max(costI, 1)) * 100)}%`, background: r.c }} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <Verdict ok={false}>
          Borrowing from the informal sector costs <strong>{inr(extra)} more</strong> on this loan — about{" "}
          <strong>{Math.round((extra / amount) * 100)}%</strong> of the amount borrowed, purely in extra interest.
        </Verdict>
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        High interest is why so many poor borrowers end up in a <strong>debt trap</strong> — the loan makes them worse
        off than before. Formal lenders demand <strong>collateral</strong> that the poor do not have, which is exactly
        the gap that <strong>Self Help Groups</strong> fill: 15–20 members pool small savings, and the group's own
        guarantee replaces collateral.
      </p>
    </SimFrame>
  );
}

/* ======================================================== GLOBALISATION */
const CHAIN = [
  { n: "Design & research", where: "United States", d: "The multinational company designs the product and does the research at its head office, where the highly paid technical work is concentrated.", who: "MNC head office" },
  { n: "Components", where: "China", d: "Parts are manufactured where labour and other costs are lowest. The MNC does not need to own the factory — it can simply place orders.", who: "Local suppliers" },
  { n: "Assembly", where: "Mexico or Eastern Europe", d: "Assembly happens close to the markets where the product will be sold, to cut transport cost and delivery time.", who: "MNC or joint venture" },
  { n: "Customer support", where: "India", d: "Call centres and back-office work are located where English-speaking educated workers are available at lower wages.", who: "Outsourced firms" },
  { n: "Sale", where: "Europe and North America", d: "The finished product is sold in the wealthy markets, at a price many times what any single stage of production cost.", who: "Retailers" },
];

export function GlobalisationChain() {
  const [i, setI] = useState(0);
  const s = CHAIN[i];
  return (
    <SimFrame title="One product, five countries" onReset={() => setI(0)}
      caption="This is what 'production spread across countries' means in practice. Notice where the well-paid work sits and where it does not.">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
        {CHAIN.map((c, k) => (
          <React.Fragment key={k}>
            <button onClick={() => setI(k)}
              className="shrink-0 rounded-lg px-3 py-2 text-left transition"
              style={k === i
                ? { background: "#c026d3", color: "#fff" }
                : { background: "var(--surface-2)", color: "var(--ink-2)" }}>
              <div className="text-[11.5px] font-semibold">{c.n}</div>
              <div className="text-[10px] opacity-80">{c.where}</div>
            </button>
            {k < CHAIN.length - 1 && <span className="shrink-0 faint">→</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-4 rounded-xl border hairline p-4 fade-up" key={i}>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold">{s.n}</span>
          <span className="rounded-full bg-fuchsia-500/12 px-2.5 py-0.5 text-[11px] font-semibold text-fuchsia-700 dark:text-fuchsia-300">{s.where}</span>
          <span className="text-[11.5px] faint">{s.who}</span>
        </div>
        <p className="mt-2 text-[0.92rem] muted">{s.d}</p>
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted">
        Each stage is placed wherever it costs least, and the whole chain is coordinated by the MNC. This is why
        globalisation has produced <strong>winners and losers</strong>: consumers and skilled workers in some places
        gained a great deal, while small producers and unorganised workers elsewhere faced competition they could
        not survive.
      </p>
    </SimFrame>
  );
}

/* ======================================================== CONSUMER RIGHTS */
const RIGHTS = ["Right to safety", "Right to be informed", "Right to choose", "Right to seek redressal"];
const SCENARIOS = [
  { s: "A pressure cooker sold without an ISI mark explodes and injures the user.", a: 0, why: "Consumers have the right to be protected against goods and services that are hazardous to life and property. Producers must observe safety rules — which is what the ISI mark certifies." },
  { s: "A packet of biscuits carries no manufacturing date, expiry date or list of ingredients.", a: 1, why: "Rules require manufacturers to display ingredients, price, batch number, date of manufacture, expiry date and the address of the manufacturer. This is the right to be informed — and it is what the RTI Act extended to government services." },
  { s: "A gas dealer refuses to supply a cylinder unless the customer also buys a stove from him.", a: 2, why: "The consumer has the right to choose any product or service they wish. Tying one purchase to another denies that right." },
  { s: "A shopkeeper sells a defective mobile phone and refuses to replace it or refund the money.", a: 3, why: "The consumer can approach a District Consumer Commission for compensation. This is the right to seek redressal against unfair trade practices or exploitation." },
  { s: "A hotel charges more than the printed maximum retail price for a bottle of water.", a: 3, why: "Charging above the MRP is an unfair trade practice, and the consumer can seek redressal in a consumer court." },
  { s: "A jeweller sells gold ornaments with no hallmark and a lower purity than claimed.", a: 1, why: "Hallmark is the certification for jewellery. Without it the consumer has no reliable information about purity — this is a failure of the right to be informed." },
];

export function ConsumerRights() {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = SCENARIOS[i];
  const correct = picked === q.a;

  const next = () => {
    if (i + 1 < SCENARIOS.length) { setI(i + 1); setPicked(null); }
  };
  const reset = () => { setI(0); setPicked(null); setScore(0); };

  return (
    <SimFrame title="Which consumer right applies?" onReset={reset}
      caption="Case-study questions in this chapter almost always give you a situation and ask which right was violated. This is that skill, drilled.">
      <div className="rounded-xl bg-[var(--surface-2)] px-4 py-3.5">
        <div className="text-[11px] font-bold uppercase tracking-wider faint">Situation {i + 1} of {SCENARIOS.length}</div>
        <p className="mt-1.5 text-[1rem] leading-relaxed">{q.s}</p>
      </div>
      <div className="mt-3 space-y-2">
        {RIGHTS.map((r, k) => {
          const isAns = k === q.a, chosen = picked === k;
          let cls = "border hairline hover:bg-[var(--surface-2)]";
          if (picked !== null) {
            if (isAns) cls = "border-emerald-500/60 bg-emerald-500/10";
            else if (chosen) cls = "border-rose-500/60 bg-rose-500/10";
            else cls = "border hairline opacity-55";
          }
          return (
            <button key={k} disabled={picked !== null}
              onClick={() => { setPicked(k); if (k === q.a) setScore((s) => s + 1); }}
              className={`w-full rounded-xl border px-4 py-2.5 text-left text-[0.94rem] transition ${cls}`}>
              {r}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="mt-3 fade-up">
          <Verdict ok={correct}>
            <strong>{correct ? "Correct. " : "Not quite. "}</strong>{q.why}
          </Verdict>
          <div className="mt-3 flex items-center gap-3">
            {i + 1 < SCENARIOS.length ? (
              <button onClick={next} className="rounded-full bg-[var(--accent)] px-5 py-2 text-[13px] font-medium text-white">
                Next situation
              </button>
            ) : (
              <button onClick={reset} className="rounded-full bg-[var(--accent)] px-5 py-2 text-[13px] font-medium text-white">
                Start again
              </button>
            )}
            <span className="ml-auto font-mono text-[13px] font-semibold tabular-nums">{score}/{SCENARIOS.length}</span>
          </div>
        </div>
      )}
    </SimFrame>
  );
}

/* ============================================================ GENDER ETC */
export const SocialDivisions = () => (
  <Explorer title="Gender, religion and caste in politics" accent="#1d4ed8"
    caption="Three divisions, three different relationships with democracy. The chapter's point is that expressing a division is healthy; letting one division become the only one is dangerous."
    cards={[
      { n: "Sexual division of labour", tag: "Gender", d: "A system in which all work inside the home is either done by women of the family or organised by them. Men are not expected to do it, so women's work is not valued and often not even counted as work.", extra: "This is not natural — it is a social arrangement, which is why it can change." },
      { n: "Women in public life", tag: "Gender", d: "Women's political representation in India remains low. Their share in the Lok Sabha has stayed under 15% for most of its history, well below the world average.", extra: "One-third of seats in local government bodies — panchayats and municipalities — are reserved for women, which has brought a large number of women into elected office." },
      { n: "Communalism", tag: "Religion", d: "When beliefs of one religion are presented as superior, when the demands of one group are formed in opposition to another, and when state power is used to establish domination of one religious group.", extra: "It can take the form of everyday prejudice, of political mobilisation on religious lines, or of communal violence." },
      { n: "Secularism", tag: "Religion", d: "The Indian Constitution gives the state no official religion, provides freedom to profess, practise and propagate any religion, prohibits discrimination on grounds of religion, and allows the state to intervene to ensure equality within religious communities.", extra: "Secularism is not an ideology of one party — it is one of the foundations of the country." },
      { n: "Caste in politics", tag: "Caste", d: "No parliamentary constituency in India has a clear majority of one single caste, so every party has to win the confidence of more than one caste to win. Caste alone does not determine election results.", extra: "Political expression of caste has also given the disadvantaged the means to demand a share of power — which is a gain for democracy." },
      { n: "Politics in caste", tag: "Caste", d: "The reverse also happens: politics influences caste. Castes reposition themselves, form alliances, and enter into dialogue with other castes to become politically effective.", extra: "The point to write in an answer: caste in politics is neither purely good nor purely bad. It matters, but it is never the only thing that matters." },
    ]} />
);
