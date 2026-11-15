import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHero } from "../components/PageHero";
import { btnOnField, btnOnFieldOutline } from "../components/ui";

export default function NotFound() {
  return (
    <PageHero
      eyebrow="Error 404"
      title="Page not found."
      intro="This route doesn’t exist. It may have moved, or the link may be wrong."
      aside={
        /* A dead-end route, drawn in the logo's language: the path stops before the arrow. */
        <svg viewBox="0 0 240 160" className="mx-auto w-full max-w-sm" aria-hidden>
          <rect width="240" height="160" fill="var(--color-field-deep)" />
          <path d="M40 130V70h100" fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="square" />
          <path d="M160 70h10" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="14" strokeLinecap="square" strokeDasharray="4 8" />
          <path d="M182 46l24 24-24 24" fill="none" stroke="#ffd23f" strokeOpacity="0.35" strokeWidth="14" strokeLinecap="square" />
        </svg>
      }
    >
      <div className="flex flex-wrap gap-3 pb-6">
        <Link href="/opportunities" className={btnOnField}>
          Browse roles <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href="/" className={btnOnFieldOutline}>Back to home</Link>
      </div>
    </PageHero>
  );
}
