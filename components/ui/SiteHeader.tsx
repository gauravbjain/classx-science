"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LIVE_SUBJECTS } from "@/content";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  const path = usePathname() ?? "/";
  const seg = path.split("/")[1] ?? "";
  const current = LIVE_SUBJECTS.find((s) => s.slug === seg);
  const multi = LIVE_SUBJECTS.length > 1;

  // One pill per subject. Inline on wide screens; its own scrollable row
  // underneath on phones, so adding more subjects never crowds the logo
  // or the Revise button.
  const pills = LIVE_SUBJECTS.map((s) => (
    <Link
      key={s.slug}
      href={`/${s.slug}`}
      className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] font-medium transition ${
        current?.slug === s.slug ? "bg-[var(--surface-2)]" : "faint hover:bg-[var(--surface-2)]"
      }`}
    >
      {s.name}
    </Link>
  ));

  return (
    <header className="no-print sticky top-0 z-40 border-b hairline bg-[var(--bg)]">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg text-[13px] font-bold text-white"
            style={{ background: current?.accent ?? "var(--accent)" }}>X</span>
          <span className="text-[15px]">ClassX</span>
        </Link>

        {multi ? (
          <nav className="hidden min-w-0 gap-1 overflow-x-auto no-scrollbar sm:flex">{pills}</nav>
        ) : (
          <span className="hidden truncate text-[13px] faint sm:inline">
            {current ? `${current.name} · ${current.board} ${current.session}` : "CBSE Class X"}
          </span>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {current && (
            <Link href={`/${current.slug}/revise`}
              className="rounded-full border hairline px-3 py-1.5 text-[13px] font-medium transition hover:bg-[var(--surface-2)]">
              Revise
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>

      {multi && (
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto no-scrollbar px-5 pb-2 sm:hidden">
          {pills}
        </nav>
      )}
    </header>
  );
}
