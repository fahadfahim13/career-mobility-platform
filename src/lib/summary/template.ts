import type { MatchResult } from "../matching/types";
import type { Opportunity } from "../types";

/** Deterministic summary built only from the rule output. Used when AI is off, slow or returns bad output. */
export function templateSummary(opp: Opportunity, r: MatchResult): string {
  const parts: string[] = [];
  parts.push(`${r.band} match (${r.score}/100) for ${opp.title} at ${opp.organisation}.`);
  if (r.strengths.length) parts.push(`Strongest point: ${lowerFirst(r.strengths[0])}.`);
  if (r.gaps.length) parts.push(`Main gap: ${lowerFirst(r.gaps[0])}.`);
  if (r.flags.some((f) => f.kind === "verify")) parts.push("Your right to work in this country still needs to be verified.");
  return parts.join(" ");
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
