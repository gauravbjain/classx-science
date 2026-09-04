# Adding a subject

The site is multi-subject from day one. Adding Maths or Social Science later is a **content**
change, not a refactor — no route moves, no URL changes, nothing that breaks a link your nephew
has already bookmarked.

## URL contract

These are fixed. Once a chapter is published at a URL it should never move.

```
/                              the library — every subject
/science                       subject home — chapter grid, marks split, progress
/science/electricity           a chapter
/science/revise                formula sheet · flashcards · mixed test
/mathematics                   …and the same three shapes for every future subject
```

Because slugs are the URL, **do not rename a `slug` after publishing.** Change the `title`
freely; leave the slug alone.

---

## The five steps

### 1. Create the folder

```bash
cp -r content/_template content/mathematics
```

You get `subject.template.ts` and `chapter.template.ts`. Rename them as you go.

### 2. Define the units

In `content/mathematics/units.ts`, list the units (themes) of the syllabus with their marks and
one colour each. Everything visual — the chapter card stripe, the unit chip, the marks bar —
is derived from that single `hue`, so there is no palette file to edit and no Tailwind classes
to keep in sync.

### 3. Write the chapters

One file per chapter, `ch01.ts … chNN.ts`, following `chapter.template.ts`. Chapters are plain
typed data, not JSX — the renderer, quiz engine and flashcard deck are already built.

The block types available are listed in the template and in the README table.

### 4. Export the subject

`content/mathematics/index.ts`:

```ts
import type { Subject } from "@/lib/types";
import { UNITS, UNIT_ORDER } from "./units";
import { ch01 } from "./ch01";
// …

export const MATHEMATICS: Subject = { /* …see subject.template.ts… */ };
```

### 5. Register it

In `content/index.ts`, import it and put it in the array — replacing its `planned(...)`
placeholder if it has one:

```ts
import { MATHEMATICS } from "./mathematics";

export const SUBJECTS: Subject[] = [SCIENCE, MATHEMATICS, planned("social-science", …)];
```

That is the whole change. `npm run build` regenerates every page, the header gains a subject
switcher automatically, the library home lists it, and progress starts tracking under its own
namespace.

---

## Shipping half a subject

You do not have to finish a subject before pushing it. Two options:

- **Ship the chapters you have.** Include only the finished chapters in the `chapters` array. The
  chapter numbers, the progress denominator and the marks bar all follow the array, so a
  five-chapter Maths is a perfectly consistent site. Add the rest in later commits.
- **Announce it without shipping it.** Leave the `planned("mathematics", …)` entry in
  `content/index.ts`. It shows as a dashed *coming next* card on the home page, is not clickable,
  and generates no routes.

Either way, every push to `main` redeploys on Vercel in about a minute, and he just refreshes.

---

## Adding a simulation

1. Write the component in the matching file under `components/sims/` — they are plain SVG plus
   React hooks, no chart library — and wrap it in `<SimFrame>` from `./shell`.
2. Add its id to `SIM_IDS` in `lib/sim-ids.ts`.
3. Add it to `REGISTRY` in `components/sims/registry.tsx`.
4. Use it from any chapter: `{ t: "sim", id: "your-id" }`.

TypeScript enforces steps 2 and 3 against each other, and enforces that every `sim` block in every
chapter names an id that actually exists. A typo fails `npm run build` rather than rendering a
blank space.

---

## What the build checks for you

`content/index.ts` validates every subject at build time (`lib/validate.ts`). The build fails, with
the offending chapter named, if:

- two subjects or two chapters share a slug, or a slug is not lowercase kebab-case
- a chapter's `unit` is not defined in that subject's units, or is missing from `unitOrder`
- a quiz question's `answer` index is out of range, has fewer than two options, or has no explanation
- a live subject has no chapters, or a chapter has no blocks, quiz or flashcards

So the failure mode for a content mistake is a red build on Vercel, not a broken page your nephew
finds first.
