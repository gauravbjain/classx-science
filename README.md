# ClassX — Science

An interactive learning site for **CBSE Class X Science, session 2026-27**. Built to be read on a
phone or a laptop, with a simulation you can actually play with in every chapter.

- 15 chapters, mapped line-by-line to the official CBSE Secondary Curriculum for Science (2026-27)
- 28 interactive simulations (ray diagrams, circuits, Punnett squares, pH scale, food chains…)
- 176 practice MCQs with explanations, and ~200 flashcards
- A `/revise` page with the full formula sheet, all flashcards, and a 25-question mixed test
- Progress tracking saved in the browser — nothing leaves the device
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

## How it is put together

```
app/
  layout.tsx                 root layout, theme script, fonts
  page.tsx                   subject home — chapter grid, marks split
  chapters/[slug]/page.tsx   one chapter (statically generated)
  revise/page.tsx            formula sheet, all flashcards, mixed test
components/
  ui/       Blocks.tsx (content renderer), Quiz, Flashcards, ChapterView, ReviseView
  sims/     optics · electricity · chemistry · biology · environment + registry.tsx
content/
  science/  ch01.ts … ch15.ts, index.ts
lib/
  types.ts  units.ts  progress.ts
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

Plus `formulas`, `examFocus`, `flashcards` and `quiz` arrays per chapter.

### Adding a simulation

1. Write the component in the right file under `components/sims/` (they use plain SVG + hooks,
   no chart libraries), wrapping it in `<SimFrame>`.
2. Export it, then add it to `REGISTRY` in `components/sims/registry.tsx` with an id.
3. Reference it from any chapter: `{ t: "sim", id: "your-id" }`.

### Adding another subject

Everything is already keyed by subject.

1. Create `content/maths/ch01.ts …` following the same `Chapter` type.
2. Export a `Subject` from `content/maths/index.ts` and add it to `SUBJECTS`.
3. Add unit keys and colours for the new subject in `lib/units.ts`.
4. Either move the routes under `app/[subject]/…`, or copy `app/page.tsx` to `app/maths/page.tsx`
   — the chapter route and every component already take the subject's data as a prop.

---

## A note on the syllabus

Content follows the official CBSE curriculum document for Class X Science, 2026-27
(`cbseacademic.nic.in`). Two chapters — **Periodic Classification of Elements** and **Evolution** —
are marked *formative assessment only*, meaning CBSE has excluded them from the year-end paper for
this session. They are included and clearly badged, since they still appear in periodic tests and
underpin other chapters. The same badge logic covers the motor / electromagnetic induction /
generator exclusion inside Chapter 14.

Always cross-check with the NCERT textbook and the school teacher — this is a companion, not a
replacement.
