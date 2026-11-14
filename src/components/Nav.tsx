"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShortlist } from "../hooks/useLocalState";

const LINKS = [
  { href: "/profile", label: "Profile" },
  { href: "/matches", label: "Matches" },
  { href: "/opportunities", label: "All opportunities" },
  { href: "/shortlist", label: "Shortlist" },
];

export function Nav() {
  const pathname = usePathname();
  const { ids } = useShortlist();
  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3" aria-label="Main">
        <Link href="/" className="text-lg font-semibold text-ink">
          Pathway
        </Link>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href + "/"));
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={active ? "font-semibold text-brand-700" : "text-slate-600 hover:text-ink"}
                >
                  {l.label}
                  {l.href === "/shortlist" && ids.length > 0 ? ` (${ids.length})` : ""}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
