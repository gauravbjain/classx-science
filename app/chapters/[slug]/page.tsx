import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SCIENCE } from "@/content/science";
import ChapterView from "@/components/ui/ChapterView";

export function generateStaticParams() {
  return SCIENCE.chapters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ch = SCIENCE.chapters.find((c) => c.slug === slug);
  if (!ch) return {};
  return { title: ch.title, description: ch.blurb };
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = SCIENCE.chapters.findIndex((c) => c.slug === slug);
  if (i === -1) notFound();
  const ch = SCIENCE.chapters[i];
  const prev = SCIENCE.chapters[i - 1];
  const next = SCIENCE.chapters[i + 1];
  return (
    <ChapterView
      ch={ch}
      prev={prev && { slug: prev.slug, title: prev.title, num: prev.num }}
      next={next && { slug: next.slug, title: next.title, num: next.num }}
    />
  );
}
