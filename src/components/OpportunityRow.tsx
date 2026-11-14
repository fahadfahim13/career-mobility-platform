import Link from "next/link";
import { formatLanguage } from "../lib/format";
import type { Opportunity } from "../lib/types";
import { opportunityMeta } from "./MatchCard";
import { ShortlistButton } from "./ShortlistButton";
import { panel } from "./ui";

/** Compact, unranked listing row. `aside` lets callers add a score next to the shortlist control. */
export function OpportunityRow({ opp, aside }: { opp: Opportunity; aside?: React.ReactNode }) {
  return (
    <li className={`${panel} flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5`} data-testid="opportunity-row">
      <div className="min-w-0 flex-1">
        <Link href={`/opportunities/${opp.id}`} className="font-semibold text-ink hover:underline">{opp.title}</Link>
        <p className="mt-0.5 text-sm text-slate-600">{opportunityMeta(opp)}</p>
        <p className="mt-1.5 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Required skills:</span> {opp.requiredSkills.join(", ")}
        </p>
        <p className="text-sm text-slate-600">
          <span className="font-medium text-slate-700">Languages:</span>{" "}
          {opp.languages.map(formatLanguage).join(", ")}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {aside}
        <ShortlistButton id={opp.id} title={opp.title} />
      </div>
    </li>
  );
}
