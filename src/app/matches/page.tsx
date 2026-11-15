"use client";

import { ArrowRight, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MatchCard } from "../../components/MatchCard";
import { btnPrimary, btnSecondary, field, fieldLabel, pageTitle, textLink } from "../../components/ui";
import { useProfile } from "../../hooks/useLocalState";
import { getOpportunities } from "../../lib/data";
import { DEFAULT_FILTERS, filterMatches, type MatchFilters, type MatchRow } from "../../lib/filterMatches";
import { rankOpportunities } from "../../lib/matching/engine";
import type { Band } from "../../lib/matching/types";
import { profileStrength } from "../../lib/profileStrength";

const BANDS: { value: "all" | Band; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Strong", label: "Strong" },
  { value: "Partial", label: "Partial" },
  { value: "Weak", label: "Weak" },
  { value: "Critical gap", label: "Critical gap" },
];

export default function MatchesPage() {
  const [profile, , ready] = useProfile();
  const [filters, setFilters] = useState<MatchFilters>(DEFAULT_FILTERS);
  const rows: MatchRow[] = useMemo(() => {
    if (!profile) return [];
    const opps = getOpportunities();
    const byId = new Map(opps.map((o) => [o.id, o]));
    return rankOpportunities(profile, opps).map((result) => ({ opp: byId.get(result.opportunityId)!, result }));
  }, [profile]);

  if (!ready) return <p className="text-sm text-muted" role="status">Loading your matches…</p>;

  if (!profile) {
    return (
      <div className="mx-auto max-w-xl border-t-4 border-field bg-white p-8 text-center">
        <UserRound className="mx-auto size-8 text-field" aria-hidden />
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Create a profile to see your matches</h1>
        <p className="mt-2 text-sm text-muted">It takes about five minutes. You can also load the sample profile to explore the platform.</p>
        <Link href="/profile" className={`${btnPrimary} mt-5`}>Create profile</Link>
      </div>
    );
  }

  const set = <K extends keyof MatchFilters>(k: K, v: MatchFilters[K]) => setFilters((f) => ({ ...f, [k]: v }));
  const shown = filterMatches(rows, filters);
  const countries = [...new Set(rows.map((r) => r.opp.country))].sort();
  const rankOf = new Map(rows.map((r, i) => [r.result.opportunityId, i + 1]));
  const bandCount = (b: "all" | Band) => (b === "all" ? rows.length : rows.filter((r) => r.result.band === b).length);
  const strength = profileStrength(profile);
  const verifyCount = rows.filter((r) => r.result.eligibility === "verify").length;

  return (
    <div className="space-y-8">
      <header className="grid gap-6 border-b-2 border-ink pb-8 md:grid-cols-12">
        <div className="md:col-span-8">
          <h1 className={pageTitle}>Your ranked matches</h1>
          <p className="mt-3 max-w-2xl text-muted">
            Twelve roles in six countries, scored on six weighted criteria. The strip under each score shows where the
            points came from. Eligibility is shown separately and never changes the score.{" "}
            <Link href="/how-it-works" className={textLink}>How matching works</Link>
          </p>
        </div>
        <dl className="grid grid-cols-3 gap-px self-end bg-line text-center md:col-span-4">
          <div className="bg-paper p-3">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">Strong</dt>
            <dd className="text-3xl font-extrabold">{bandCount("Strong")}</dd>
          </div>
          <div className="bg-paper p-3">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">To verify</dt>
            <dd className="text-3xl font-extrabold">{verifyCount}</dd>
          </div>
          <div className="bg-paper p-3">
            <dt className="text-xs font-bold uppercase tracking-wide text-muted">Profile</dt>
            <dd className="text-3xl font-extrabold">{strength.percent}%</dd>
          </div>
        </dl>
      </header>

      {strength.missing.length > 0 && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 bg-verify-tint px-4 py-3 text-sm">
          <span className="font-bold">Your profile is {strength.percent}% complete.</span>
          <span>Missing: {strength.missing.join(", ")}.</span>
          <Link href="/profile" className={`${textLink} inline-flex items-center gap-1`}>
            Complete profile <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </p>
      )}

      <section aria-label="Filter and sort" className="space-y-4">
        <div role="group" aria-label="Filter by match level" className="flex flex-wrap gap-1.5">
          {BANDS.map((b) => (
            <button
              key={b.value}
              type="button"
              aria-pressed={filters.band === b.value}
              onClick={() => set("band", b.value)}
              className={`inline-flex min-h-10 items-center px-3.5 text-sm transition-colors duration-150 ${
                filters.band === b.value ? "bg-ink font-bold text-paper" : "border border-slate-300 bg-white font-medium hover:border-ink"
              }`}
            >
              {b.label}
              <span className="ml-1.5 tabular-nums opacity-70">{bandCount(b.value)}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div>
            <label htmlFor="f-country" className={fieldLabel}>Country</label>
            <select id="f-country" className={field} value={filters.country} onChange={(e) => set("country", e.target.value)}>
              <option value="all">All countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="f-elig" className={fieldLabel}>Right to work</label>
            <select id="f-elig" className={field} value={filters.eligibility} onChange={(e) => set("eligibility", e.target.value as MatchFilters["eligibility"])}>
              <option value="all">Any status</option>
              <option value="clear">Confirmed or not required</option>
              <option value="verify">Needs verification</option>
              <option value="blocked">Not held</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="f-sort" className={fieldLabel}>Sort by</label>
            <select id="f-sort" className={field} value={filters.sort} onChange={(e) => set("sort", e.target.value as MatchFilters["sort"])}>
              <option value="fit">Best fit</option>
              <option value="eligibility">Eligibility first, then fit</option>
            </select>
          </div>
          <label className="col-span-2 flex min-h-11 items-center gap-2.5 self-end border lg:col-span-1 border-slate-300 bg-white px-3 text-sm font-semibold">
            <input type="checkbox" className="size-4" checked={filters.visaSupportOnly} onChange={(e) => set("visaSupportOnly", e.target.checked)} />
            Employer offers visa support
          </label>
        </div>
      </section>

      <p className="text-sm font-semibold" role="status">
        Showing {shown.length} of {rows.length} roles
      </p>

      <div className="space-y-6">
        {shown.map((r) => (
          <MatchCard key={r.result.opportunityId} opp={r.opp} result={r.result} rank={rankOf.get(r.result.opportunityId)} />
        ))}
        {shown.length === 0 && (
          <div className="border-t-2 border-ink bg-white p-8 text-center">
            <p className="font-bold">No roles match these filters.</p>
            <button type="button" className={`${btnSecondary} mt-4`} onClick={() => setFilters(DEFAULT_FILTERS)}>
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
