import { ArrowRight, Check, Minus } from "lucide-react";
import Link from "next/link";
import type { MatchResult } from "../lib/matching/types";
import { formatLocation } from "../lib/format";
import type { Opportunity } from "../lib/types";
import { BandBadge, ScorePill, VerifyBadge } from "./badges";
import { FlagList } from "./FlagList";
import { ShortlistButton } from "./ShortlistButton";
import { btnDark, panel } from "./ui";

export function opportunityMeta(opp: Opportunity): string {
  return [opp.organisation, formatLocation(opp), opp.remote ? "Remote" : null, opp.type === "internship" ? "Internship" : "Full-time role"]
    .filter(Boolean)
    .join(" · ");
}

export function MatchCard({ opp, result, rank }: { opp: Opportunity; result: MatchResult; rank?: number }) {
  return (
    <article className={`${panel} p-5 sm:p-6`} data-testid="match-card" aria-labelledby={`t-${opp.id}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 id={`t-${opp.id}`} className="text-lg font-semibold text-ink">
            {rank !== undefined && <span className="mr-2 tabular-nums text-slate-500">{rank}.</span>}
            <Link href={`/opportunities/${opp.id}`} className="hover:underline">{opp.title}</Link>
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">{opportunityMeta(opp)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end sm:gap-1.5">
          <ScorePill score={result.score} />
          <BandBadge band={result.band} />
          <VerifyBadge show={result.flags.some((f) => f.kind === "verify")} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">Strengths</h3>
          <ul className="mt-1.5 space-y-1 text-sm text-slate-700">
            {result.strengths.slice(0, 3).map((s) => (
              <li key={s} className="flex gap-2">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-700" aria-hidden />
                {s}
              </li>
            ))}
            {result.strengths.length === 0 && <li className="text-slate-500">No clear strengths identified for this role.</li>}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink">Gaps</h3>
          <ul className="mt-1.5 space-y-1 text-sm text-slate-700">
            {result.gaps.slice(0, 3).map((g) => (
              <li key={g} className="flex gap-2">
                <Minus className="mt-0.5 size-4 shrink-0 text-red-700" aria-hidden />
                {g}
              </li>
            ))}
            {result.gaps.length === 0 && <li className="text-slate-500">No gaps identified.</li>}
          </ul>
        </div>
      </div>

      <div className="mt-4">
        <FlagList flags={result.flags.filter((f) => f.kind !== "critical")} compact />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <Link href={`/opportunities/${opp.id}`} className={btnDark}>
          View details
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        <ShortlistButton id={opp.id} title={opp.title} />
      </div>
    </article>
  );
}
