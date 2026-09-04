"use client";
import { useEffect, useState } from "react";
import { subjectStats } from "@/lib/progress";

export default function LibraryProgress({
  subject, total, accent,
}: { subject: string; total: number; accent: string }) {
  const [read, setRead] = useState<number | null>(null);
  useEffect(() => {
    const sync = () => setRead(subjectStats(subject).read);
    sync();
    window.addEventListener("classx-progress", sync);
    return () => window.removeEventListener("classx-progress", sync);
  }, [subject]);

  if (read === null) return <div className="mt-4 h-[1.9rem]" />;
  return (
    <div className="mt-4">
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
        <div className="h-full rounded-full transition-all"
          style={{ width: `${(read / total) * 100}%`, background: accent }} />
      </div>
      <div className="mt-1.5 text-[11px] faint">{read} of {total} chapters opened</div>
    </div>
  );
}
