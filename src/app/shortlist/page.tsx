"use client";

import Link from "next/link";
import { BandBadge, VerifyBadge } from "../../components/badges";
import { OpportunityRow } from "../../components/OpportunityRow";
import { useProfile, useShortlist } from "../../hooks/useLocalState";
import { getOpportunity } from "../../lib/data";
import { matchOne } from "../../lib/matching/engine";
import type { Opportunity } from "../../lib/types";

export default function ShortlistPage() {
  const { ids, ready } = useShortlist();
  const [profile] = useProfile();

  if (!ready) return <p className="text-sm text-slate-600" role="status">Loading your shortlist…</p>;

  // Ids for roles that no longer exist are skipped rather than crashing the page.
  const opps = ids.map(getOpportunity).filter((o): o is Opportunity => o !== undefined);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Your shortlist</h1>
        <p className="mt-2 text-slate-600">Opportunities you have saved. Your shortlist is stored only in this browser.</p>
      </header>
      {opps.length === 0 ? (
        <div className="mx-auto max-w-xl rounded-lg border border-line bg-white p-8 text-center">
          <p className="font-semibold text-ink">Your shortlist is empty</p>
          <p className="mt-1 text-sm text-slate-600">
            Select <span className="font-medium">Shortlist</span> on any opportunity to save it here.
          </p>
          <Link href="/matches" className="mt-4 inline-block text-sm font-medium text-brand-700 underline">Review your matches</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {opps.map((o) => {
            const r = profile ? matchOne(profile, o) : null;
            return (
              <OpportunityRow
                key={o.id}
                opp={o}
                aside={r && (
                  <span className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-semibold tabular-nums">{r.score}/100</span>
                    <BandBadge band={r.band} />
                    <VerifyBadge show={r.flags.some((f) => f.kind === "verify")} />
                  </span>
                )}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
}
