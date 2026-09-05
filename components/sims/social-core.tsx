"use client";
import React, { useState } from "react";
import { SimFrame, Choice, Readout, Verdict } from "./shell";

/* ============================================================== TIMELINE */
type Ev = { year: string; y: number; title: string; what: string; why?: string };

export function Timeline({ title, caption, events, accent = "#b45309" }:
  { title: string; caption: string; events: Ev[]; accent?: string }) {
  const [i, setI] = useState(0);
  const min = events[0].y, max = events[events.length - 1].y;
  const pos = (y: number) => ((y - min) / Math.max(max - min, 1)) * 100;
  const e = events[i];

  return (
    <SimFrame title={title} caption={caption} onReset={() => setI(0)}>
      <div className="relative mb-6 mt-4 h-16">
        <div className="absolute left-0 right-0 top-3 h-[3px] rounded" style={{ background: "var(--line-strong)" }} />
        <div className="absolute left-0 top-3 h-[3px] rounded transition-all"
          style={{ width: `${pos(e.y)}%`, background: accent }} />
        {events.map((ev, k) => (
          <button key={k} onClick={() => setI(k)}
            className="absolute -translate-x-1/2 transition"
            style={{ left: `${pos(ev.y)}%`, top: 0 }} aria-label={ev.year}>
            <span className="block rounded-full transition-all"
              style={{
                width: k === i ? 16 : 10, height: k === i ? 16 : 10,
                marginTop: k === i ? 4 : 7,
                background: k <= i ? accent : "var(--line-strong)",
                boxShadow: k === i ? `0 0 0 4px color-mix(in srgb, ${accent} 22%, transparent)` : "none",
              }} />
            <span className="mt-1.5 block whitespace-nowrap text-[10px] tabular-nums"
              style={{ color: k === i ? accent : "var(--ink-3)", fontWeight: k === i ? 700 : 400 }}>
              {ev.year}
            </span>
          </button>
        ))}
      </div>

      <div className="rounded-xl border hairline p-4 fade-up" key={i}>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}>{e.year}</span>
          <span className="font-semibold">{e.title}</span>
        </div>
        <p className="mt-2 text-[0.92rem] muted" dangerouslySetInnerHTML={{ __html: e.what }} />
        {e.why && (
          <p className="mt-2 border-t hairline pt-2 text-[0.88rem]" style={{ color: accent }}
            dangerouslySetInnerHTML={{ __html: "<strong>Why it mattered: </strong>" + e.why }} />
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}
          className="rounded-full border hairline px-4 py-1.5 text-[12px] font-medium transition hover:bg-[var(--surface-2)] disabled:opacity-40">
          ← Earlier
        </button>
        <span className="text-[12px] faint">{i + 1} of {events.length}</span>
        <button onClick={() => setI(Math.min(events.length - 1, i + 1))} disabled={i === events.length - 1}
          className="ml-auto rounded-full px-4 py-1.5 text-[12px] font-medium text-white transition disabled:opacity-40"
          style={{ background: accent }}>
          Later →
        </button>
      </div>
    </SimFrame>
  );
}

