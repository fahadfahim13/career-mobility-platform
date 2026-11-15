"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShortlist } from "../hooks/useLocalState";

const LINKS: { href: string; label: string; short?: string }[] = [
  { href: "/matches", label: "Matches" },
  { href: "/opportunities", label: "All roles" },
  { href: "/shortlist", label: "Shortlist" },
  { href: "/how-it-works", label: "How matching works", short: "How it works" },
];

/** Square route mark: a path that turns once, set in the field colour. */
export function Mark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden>
      <rect width="28" height="28" fill="var(--color-field)" />
      <path d="M7 21V12h14" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="square" />
      <path d="M16.5 7.5 21 12l-4.5 4.5" fill="none" stroke="#ffd23f" strokeWidth="3.2" strokeLinecap="square" />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  const { ids } = useShortlist();
  const profileActive = pathname.startsWith("/profile");
  return (
    <header className="sticky top-0 z-20 border-b border-ink bg-paper/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 px-4" aria-label="Main">
        <Link href="/" className="flex min-h-14 items-center gap-2.5 text-xl font-extrabold tracking-tight text-ink">
          <Mark />
          Pathway
        </Link>
        <Link
          href="/profile"
          aria-current={profileActive ? "page" : undefined}
          className={`ml-auto inline-flex min-h-10 items-center px-3 text-sm font-bold sm:order-last ${
            profileActive ? "bg-ink text-paper" : "bg-field text-on-field hover:bg-field-deep"
          }`}
        >
          Your profile
        </Link>
        <ul className="-mx-2 flex w-full flex-nowrap overflow-x-auto whitespace-nowrap text-sm sm:w-auto">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center border-b-[3px] px-2 transition-colors duration-150 ${
                    active ? "border-field font-bold text-ink" : "border-transparent font-medium text-muted hover:text-ink"
                  }`}
                >
                  {l.short ? (
                    <>
                      <span className="sm:hidden">{l.short}</span>
                      <span className="hidden sm:inline">{l.label}</span>
                    </>
                  ) : (
                    l.label
                  )}
                  {l.href === "/shortlist" && ids.length > 0 && (
                    <span className="ml-1.5 bg-verify px-1.5 text-xs font-bold tabular-nums text-ink">
                      {ids.length}
                      <span className="sr-only"> saved roles</span>
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
