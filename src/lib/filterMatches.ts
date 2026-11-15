import type { Band, Eligibility, MatchResult } from "./matching/types";
import type { Opportunity } from "./types";

export interface MatchRow {
  opp: Opportunity;
  result: MatchResult;
}

export type MatchSort = "fit" | "eligibility";

export interface MatchFilters {
  band: Band | "all";
  country: string | "all";
  eligibility: Eligibility | "all";
  /** Only roles where the employer offers, or will consider, visa support. */
  visaSupportOnly: boolean;
  sort: MatchSort;
}

export const DEFAULT_FILTERS: MatchFilters = { band: "all", country: "all", eligibility: "all", visaSupportOnly: false, sort: "fit" };

const ELIGIBILITY_ORDER: Record<Eligibility, number> = { clear: 0, verify: 1, blocked: 2 };

/** Pure filter over rows already in rank order. "fit" keeps the engine's order. */
export function filterMatches(rows: MatchRow[], f: MatchFilters): MatchRow[] {
  const out = rows.filter(
    ({ opp, result }) =>
      (f.band === "all" || result.band === f.band) &&
      (f.country === "all" || opp.country === f.country) &&
      (f.eligibility === "all" || result.eligibility === f.eligibility) &&
      (!f.visaSupportOnly || opp.visaSupport !== "not-offered"),
  );
  if (f.sort === "eligibility") {
    return [...out].sort(
      (a, b) => ELIGIBILITY_ORDER[a.result.eligibility] - ELIGIBILITY_ORDER[b.result.eligibility] || b.result.score - a.result.score,
    );
  }
  return out;
}
