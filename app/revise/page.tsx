import { SCIENCE } from "@/content/science";
import ReviseView from "@/components/ui/ReviseView";

export const metadata = { title: "Revise" };

export default function RevisePage() {
  return <ReviseView chapters={SCIENCE.chapters} />;
}
