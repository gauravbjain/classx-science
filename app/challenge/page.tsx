import type { Metadata } from "next";
import type { Quiz } from "@/lib/types";
import { LIVE_SUBJECTS, getLiveSubject } from "@/content";
import { decodeChallenge } from "@/lib/challenge";
import ChallengeBuilder from "@/components/ui/ChallengeBuilder";
import ChallengePlay from "@/components/ui/ChallengePlay";

export const metadata: Metadata = { title: "Challenge · ClassX" };

export default async function ChallengePage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;

  if (d) {
    const spec = decodeChallenge(d);
    const subject = spec ? getLiveSubject(spec.s) : undefined;
    if (spec && subject) {
      const questions = spec.q
        .map(([slug, idx]) => subject.chapters.find((c) => c.slug === slug)?.quiz[idx])
        .filter((q): q is Quiz => !!q);
      if (questions.length) {
        return <ChallengePlay title={spec.t} subjectName={subject.name} subjectSlug={subject.slug} questions={questions} />;
      }
    }
    // fall through to the builder if the link was malformed
  }

  const subjects = LIVE_SUBJECTS.map((s) => ({
    slug: s.slug, name: s.name, accent: s.accent,
    chapters: s.chapters.map((c) => ({ slug: c.slug, quiz: c.quiz.length })),
  }));
  return <ChallengeBuilder subjects={subjects} />;
}
