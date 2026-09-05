import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LIVE_SUBJECTS, getLiveSubject } from "@/content";
import MockPaper from "@/components/ui/MockPaper";

export function generateStaticParams() {
  return LIVE_SUBJECTS.map((s) => ({ subject: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }): Promise<Metadata> {
  const s = getLiveSubject((await params).subject);
  return s ? { title: `${s.name} — Mock Paper` } : {};
}

export default async function MockPage({ params }: { params: Promise<{ subject: string }> }) {
  const s = getLiveSubject((await params).subject);
  if (!s) notFound();
  return <MockPaper subject={s} />;
}
