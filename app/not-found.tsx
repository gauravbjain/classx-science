import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-[2rem] font-semibold tracking-tight">Nothing here</h1>
      <p className="mt-2 muted">That chapter does not exist — yet.</p>
      <Link href="/" className="mt-6 inline-block rounded-full bg-[var(--accent)] px-5 py-2.5 text-[13px] font-medium text-white">
        Back to all chapters
      </Link>
    </div>
  );
}
