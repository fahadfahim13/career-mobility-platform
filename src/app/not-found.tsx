import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { btnPrimary, btnSecondary } from "../components/ui";

export default function NotFound() {
  return (
    <section className="grid gap-10 py-6 lg:grid-cols-12 lg:items-center" aria-labelledby="nf-h">
      <div className="lg:col-span-7">
        <p className="text-sm font-bold uppercase tracking-wider text-muted">Error 404</p>
        <h1 id="nf-h" className="mt-2 text-5xl font-extrabold tracking-tighter sm:text-7xl">Page not found.</h1>
        <p className="mt-4 max-w-md text-lg text-muted">This route doesn’t exist. It may have moved, or the link may be wrong.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/opportunities" className={btnPrimary}>
            Browse roles <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/" className={btnSecondary}>Back to home</Link>
        </div>
      </div>
      {/* A dead-end route, drawn in the logo's language: the path stops before the arrow. */}
      <svg viewBox="0 0 240 160" className="w-full max-w-sm lg:col-span-5" aria-hidden>
        <rect width="240" height="160" fill="var(--color-field)" />
        <path d="M40 130V70h100" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="square" />
        <path d="M160 70h10" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="14" strokeLinecap="square" strokeDasharray="4 8" />
        <path d="M182 46l24 24-24 24" fill="none" stroke="#ffd23f" strokeOpacity="0.35" strokeWidth="14" strokeLinecap="square" />
      </svg>
    </section>
  );
}
