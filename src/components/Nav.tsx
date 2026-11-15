"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useShortlist } from "../hooks/useLocalState";
import { ROLE_LABEL } from "../lib/accounts";

type NavLink = { href: string; label: string; short?: string };

const SEEKER_LINKS: NavLink[] = [
  { href: "/matches", label: "Matches" },
  { href: "/opportunities", label: "All roles" },
  { href: "/shortlist", label: "Shortlist" },
  { href: "/how-it-works", label: "How it works" },
];

const EMPLOYER_LINKS: NavLink[] = [
  { href: "/employer", label: "Candidates" },
  { href: "/opportunities", label: "Roles" },
  { href: "/how-it-works", label: "How it works" },
];

const GUEST_LINKS: NavLink[] = [
  { href: "/opportunities", label: "Roles" },
  { href: "/employer", label: "For employers", short: "Employers" },
  { href: "/how-it-works", label: "How it works" },
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
  const { account, ready, signOut } = useAccount();
  const links = !account ? GUEST_LINKS : account.role === "employer" ? EMPLOYER_LINKS : SEEKER_LINKS;
  const profileActive = pathname.startsWith("/profile");
  return (
    <header className="sticky top-0 z-20 border-b border-ink bg-paper/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 px-4" aria-label="Main">
        <Link href="/" className="flex min-h-14 items-center gap-2.5 text-xl font-extrabold tracking-tight text-ink">
          <Mark />
          Pathway
        </Link>
        <div className={`ml-auto flex items-center gap-2 sm:order-last ${ready ? "" : "invisible"}`}>
          {account ? (
            <>
              <span className="hidden text-right text-xs leading-tight md:block">
                <span className="block font-bold text-ink">{account.name}</span>
                <span className="text-muted">{ROLE_LABEL[account.role]}</span>
              </span>
              {account.role === "seeker" && (
                <Link
                  href="/profile"
                  aria-current={profileActive ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center px-3 text-sm font-bold ${
                    profileActive ? "bg-ink text-paper" : "bg-field text-on-field hover:bg-field-deep"
                  }`}
                >
                  Your profile
                </Link>
              )}
              <button type="button" onClick={signOut} className="inline-flex min-h-10 items-center px-2 text-sm font-semibold text-muted hover:text-ink">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="inline-flex min-h-10 items-center px-2 text-sm font-semibold text-ink hover:underline">
                Sign in
              </Link>
              <Link href="/signup" className="inline-flex min-h-10 items-center bg-field px-3 text-sm font-bold text-on-field hover:bg-field-deep">
                Get started
              </Link>
            </>
          )}
        </div>
        <ul className="-mx-2 flex w-full flex-nowrap overflow-x-auto whitespace-nowrap text-sm sm:w-auto">
          {links.map((l) => {
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
                    <span className="ml-1.5 bg-ink px-1.5 text-xs font-bold tabular-nums text-paper">
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
