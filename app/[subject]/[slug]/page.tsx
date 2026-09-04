import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LIVE_SUBJECTS, getLiveSubject } from "@/content";
import ChapterView from "@/components/ui/ChapterView";

export function generateStaticParams() {
  return LIVE_SUBJECTS.flatMap((s) => s.chapters.map((c) => ({ subject: s.slug, slug: c.slug })));
}

export async function generateMetadata(
  { params }: { params: Promise<{ subject: string; slug: string }> }
): Promise<Metadata> {
  const { subject, slug } = await params;
  const s = getLiveSubject(subject);
  const ch = s?.chapters.find((c) => c.slug === slug);
  if (!s || !ch) return {};
  return { title: `${ch.title} · ${s.name}`, description: ch.blurb };
}

export default async function ChapterPage(
  { params }: { params: Promise<{ subject: string; slug: string }> }
) {
  const { subject, slug } = await params;
  const s = getLiveSubject(subject);
  if (!s) notFound();
  const i = s.chapters.findIndex((c) => c.slug === slug);
  if (i === -1) notFound();

  const ch = s.chapters[i];
  const prev = s.chapters[i - 1];
  const next = s.chapters[i + 1];

  return (
    <ChapterView
      ch={ch}
      subjectSlug={s.slug}
      subjectName={s.name}
      unit={s.units[ch.unit]}
      prev={prev && { slug: prev.slug, title: prev.title, num: prev.num }}
      next={next && { slug: next.slug, title: next.title, num: next.num }}
    />
  );
}
