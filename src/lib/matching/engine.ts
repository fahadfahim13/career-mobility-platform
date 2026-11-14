import type { Opportunity, Profile } from "../types";
import { EVALUATORS, LABELS, WEIGHTS, type CriterionEval } from "./criteria";
import { buildExplanation, eligibilityFlags } from "./explain";
import type { Band, CriterionKey, CriterionResult, MatchResult } from "./types";

/** Score ceiling when any hard constraint is unmet, so a blocked role can never outrank an eligible one on skills alone. */
export const CRITICAL_CAP = 35;
/** Partial credit given when data is missing: neither rewarded nor punished. */
const UNKNOWN_CREDIT = 0.5;

function bandFor(score: number, critical: boolean): Band {
  if (critical) return "Critical gap";
  if (score >= 75) return "Strong";
  if (score >= 50) return "Partial";
  return "Weak";
}

export function matchOne(profile: Profile, opp: Opportunity): MatchResult {
  const keys = Object.keys(WEIGHTS) as CriterionKey[];
  const evals = Object.fromEntries(keys.map((k) => [k, EVALUATORS[k](profile, opp)])) as Record<CriterionKey, CriterionEval>;

  const criteria: CriterionResult[] = keys.map((key) => {
    const e = evals[key];
    return {
      key,
      label: LABELS[key],
      weight: WEIGHTS[key],
      score: e.score,
      points: Math.round(WEIGHTS[key] * (e.score ?? UNKNOWN_CREDIT)),
      status: e.status,
      detail: e.detail,
    };
  });

  const flags = eligibilityFlags(profile, opp, criteria);
  const critical = flags.some((f) => f.kind === "critical");
  const raw = criteria.reduce((sum, c) => sum + c.points, 0);
  const score = critical ? Math.min(raw, CRITICAL_CAP) : raw;
  const { strengths, gaps } = buildExplanation(evals, flags);

  return { opportunityId: opp.id, score, band: bandFor(score, critical), criteria, strengths, gaps, flags };
}

export function rankOpportunities(profile: Profile, opps: Opportunity[]): MatchResult[] {
  return opps
    .map((o) => matchOne(profile, o))
    .sort((a, b) => b.score - a.score || (a.opportunityId < b.opportunityId ? -1 : a.opportunityId > b.opportunityId ? 1 : 0));
}
