import Link from "next/link";
import { formatLanguage, refCode } from "../lib/format";
import type { Opportunity } from "../lib/types";
import { FactChips, opportunityMeta } from "./MatchCard";
import { ShortlistButton } from "./ShortlistButton";

/** Compact, unranked listing row. `aside` adds a score; `children` adds tracker controls below. */
export function OpportunityRow({ opp, aside, children }: { opp: Opportunity; aside?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <li className="border-t-2 border-ink bg-white px-4 py-4 sm:px-5" data-testid="opportunity-row">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link href={`/opportunities/${opp.id}`} className="text-lg font-bold tracking-tight hover:underline">{opp.title}</Link>
          <p className="mt-0.5 text-sm text-muted">{opportunityMeta(opp)}</p>
          <p className="mt-2 inline-block border-t border-ink pt-0.5 text-xs font-bold tracking-wider">Ref. {refCode(opp)}</p>
          <div className="mt-3">
            <FactChips opp={opp} />
          </div>
          <p className="mt-3 text-sm">
            <span className="font-bold">Required skills:</span> {opp.requiredSkills.join(", ")}
          </p>
          <p className="text-sm">
            <span className="font-bold">Languages:</span> {opp.languages.map(formatLanguage).join(", ")}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end">
          {aside}
          <ShortlistButton id={opp.id} title={opp.title} />
        </div>
      </div>
      {children}
    </li>
  );
}
