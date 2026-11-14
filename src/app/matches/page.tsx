"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MatchCard } from "../../components/MatchCard";
import { btnPrimary, panel } from "../../components/ui";
import { useProfile } from "../../hooks/useLocalState";
import { getOpportunities, getOpportunity } from "../../lib/data";
import { CRITICAL_CAP, rankOpportunities } from "../../lib/matching/engine";
import type { Band } from "../../lib/matching/types";

const FILTERS: { value: "All" | Band; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Strong", label: "Strong" },
  { value: "Partial", label: "Partial" },
  { value: "Weak", label: "Weak" },
  { value: "Critical gap", label: "Critical gap" },
];

export default function MatchesPage() {
  const [profile, , ready] = useProfile();
  const [filter, setFilter] = useState<"All" | Band>("All");
  const results = useMemo(() => (profile ? rankOpportunities(profile, getOpportunities()) : []), [profile]);

  if (!ready) return <p className="text-sm text-slate-600" role="status">Loading your matches…</p>;

  if (!profile) {
    return (
      <div className={`${panel} mx-auto max-w-xl p-8 text-center`}>
        <UserRound className="mx-auto size-8 text-brand-600" aria-hidden />
        <h1 className="mt-3 text-xl font-semibold text-ink">Create a profile to see your matches</h1>
        <p className="mt-2 text-sm text-slate-600">
          It takes about two minutes. You can also load the sample profile to explore the platform.
        </p>
        <Link href="/profile" className={`${btnPrimary} mt-5`}>Create profile</Link>
      </div>
    );
  }

  const count = (f: "All" | Band) => (f === "All" ? results.length : results.filter((r) => r.band === f).length);
  const shown = filter === "All" ? results : results.filter((r) => r.band === filter);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Your ranked matches</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Each score is calculated from six weighted criteria: skills (30), experience (20), education (15), location
          (15), language (10) and career interests (10). If a hard requirement is not met, the score is capped at{" "}
          {CRITICAL_CAP}. <Link href="/profile" className="font-medium text-brand-700 underline">Edit your profile</Link>
        </p>
      </header>

      <div role="group" aria-label="Filter by match level" className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`inline-flex min-h-10 items-center rounded-full px-4 text-sm transition-colors duration-150 ${
              filter === f.value ? "bg-ink font-medium text-white" : "border border-slate-300 bg-white text-slate-700 hover:border-slate-400"
            }`}
          >
            {f.label}
            <span className="ml-1.5 tabular-nums opacity-75">{count(f.value)}</span>
          </button>
        ))}
      </div>

      <p className="sr-only" role="status">{shown.length} opportunities shown</p>

      <div className="space-y-4">
        {shown.map((r) => (
          <MatchCard key={r.opportunityId} opp={getOpportunity(r.opportunityId)!} result={r} rank={results.indexOf(r) + 1} />
        ))}
        {shown.length === 0 && <p className={`${panel} p-6 text-sm text-slate-600`}>No opportunities fall into this category.</p>}
      </div>
    </div>
  );
}
