import type { Candidate } from "../data/candidates";
import { matchOne } from "./matching/engine";
import type { MatchResult } from "./matching/types";
import type { Opportunity } from "./types";

export interface CandidateRow {
  candidate: Candidate;
  result: MatchResult;
}

export type CandidateSort = "fit" | "eligibility";

const ELIGIBILITY_ORDER = { clear: 0, verify: 1, blocked: 2 } as const;

/**
 * The employer view runs the same engine in reverse: one role against many candidates.
 * Ties break on name so the order never changes between renders.
 */
export function rankCandidates(opp: Opportunity, pool: Candidate[], sort: CandidateSort = "fit"): CandidateRow[] {
  const rows = pool.map((candidate) => ({ candidate, result: matchOne(candidate.profile, opp) }));
  return rows.sort((a, b) => {
    if (sort === "eligibility") {
      const e = ELIGIBILITY_ORDER[a.result.eligibility] - ELIGIBILITY_ORDER[b.result.eligibility];
      if (e !== 0) return e;
    }
    return b.result.score - a.result.score || a.candidate.name.localeCompare(b.candidate.name);
  });
}
