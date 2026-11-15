import { ArrowRight, Check, Minus } from "lucide-react";
import Link from "next/link";
import { formatLocation, formatSalary, refCode, VISA_SUPPORT_LABEL } from "../lib/format";
import type { MatchResult } from "../lib/matching/types";
import type { Opportunity } from "../lib/types";
import { BandBadge, EligibilityTag, ScoreFigure } from "./badges";
import { FlagList } from "./FlagList";
import { ScoreStrip } from "./ScoreStrip";
import { ShortlistButton } from "./ShortlistButton";
import { btnDark } from "./ui";

export function opportunityMeta(opp: Opportunity): string {
  return [opp.organisation, formatLocation(opp), opp.remote ? "Remote" : null, opp.type === "internship" ? "Internship" : "Full-time"]
    .filter(Boolean)
    .join(" · ");
}

export function FactChips({ opp }: { opp: Opportunity }) {
  return (
    <ul className="flex flex-wrap gap-1.5 text-xs font-semibold">
      <li className="bg-slate-100 px-2 py-1">{formatSalary(opp)}</li>
      <li className={`px-2 py-1 ${opp.visaSupport === "offered" ? "bg-field-tint text-field-deep" : "bg-slate-100 text-muted"}`}>
        {VISA_SUPPORT_LABEL[opp.visaSupport]}
      </li>
      {opp.relocation.length > 0 && <li className="bg-slate-100 px-2 py-1">Relocation package · {opp.relocation.length} items</li>}
    </ul>
  );
}

/** One row of the ranked field: ref code, facts, score strip, then reasons. */
export function MatchCard({ opp, result, rank }: { opp: Opportunity; result: MatchResult; rank?: number }) {
  const { matched, missing } = result.skillCoverage;
  const total = matched.length + missing.length;
  return (
    <article className="border-t-2 border-ink px-1 pb-5 pt-4 sm:px-2" data-testid="match-card" aria-labelledby={`t-${opp.id}`}>
      <div className="grid gap-4 md:grid-cols-12 md:gap-6">
        <div className="flex gap-4 md:col-span-7">
          {rank !== undefined && (
            <span className="w-8 shrink-0 text-3xl font-extrabold leading-none tracking-tighter text-field">
              <span className="sr-only">Rank </span>
              {rank}
            </span>
          )}
          <div className="min-w-0">
            <h2 id={`t-${opp.id}`} className="text-xl font-bold leading-snug tracking-tight text-ink">
              <Link href={`/opportunities/${opp.id}`} className="hover:underline">{opp.title}</Link>
            </h2>
            <p className="mt-0.5 text-sm text-muted">{opportunityMeta(opp)}</p>
            <p className="mt-2 inline-block border-t border-ink pt-0.5 text-xs font-bold tracking-wider text-ink">Ref. {refCode(opp)}</p>
            <div className="mt-3">
              <FactChips opp={opp} />
            </div>
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="flex items-end justify-between gap-3">
            <ScoreFigure score={result.score} />
            <div className="flex flex-col items-end gap-1">
              <BandBadge band={result.band} />
              <EligibilityTag eligibility={result.eligibility} required={opp.localWorkAuthRequired} />
            </div>
          </div>
          <div className="mt-3">
            <ScoreStrip result={result} />
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">
            {matched.length} of {total} required skills
            {missing.length > 0 && <span className="font-normal text-muted"> · missing {missing.join(", ")}</span>}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 border-t border-line pt-4 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold text-met">Why it fits</h3>
          <ul className="mt-1.5 space-y-1 text-sm">
            {result.strengths.slice(0, 2).map((s) => (
              <li key={s} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-met" aria-hidden />
                {s}
              </li>
            ))}
            {result.strengths.length === 0 && <li className="text-muted">No clear strengths identified for this role.</li>}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-blocked">What to review</h3>
          <ul className="mt-1.5 space-y-1 text-sm">
            {result.gaps.slice(0, 2).map((g) => (
              <li key={g} className="flex gap-2">
                <Minus className="mt-0.5 size-4 shrink-0 text-blocked" aria-hidden />
                {g}
              </li>
            ))}
            {result.gaps.length === 0 && <li className="text-muted">No gaps identified.</li>}
          </ul>
        </div>
      </div>

      <div className="mt-3">
        <FlagList flags={result.flags.filter((f) => f.kind === "verify")} compact />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Link href={`/opportunities/${opp.id}`} className={btnDark}>
          View details
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <ShortlistButton id={opp.id} title={opp.title} />
      </div>
    </article>
  );
}
