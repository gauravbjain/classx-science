import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b hairline backdrop-blur-xl bg-[var(--bg)]">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent)] text-white text-[13px] font-bold">
            X
          </span>
          <span className="text-[15px]">ClassX</span>
        </Link>
        <span className="hidden sm:inline text-[13px] faint">Science · CBSE 2026-27</span>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/revise"
            className="rounded-full border hairline px-3 py-1.5 text-[13px] font-medium transition hover:bg-[var(--surface-2)]"
          >
            Revise
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
