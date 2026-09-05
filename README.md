# ClassX

An interactive learning site for **CBSE Class X**, session 2026-27. Built to be read on a phone or a
laptop, with a simulation you can actually play with in every chapter.

**Science**, **Mathematics** and **Social Science** are live. Adding a subject is a content
change, not a refactor, and it moves no existing URL. See
[docs/ADDING-A-SUBJECT.md](docs/ADDING-A-SUBJECT.md).

- 51 chapters, mapped line-by-line to the official CBSE Secondary Curriculum (2026-27) —
  15 in Science, 14 in Mathematics, 22 in Social Science
- 65 interactive simulations — ray diagrams, circuits, Punnett squares, pH scale and food chains
  in Science; live graphs, a discriminant explorer, a draggable coordinate plane, circle tangents
  and a probability simulator in Maths; scrubbable timelines, a latitude-and-longitude India
  locator with a test mode, and sector, credit and globalisation models in Social Science
- 570 practice MCQs with explanations, and 657 flashcards
- A **Practice** tab in every chapter: ~920 board-style written questions (1–5 marks) with model
  answers, ~200 assertion–reason items, and ~95 case / source-based questions — each tagged by
  weightage (high · common · occasional) with the years it has appeared, plus a "most-asked only"
  filter and a "where the marks are" topic guide
- A per-subject `/revise` page: full formula sheet, all flashcards, and a 25-question mixed test
- Progress tracking saved in the browser, namespaced per subject — nothing leaves the device
- Light and dark mode, fully responsive

---

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

To check the production build:

```bash
npm run build
npm start
```

Node 18.18+ is required (Node 20 or 22 recommended).

---

## Deploy to Vercel

**1. Put it on GitHub**

```bash
git remote add origin git@github.com:<your-username>/classx-science.git
git branch -M main
git push -u origin main
```

(The folder already has a git repo with an initial commit, so there is nothing else to set up.)

**2. Import it on Vercel**

- Go to [vercel.com/new](https://vercel.com/new) and pick the repo
- Framework preset: **Next.js** — it is detected automatically
- Build command, output directory, install command: **leave all defaults**
- No environment variables are needed
- Click **Deploy**

You get a `https://<project>.vercel.app` URL in about a minute. Every push to `main` redeploys.

**Alternative — deploy straight from the terminal**

```bash
npx vercel          # preview deployment
npx vercel --prod   # production
```

**Tip:** add the site to your nephew's phone home screen (Share → Add to Home Screen). It opens
full-screen like an app.

---

## URLs

Fixed from the first deploy, so nothing your nephew bookmarks ever moves:

```
/                        the library — every subject
/science                 subject home: chapter grid, marks split, progress
/science/electricity     a chapter
/science/revise          formula sheet · flashcards · mixed test
/mathematics             …and the same three shapes for every subject
/mathematics/circles
/mathematics/revise
```

Do not rename a `slug` once it is published. Titles can change freely.

## How it is put together

```
app/
  layout.tsx                    root layout, theme script, fonts
  page.tsx                      the library — lists every subject
  [subject]/page.tsx            subject home (statically generated)
  [subject]/[slug]/page.tsx     one chapter
  [subject]/revise/page.tsx     revise
components/
  ui/       Blocks.tsx (content renderer), Quiz, Flashcards, ChapterView, ReviseView, SiteHeader
  sims/     optics · electricity · chemistry · biology · environment
            maths-algebra · maths-geometry · maths-stats + registry.tsx
content/
  index.ts        THE SUBJECT REGISTRY — one array; adding a subject is one line
  _template/      copy this folder to start a new subject
  science/        units.ts, ch01.ts … ch15.ts, index.ts
  mathematics/    units.ts, ch01.ts … ch14.ts, index.ts
docs/
  ADDING-A-SUBJECT.md
lib/
  types.ts  sim-ids.ts  palette.ts  progress.ts  validate.ts
```

### The content model

A chapter is plain data, not JSX — which is what makes this easy to extend. Each one is an
array of typed blocks:

| Block | What it renders |
|---|---|
| `h` | section heading (also builds the table of contents) |
| `p` | a paragraph (HTML string) |
| `list` | bulleted or numbered list |
| `note` | a coloured callout — `idea`, `real`, `exam`, `trap`, `why`, `memory` |
| `formula` | a formula card with a "where" legend |
| `eq` | a chemical equation block (monospaced, scrolls horizontally) |
| `table` | a comparison table |
| `compare` | two-column side-by-side comparison |
| `steps` | a worked example, hidden behind a "show the solution" button |
| `sim` | drops an interactive simulation in by id |

Plus `formulas`, `examFocus`, `flashcards` and `quiz` arrays per chapter — and, for exam practice,
`keyTopics` (syllabus topics rated by board weightage), `written` (marks-tagged subjective questions
with model answers), `assertionReason` and `caseStudies`. All four are optional, so a chapter can be
filled in progressively; the **Practice** tab appears automatically once any of them is present.

### Adding a simulation

1. Write the component under `components/sims/` (plain SVG + hooks, no chart library), wrapped in
   `<SimFrame>`.
2. Add its id to `SIM_IDS` in `lib/sim-ids.ts`.
3. Add it to `REGISTRY` in `components/sims/registry.tsx`.
4. Use it from any chapter: `{ t: "sim", id: "your-id" }`.

TypeScript keeps steps 2 and 3 in sync and rejects a `sim` block naming an id that does not exist.

### Adding another subject

Copy `content/_template/` to `content/<slug>/`, write the units and chapters, and add one line to
the array in `content/index.ts`. Routes, navigation, the marks bar and progress tracking all follow
from that array. Full walkthrough — including how to ship a half-finished subject — is in
[docs/ADDING-A-SUBJECT.md](docs/ADDING-A-SUBJECT.md).

### What the build checks

`lib/validate.ts` runs at build time and fails the build, naming the chapter, on a duplicate slug, a
unit key that is not defined, a quiz `answer` index out of range, a question with no explanation, or
an empty chapter. A content mistake becomes a red build on Vercel rather than a broken page.

---

## A note on the syllabus

Content follows the official CBSE curriculum documents for Class X, 2026-27 (`cbseacademic.nic.in`).

**Mathematics** — the syllabus is identical for Standard (041) and Basic (241); only the difficulty
of the question paper differs, so this content serves either. Unit marks: Number Systems 6, Algebra
20, Coordinate Geometry 6, Geometry 15, Trigonometry 12, Mensuration 10, Statistics and Probability 11.

**Science** — two chapters — **Periodic Classification of Elements** and **Evolution** —
are marked *formative assessment only*, meaning CBSE has excluded them from the year-end paper for
this session. They are included and clearly badged, since they still appear in periodic tests and
underpin other chapters. The same badge logic covers the motor / electromagnetic induction /
generator exclusion inside Chapter 14.

**Social Science** — four books, 20 marks each: History (*India and the Contemporary World — II*),
Geography (*Contemporary India — II*), Civics (*Democratic Politics — II*) and Economics
(*Understanding Economic Development*). Chapter numbers on each card are the numbers **within that
book**, which is how the textbooks and the board paper refer to them. Two chapters sit outside the
written paper and are badged accordingly: History's **The Age of Industrialisation** is periodic
assessment only, and Economics' **Consumer Rights** is project work. Geography's **Lifelines of
National Economy** is assessed through map work alone. Map-work items are called out in an exam
note in each chapter and are plotted, at real latitude and longitude, in the India locator
simulation.

Always cross-check with the NCERT textbook and the school teacher — this is a companion, not a
replacement.