/* ============================================================ SORT DRILL */
export function SortDrill({ title, caption, buckets, items, hint }:
  { title: string; caption: string; buckets: { k: string; l: string; hue: string }[]; items: { n: string; k: string; note?: string }[]; hint?: string }) {
  const [ans, setAns] = useState<Record<string, string>>({});
  const correct = items.filter((it) => ans[it.n] === it.k).length;
  const done = Object.keys(ans).length;

  return (
    <SimFrame title={title} caption={caption} onReset={() => setAns({})}>
      <div className="space-y-2">
        {items.map((it) => {
          const a = ans[it.n];
          const graded = a !== undefined;
          const ok = a === it.k;
          return (
            <div key={it.n}>
              <div className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 transition ${
                !graded ? "hairline" : ok ? "border-emerald-500/50 bg-emerald-500/8" : "border-rose-500/50 bg-rose-500/8"}`}>
                <span className="min-w-0 flex-1 text-[0.92rem]">{it.n}</span>
                {buckets.map((b) => (
                  <button key={b.k} onClick={() => setAns((s) => ({ ...s, [it.n]: b.k }))}
                    className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium transition"
                    style={a === b.k
                      ? { background: ok ? "#10b981" : "#f43f5e", color: "#fff" }
                      : { background: `color-mix(in srgb, ${b.hue} 12%, transparent)`, color: b.hue }}>
                    {b.l}
                  </button>
                ))}
              </div>
              {graded && !ok && it.note && (
                <p className="mt-1 pl-3 text-[0.82rem] text-rose-600 dark:text-rose-300">{it.note}</p>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(correct / items.length) * 100}%` }} />
        </div>
        <span className="font-mono text-[13px] font-semibold tabular-nums">{correct}/{items.length}</span>
      </div>
      {hint && done === items.length && (
        <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted fade-up">{hint}</p>
      )}
    </SimFrame>
  );
}

/* ============================================================== EXPLORER */
export function Explorer({ title, caption, cards, accent = "#2563eb" }:
  { title: string; caption: string; accent?: string; cards: { n: string; tag?: string; d: string; extra?: string }[] }) {
  const [i, setI] = useState(0);
  const c = cards[i];
  return (
    <SimFrame title={title} caption={caption} onReset={() => setI(0)}>
      <div className="flex flex-wrap gap-1.5">
        {cards.map((x, k) => (
          <button key={k} onClick={() => setI(k)}
            className="rounded-full px-3 py-1.5 text-[12px] font-medium transition"
            style={k === i
              ? { background: accent, color: "#fff" }
              : { background: "transparent", border: "1px solid var(--line)", color: "var(--ink-2)" }}>
            {x.n}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-xl border hairline p-4 fade-up" key={i}>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-semibold">{c.n}</span>
          {c.tag && (
            <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              style={{ background: `color-mix(in srgb, ${accent} 13%, transparent)`, color: accent }}>{c.tag}</span>
          )}
        </div>
        <p className="mt-2 text-[0.92rem] muted" dangerouslySetInnerHTML={{ __html: c.d }} />
        {c.extra && (
          <p className="mt-2 border-t hairline pt-2 text-[0.88rem] muted" dangerouslySetInnerHTML={{ __html: c.extra }} />
        )}
      </div>
    </SimFrame>
  );
}

/* =========================================================== COMPARE BARS */
type Metric = { k: string; l: string; unit: string; better: "high" | "low"; max: number };
export function CompareBars({ title, caption, rows, metrics, insight, accent = "#c026d3" }:
  {
    title: string; caption: string; accent?: string;
    rows: { n: string; v: Record<string, number> }[];
    metrics: Metric[];
    insight: (m: Metric) => string;
  }) {
  const [mi, setMi] = useState(0);
  const m = metrics[mi];
  const best = rows.reduce((a, b) =>
    (m.better === "high" ? b.v[m.k] > a.v[m.k] : b.v[m.k] < a.v[m.k]) ? b : a);

  return (
    <SimFrame title={title} caption={caption} onReset={() => setMi(0)}>
      <Choice label="Compare on" value={mi} onChange={setMi} options={metrics.map((x, k) => ({ v: k, l: x.l }))} />
      <div className="mt-4 space-y-2.5">
        {rows.map((r) => (
          <div key={r.n} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-[0.9rem] font-medium">{r.n}</span>
            <div className="min-w-0 flex-1">
              <div className="h-7 rounded-md transition-all"
                style={{
                  width: `${Math.max(3, (r.v[m.k] / m.max) * 100)}%`,
                  background: r.n === best.n ? accent : `color-mix(in srgb, ${accent} 32%, transparent)`,
                }} />
            </div>
            <span className="w-24 shrink-0 text-right font-mono text-[12.5px] font-semibold tabular-nums">
              {r.v[m.k].toLocaleString("en-IN")}{m.unit}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Readout items={[
          { k: "Best on this measure", v: best.n, hi: true },
          { k: "Higher is", v: m.better === "high" ? "better" : "worse" },
        ]} />
      </div>
      <p className="mt-3 rounded-lg bg-[var(--surface-2)] px-4 py-2.5 text-[0.88rem] muted"
        dangerouslySetInnerHTML={{ __html: insight(m) }} />
    </SimFrame>
  );
}

/* ====================================================== HISTORY TIMELINES */
export const EuropeTimeline = () => (
  <Timeline title="Nationalism in Europe, 1789–1871"
    caption="Nationalism did not arrive all at once. Follow the chain from one revolution to two new nation-states."
    events={[
      { year: "1789", y: 1789, title: "The French Revolution", what: "Sovereignty transferred from the monarchy to the body of French citizens. A new French flag, a new national anthem, a centralised administration, one system of weights and measures, and a common language.", why: "It was the first time the idea of the <em>nation</em> was declared to belong to the people rather than the ruler." },
      { year: "1804", y: 1804, title: "The Napoleonic Code", what: "Napoleon's Civil Code abolished all privileges based on birth, established equality before the law, and secured the right to property. It was carried into the regions France controlled.", why: "It destroyed feudalism but was resented as foreign domination — that resentment itself fed local nationalism." },
      { year: "1815", y: 1815, title: "Congress of Vienna", what: "After Napoleon's defeat, European powers led by Duke Metternich met to restore the old monarchies and undo the changes of the revolutionary years.", why: "Conservatism triumphed, so nationalists were forced underground into secret societies." },
      { year: "1821", y: 1821, title: "The Greek war of independence", what: "Greeks rose against the Ottoman Empire, supported by poets and artists across Europe. Recognised as an independent nation by the Treaty of Constantinople in 1832.", why: "It showed that a nation could be created out of a revolt, and it won wide sympathy in Europe." },
      { year: "1834", y: 1834, title: "The Zollverein", what: "A customs union formed at Prussia's initiative abolished tariff barriers between most German states and reduced dozens of currencies to two.", why: "Economic unity came before political unity — and made it far more likely." },
      { year: "1848", y: 1848, title: "The Frankfurt Parliament", what: "In May 1848, 831 elected representatives met in St Paul's Church, Frankfurt, and drafted a constitution for a German nation headed by a monarchy subject to parliament. The King of Prussia rejected the crown.", why: "The liberal revolution failed, but the demands it made were later granted from above." },
      { year: "1861", y: 1861, title: "Unification of Italy", what: "Cavour's diplomacy and Garibaldi's volunteers brought the Italian states together. Victor Emmanuel II was proclaimed king of united Italy in 1861; Venetia followed in 1866 and Rome in 1870.", why: "Mazzini's idealism supplied the vision, but it was war and diplomacy that did the work." },
      { year: "1871", y: 1871, title: "Unification of Germany", what: "Bismarck used three wars over seven years — against Denmark, Austria and France — to unite Germany. On 18 January 1871 William I was proclaimed German Emperor at Versailles.", why: "Nationalism was now driven by the army and the aristocracy, not by liberal democrats." },
    ]} />
);

export const IndiaFreedomTimeline = () => (
  <Timeline title="Nationalism in India, 1919–1942" accent="#c2410c"
    caption="Each movement grew out of the failure or the anger left by the one before it. That chain is exactly what a five-mark question asks for."
    events={[
      { year: "1919", y: 1919, title: "The Rowlatt Act", what: "Passed by the Imperial Legislative Council despite the united opposition of Indian members. It allowed detention of political prisoners without trial for two years.", why: "Gandhi's first all-India response — a nationwide hartal — turned a legal grievance into a mass movement." },
      { year: "13 Apr 1919", y: 1919.3, title: "Jallianwala Bagh", what: "General Dyer's troops fired on a peaceful crowd gathered in an enclosed ground in Amritsar, blocking the only exit. Hundreds were killed.", why: "It shattered any remaining faith in British justice and pushed moderates towards mass agitation." },
      { year: "1920", y: 1920, title: "Non-Cooperation and Khilafat", what: "Adopted at the Nagpur Congress session in December 1920. Surrender of titles, boycott of civil services, army, police, courts, schools and foreign goods.", why: "It joined the Khilafat cause to the national one, bringing Hindus and Muslims into a single movement." },
      { year: "Feb 1922", y: 1922, title: "Chauri Chaura", what: "A procession turned violent and a police station was set on fire. Gandhi called off Non-Cooperation.", why: "It exposed the central tension of the movement — mass participation was powerful but hard to keep non-violent." },
      { year: "1928", y: 1928, title: "The Simon Commission", what: "A statutory commission with no Indian member arrived to look into the working of the constitutional system. It was met everywhere with 'Go back Simon'.", why: "An all-white commission on India's future united otherwise divided political opinion." },
      { year: "Dec 1929", y: 1929, title: "Purna Swaraj at Lahore", what: "The Congress session under Jawaharlal Nehru formalised the demand for complete independence. 26 January 1930 was to be celebrated as Independence Day.", why: "The goal shifted from dominion status to full independence — a point of no return." },
      { year: "12 Mar 1930", y: 1930, title: "The Dandi March", what: "Gandhi and 78 volunteers walked about 240 miles from Sabarmati to Dandi over 24 days, reaching the coast on 6 April to break the salt law.", why: "Salt was consumed by rich and poor alike, so the tax was the one grievance that could unite everyone." },
      { year: "1931", y: 1931, title: "Gandhi–Irwin Pact", what: "Signed on 5 March 1931. Gandhi agreed to attend the Second Round Table Conference in London, and the government agreed to release political prisoners.", why: "The London talks failed, and Civil Disobedience was relaunched — but with less momentum." },
      { year: "Sep 1932", y: 1932, title: "The Poona Pact", what: "Agreement between Dr B. R. Ambedkar and Gandhi. It gave the Depressed Classes reserved seats in provincial and central legislative councils, voted on by the general electorate.", why: "It settled the question of separate electorates, and it put Dalit political representation on the national agenda." },
      { year: "1942", y: 1942, title: "Quit India", what: "Gandhi's call for the British to leave India immediately, with the slogan 'Do or Die'. The leadership was arrested within hours and the movement continued largely without it.", why: "It was the last great mass movement before independence, and it made continued British rule untenable." },
    ]} />
);

export const GlobalWorldTimeline = () => (
  <Timeline title="The making of a global world" accent="#a16207"
    caption="Trade, work and disease have connected distant places for centuries. Notice how often the connection ran in one direction only."
    events={[
      { year: "Ancient", y: 1400, title: "The Silk Routes", what: "Overland and sea routes linking Asia with Europe and North Africa, known to have existed since before the Christian era and thriving until the fifteenth century. Chinese pottery, Indian textiles and spices travelled west; gold and silver flowed east.", why: "They carried more than goods — Buddhism, Christianity and Islam all travelled along them." },
      { year: "1492", y: 1492, title: "Columbus reaches the Americas", what: "European sailors found a sea route to Asia and stumbled on the Americas. Precious metals, especially silver from Peru and Mexico, flowed to Europe.", why: "It reversed the direction of world trade and began the destruction of American societies — smallpox killed far more people than any weapon." },
      { year: "1600s", y: 1600, title: "Food travels", what: "Potatoes, soya, groundnuts, maize, tomatoes, chillies and sweet potatoes were unknown in Europe and Asia before Columbus. The humble potato transformed European diets.", why: "Ireland's poor became so dependent on the potato that the blight of the 1840s caused a famine in which around a million people died." },
      { year: "1845", y: 1845, title: "The Corn Laws", what: "British laws restricting the import of corn kept food prices high. Under pressure from industrialists and urban dwellers they were abolished in 1846.", why: "Cheap imported food undercut British agriculture, pushed labour into cities, and drew distant lands into food production for Britain." },
      { year: "1890s", y: 1890, title: "Rinderpest in Africa", what: "A cattle plague arrived with infected animals imported from Asia and spread across the continent within a decade, killing perhaps 90% of the cattle.", why: "It destroyed African livelihoods and handed Europeans the means to force Africans into the labour market — a disease used as a tool of conquest." },
      { year: "1914", y: 1914, title: "The First World War", what: "The first modern industrial war, fought with machine guns, tanks, aircraft and chemical weapons. Around nine million died and twenty million were injured, most of them working-age men.", why: "It broke the pre-war economic order and turned Britain from the world's leading lender into a debtor." },
      { year: "1929", y: 1929, title: "The Great Depression", what: "Agricultural overproduction, collapsing prices and the withdrawal of American loans brought worldwide slump. Indian exports halved between 1928 and 1934.", why: "Indian peasants fell deep into debt, and the crisis fed directly into the Civil Disobedience movement." },
      { year: "1944", y: 1944, title: "Bretton Woods", what: "A conference in New Hampshire established the International Monetary Fund and the World Bank to manage post-war finance and reconstruction.", why: "It set up the framework of the post-war world economy — and gave the industrial powers the controlling vote in it." },
    ]} />
);

export const PrintCultureTimeline = () => (
  <Timeline title="Print culture and the modern world" accent="#7c3aed"
    caption="Printing did not just make books cheaper. It changed who could argue, with whom, and about what."
    events={[
      { year: "594 CE", y: 1450, title: "Woodblock printing in China", what: "Books were printed by rubbing paper against inked woodblocks. China was the major producer of printed material for centuries, mostly for the civil service examinations.", why: "Print began as a tool of the state, not of dissent." },
      { year: "1450s", y: 1455, title: "Gutenberg's press", what: "Johann Gutenberg adapted the olive press and developed movable metal type. The Bible was his first printed book — about 180 copies took three years to produce.", why: "What had taken a scribe a year now took weeks. This is the print revolution." },
      { year: "1517", y: 1517, title: "Luther's Ninety Five Theses", what: "Martin Luther's criticism of the Roman Catholic Church was printed and widely circulated, leading to a division within the Church.", why: "Luther said 'Printing is the ultimate gift of God'. Print made religious debate a public argument rather than a clerical one." },
      { year: "1556", y: 1556, title: "Print reaches India", what: "Portuguese missionaries brought the printing press to Goa in the mid-sixteenth century. Jesuit priests printed the first Tamil book in 1579 at Cochin and the first Malayalam book in 1713.", why: "Print in India began with missionaries, and only later became a tool of Indian reformers and nationalists." },
      { year: "1780", y: 1780, title: "The Bengal Gazette", what: "James Augustus Hickey began publishing the <em>Bengal Gazette</em>, a weekly which advertised itself as open to all parties but influenced by none — and gossiped freely about the Company's senior officials.", why: "The first experiment in a free press in India, and it provoked immediate official hostility." },
      { year: "1878", y: 1878, title: "The Vernacular Press Act", what: "Modelled on the Irish Press Laws, it gave the government extensive rights to censor reports and editorials in the vernacular press, and to seize the press if a warning was ignored.", why: "It confirmed that print had become powerful enough for the colonial state to fear it." },
      { year: "1900s", y: 1905, title: "Print and nationalism", what: "Despite censorship, nationalist newspapers multiplied. Reports of colonial misrule provoked cross-regional protest; Balgangadhar Tilak's writings in <em>Kesari</em> led to his imprisonment in 1908.", why: "Print turned local grievances into a shared national narrative." },
    ]} />
);

export const IndustrialisationTimeline = () => (
  <Timeline title="The age of industrialisation" accent="#78350f"
    caption="Formative assessment only for the year-end paper — but this is the background to almost everything in the Geography and Economics books."
    events={[
      { year: "Before 1700", y: 1700, title: "Proto-industrialisation", what: "Large-scale industrial production for an international market, but without factories. Merchants moved to the countryside and supplied money to peasants and artisans to produce for them.", why: "It shows that industrialisation did not begin with factories — the factory was a later stage." },
      { year: "1730s", y: 1730, title: "The earliest factories", what: "The first factories appeared in England in the 1730s and multiplied from the late eighteenth century. Cotton was the first symbol of the new era.", why: "Production moved under one roof, where it could be supervised and quality controlled." },
      { year: "1764", y: 1764, title: "The Spinning Jenny", what: "James Hargreaves' machine sped up spinning and reduced the demand for labour. Women who survived on hand spinning attacked the new machines.", why: "Technology was not welcomed by everyone — the fear of losing work was rational." },
      { year: "1854", y: 1854, title: "First cotton mill in Bombay", what: "The first cotton mill in Bombay was set up in 1854 and went into production two years later. The first jute mill in Bengal came up in 1855.", why: "Indian entrepreneurs — Dwarkanath Tagore, Dinshaw Petit, Seth Hukumchand — built industry alongside, not merely under, colonial trade." },
      { year: "1912", y: 1912, title: "TISCO", what: "The Tata Iron and Steel Company began producing steel at Jamshedpur, having been set up by Jamsetjee Nusserwanjee Tata's family.", why: "The First World War made Indian steel essential to the British war effort, and by 1919 the government was buying most of it." },
      { year: "1914", y: 1914, title: "War and Indian industry", what: "With Manchester mills busy supplying the war, imports to India fell. Indian mills had a vast home market and worked in double shifts.", why: "The war did what tariffs had not — it gave Indian industry room to grow." },
    ]} />
);

/* ====================================================== CIVICS EXPLORERS */
export const PowerSharingForms = () => (
  <Explorer title="The four forms of power sharing" accent="#2563eb"
    caption="Learn these as four separate answers. A question asking for 'forms of power sharing' expects all four, each with an example."
    cards={[
      { n: "Horizontal", tag: "Among organs of government", d: "Power is shared among the legislature, executive and judiciary. Each is placed at the same level and each exercises different powers.", extra: "This is a <strong>system of checks and balances</strong> — ministers are answerable to Parliament, and the courts can check the exercise of power by both." },
      { n: "Vertical", tag: "Among levels of government", d: "Power is shared between a general government for the whole country and governments at the provincial or regional level. In India this is the Union, State and local governments.", extra: "The Constitution lays down the powers of each level, so higher levels cannot simply order lower ones about. This is <strong>federal division of power</strong>." },
      { n: "Among social groups", tag: "Community government", d: "Power is shared among different social groups such as religious and linguistic groups. Belgium's 'community government' is elected by people belonging to one language community.", extra: "In India, reserved constituencies give space to communities who would otherwise have little voice in the working of government." },
      { n: "Among political parties and movements", tag: "Pressure groups", d: "Power is shared between political parties, pressure groups and movements. In a democracy, citizens choose among parties, and power alternates between them or between coalitions.", extra: "Interest groups such as traders' associations and trade unions also get a share of governmental power, either through participation or through influence." },
    ]} />
);

export const FederalismLists = () => (
  <SortDrill title="Which list does it belong to?"
    caption="The Union List has 97 subjects, the State List 66 and the Concurrent List 47. Residuary subjects — anything not listed, like computer software — go to the Union."
    buckets={[
      { k: "u", l: "Union", hue: "#2563eb" },
      { k: "s", l: "State", hue: "#059669" },
      { k: "c", l: "Concurrent", hue: "#b45309" },
    ]}
    items={[
      { n: "Defence of the country", k: "u", note: "Union List — matters of national importance requiring a uniform policy." },
      { n: "Police", k: "s", note: "State List — law and order is a state subject." },
      { n: "Education", k: "c", note: "Concurrent List — both the Union and the States can legislate on it." },
      { n: "Foreign affairs", k: "u", note: "Union List — only the Union government can make laws on it." },
      { n: "Agriculture", k: "s", note: "State List — states are of primary interest here." },
      { n: "Forests", k: "c", note: "Concurrent List — shared between the Union and the States." },
      { n: "Banking", k: "u", note: "Union List." },
      { n: "Trade and commerce within a state", k: "s", note: "State List — inter-state trade is Union, intra-state is State." },
      { n: "Marriage and adoption", k: "c", note: "Concurrent List." },
      { n: "Currency", k: "u", note: "Union List — one currency for the whole country." },
      { n: "Irrigation", k: "s", note: "State List." },
      { n: "Succession and inheritance", k: "c", note: "Concurrent List." },
    ]}
    hint="If the Union and a State law conflict on a Concurrent subject, the Union law prevails. And anything the Constitution's makers could not have imagined — computer software, for instance — is a residuary subject and belongs to the Union." />
);

export const PartySystem = () => (
  <Explorer title="Political parties — what they do and what is wrong with them" accent="#1d4ed8"
    caption="Functions on one side, challenges on the other. Board questions ask for both, usually with reforms attached."
    cards={[
      { n: "Contest elections", tag: "Function", d: "Elections are fought mainly among candidates put up by parties. Parties select their candidates in different ways — in some countries by members, in India usually by the top leadership.", extra: "This is why the way parties choose candidates matters so much to the quality of democracy." },
      { n: "Shape policy", tag: "Function", d: "Parties put forward different policies and programmes, and voters choose from among them. A party reduces a vast diversity of opinions to a few basic positions people can actually pick between.", extra: "The government is expected to base its policies on the line taken by the ruling party." },
      { n: "Make laws", tag: "Function", d: "Laws are debated and passed in the legislature, but members belong to parties and generally vote as the party directs.", extra: "This is the practical reason the anti-defection law exists." },
      { n: "Form and run governments", tag: "Function", d: "Parties recruit leaders, train them and then make them ministers to run the government. The major policy decisions are taken by the party leadership.", extra: "The party in opposition also has a formal role — to criticise the government and mobilise opinion against it." },
      { n: "Access to welfare", tag: "Function", d: "Parties provide people with access to government machinery and welfare schemes. A local party leader is often easier to approach than a government officer.", extra: "Which is also why parties are sometimes accused of favouring their own supporters." },
      { n: "Lack of internal democracy", tag: "Challenge", d: "Power is concentrated in a few leaders at the top. Parties do not keep membership registers, do not hold organisational meetings, and do not conduct internal elections regularly.", extra: "Ordinary members have no way to influence decisions, so they become followers of the leader." },
      { n: "Dynastic succession", tag: "Challenge", d: "Because parties are not transparent internally, those already in power favour people close to them — often their own family. This is unfair to others and bad for democracy.", extra: "It also means people without connections struggle to rise, however capable they are." },
      { n: "Money and muscle power", tag: "Challenge", d: "Since parties are focused on winning, they nominate candidates who can raise money or bring in votes by other means. Rich people and companies who fund parties gain influence over policy.", extra: "Sometimes parties support criminals who can win elections." },
      { n: "No meaningful choice", tag: "Challenge", d: "Parties in many countries differ little on fundamental issues, so voters have no real alternative. Leaders keep shifting between parties, which weakens the difference further.", extra: "Democracy requires a genuine choice, not just a choice of faces." },
    ]} />
);

export const DemocracyOutcomes = () => (
  <Explorer title="What democracy actually delivers" accent="#1e40af"
    caption="The honest answer is 'some things reliably, some things not'. Say which is which and you will get the marks."
    cards={[
      { n: "Accountable government", tag: "Delivers", d: "Democracy produces a government that follows procedures and is answerable to the people. Citizens can take part in decision making and can remove a government they dislike.", extra: "The <strong>process</strong> is the guarantee, not the outcome. Democracy is legitimate because it is the people's own government." },
      { n: "Economic growth", tag: "Mixed", d: "Comparing democracies and dictatorships between 1950 and 2000, the difference in rates of economic growth is negligible. Dictatorships have sometimes grown marginally faster.", extra: "But given the other advantages, and the fact that the difference is small, this is not a reason to prefer dictatorship." },
      { n: "Reducing inequality and poverty", tag: "Falls short", d: "Democracies are based on political equality — one person, one vote — but economic inequalities persist and in many cases have grown. A small number of people hold a disproportionate share of wealth.", extra: "This is democracy's clearest unfinished business, and an honest answer must say so." },
      { n: "Accommodating diversity", tag: "Delivers", d: "Democracies usually develop a procedure to conduct competition between groups, which reduces the chance that differences turn into violent conflict. Belgium is the standard example; Sri Lanka the counter-example.", extra: "Two conditions: majority and minority must work together, and 'majority' must not mean one permanent religious or ethnic group." },
      { n: "Dignity and freedom", tag: "Delivers", d: "Democracy stands on the principle of the individual's dignity and freedom. The passion for respect and freedom is the strongest argument in its favour.", extra: "The status of women and the demands of the marginalised have both improved in democracies — because the claim can be made publicly and legitimately." },
      { n: "The expectation itself", tag: "Note", d: "People complain about democracy more than about any other system. That complaint is itself a sign of success — it means people believe they are the rulers and are entitled to judge.", extra: "A dictatorship generates no such expectation." },
    ]} />
);
