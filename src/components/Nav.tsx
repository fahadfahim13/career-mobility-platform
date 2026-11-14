"use client";

import { Compass } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useShortlist } from "../hooks/useLocalState";

const LINKS = [
  { href: "/profile", label: "Profile" },
  { href: "/matches", label: "Matches" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/shortlist", label: "Shortlist" },
];

export function Nav() {
  const pathname = usePathname();
  const { ids } = useShortlist();
  return (
    <header className="border-b border-line bg-white">
      <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-1 px-4 py-2" aria-label="Main">
        <Link href="/" className="flex min-h-11 items-center gap-2 text-lg font-semibold text-ink">
          <Compass className="size-5 text-brand-600" aria-hidden />
          Pathway
        </Link>
        <ul className="-mx-2 flex flex-wrap text-sm">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center rounded-md px-2 transition-colors duration-150 ${
                    active ? "font-semibold text-brand-700" : "text-slate-600 hover:text-ink"
                  }`}
                >
                  {l.label}
                  {l.href === "/shortlist" && ids.length > 0 && (
                    <span className="ml-1.5 rounded-full bg-brand-50 px-1.5 text-xs font-semibold tabular-nums text-brand-700">
                      {ids.length}
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
