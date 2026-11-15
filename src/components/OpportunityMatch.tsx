"use client";

import { ArrowRight, Check, Minus } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useProfile } from "../hooks/useLocalState";
import { matchOne } from "../lib/matching/engine";
import type { Opportunity } from "../lib/types";
import { BandBadge, EligibilityTag, ScoreFigure } from "./badges";
import { FlagList } from "./FlagList";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { ScoreStrip } from "./ScoreStrip";
import { SummaryPanel } from "./SummaryPanel";
import { btnPrimary, h2 } from "./ui";

/** Match section of the detail page; computed in the browser because the profile lives in localStorage. */
export function OpportunityMatch({ opp }: { opp: Opportunity }) {
  const [profile, , ready] = useProfile();
  const result = useMemo(() => (profile ? matchOne(profile, opp) : null), [profile, opp]);

  if (!ready) return <p className="text-sm text-muted" role="status">Calculating your match…</p>;
  if (!result || !profile) {
    return (
      <section className="on-field bg-field p-6 text-on-field">
        <h2 className="text-2xl font-extrabold tracking-tight">See how you fit this role</h2>
        <p className="mt-2 text-on-field-muted">Create a profile, or load the sample one, to get a score with its full arithmetic.</p>
        <Link href="/profile" className="mt-4 inline-flex min-h-11 items-center gap-2 bg-paper px-4 text-sm font-bold text-ink hover:bg-field-tint">
          Create your profile <ArrowRight className="size-4" aria-hidden />
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="match-h" className="on-field bg-field p-5 text-on-field sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="match-h" className="sr-only">Your fit for this role</h2>
            <ScoreFigure score={result.score} size="lg" onField />
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <BandBadge band={result.band} />
            <EligibilityTag eligibility={result.eligibility} required={opp.localWorkAuthRequired} />
          </div>
        </div>
        <div className="mt-6">
          <ScoreStrip result={result} variant="full" onField animate />
        </div>
        <p className="mt-4 text-xs text-on-field-muted">
          Your fit for this role. This score covers this role only. It is feedback, not an employer&apos;s decision and not an eligibility decision.
        </p>
      </section>

      <SummaryPanel opp={opp} result={result} profile={profile} />

      <FlagList flags={result.flags} />

      <section aria-labelledby="fit-h" className="grid gap-6 sm:grid-cols-2">
        <h2 id="fit-h" className="sr-only">Strengths and gaps</h2>
        <div className="border-t-2 border-met pt-3">
          <h3 className="font-bold">If this sounds like you, it is a good fit</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {result.strengths.map((s) => (
              <li key={s} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-met" aria-hidden />{s}</li>
            ))}
            {result.strengths.length === 0 && <li className="text-muted">No clear strengths identified.</li>}
          </ul>
        </div>
        <div className="border-t-2 border-blocked pt-3">
          <h3 className="font-bold">Review these before you apply</h3>
          <ul className="mt-2 space-y-1.5 text-sm">
            {result.gaps.map((g) => (
              <li key={g} className="flex gap-2"><Minus className="mt-0.5 size-4 shrink-0 text-blocked" aria-hidden />{g}</li>
            ))}
            {result.gaps.length === 0 && <li className="text-muted">No gaps identified.</li>}
          </ul>
        </div>
      </section>

      {result.nextSteps.length > 0 && (
        <section aria-labelledby="next-h" className="border-2 border-ink p-5">
          <h2 id="next-h" className={h2}>Improve your match</h2>
          <p className="mt-1 text-sm text-muted">Only add what genuinely reflects your experience. The score updates as soon as you save.</p>
          <ol className="mt-4 divide-y divide-line">
            {result.nextSteps.map((s, i) => (
              <li key={s.text} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex gap-3 text-sm">
                  <span className="font-extrabold text-field">{i + 1}</span>
                  {s.text}
                </span>
                <Link href={`/profile#${s.field}`} className="inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-bold text-field hover:underline">
                  Update profile <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section aria-labelledby="calc-h">
        <h2 id="calc-h" className={h2}>How this score was calculated</h2>
        <div className="mt-3">
          <ScoreBreakdown result={result} />
        </div>
        <Link href="/how-it-works" className={`${btnPrimary} mt-4`}>Read the full scoring rules</Link>
      </section>
    </div>
  );
}
