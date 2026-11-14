"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProfile } from "../hooks/useLocalState";
import { matchOne } from "../lib/matching/engine";
import type { Opportunity } from "../lib/types";
import { BandBadge, ScorePill } from "./badges";
import { FlagList } from "./FlagList";
import { panel } from "./ui";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { SummaryPanel } from "./SummaryPanel";

/** Match section of the detail page; computed in the browser because the profile lives in localStorage. */
export function OpportunityMatch({ opp }: { opp: Opportunity }) {
  const [profile, , ready] = useProfile();
  const result = useMemo(() => (profile ? matchOne(profile, opp) : null), [profile, opp]);

  if (!ready) return <p className="text-sm text-slate-600" role="status">Calculating your match…</p>;
  if (!result) {
    return (
      <p className={`${panel} self-start p-5 text-sm text-slate-600`}>
        <Link href="/profile" className="font-medium text-brand-700 underline">Create a profile</Link> to see how well this role matches your background.
      </p>
    );
  }

  return (
    <section aria-labelledby="match-h" className={`${panel} space-y-5 p-5 sm:p-6`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="match-h" className="text-lg font-semibold text-ink">Your match assessment</h2>
        <div className="flex items-center gap-3">
          <ScorePill score={result.score} />
          <BandBadge band={result.band} />
        </div>
      </div>
      <SummaryPanel opp={opp} result={result} />
      <FlagList flags={result.flags} />
      <div>
        <h3 className="mb-2 text-sm font-semibold text-ink">Score breakdown</h3>
        <ScoreBreakdown result={result} />
      </div>
    </section>
  );
}
