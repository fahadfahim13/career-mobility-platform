import type { MatchResult } from "../matching/types";
import type { Opportunity } from "../types";

export const SYSTEM_PROMPT = [
  "You write a two-sentence summary of how well a candidate matches a job, for the candidate to read.",
  "Use only the facts in the JSON you are given. Do not add skills, requirements, numbers or scores that are not in it.",
  "Never state or imply a visa, immigration or work-authorisation outcome. If the input contains a 'verify' flag, say that the right to work still needs to be verified.",
  "If the input contains a 'critical' flag, mention that requirement plainly as the main obstacle.",
  "Write in plain, professional British English. No bullet points, no headings, no score.",
  'Respond with JSON only, in the form {"summary": "..."}.',
].join(" ");

/** Builds the prompt. Only role facts and the rule-engine output are included; no free-text profile summary. */
export function buildPrompt(opp: Opportunity, r: MatchResult): string {
  const payload = {
    role: { title: opp.title, organisation: opp.organisation, country: opp.country, type: opp.type },
    band: r.band,
    strengths: r.strengths,
    gaps: r.gaps,
    flags: r.flags.map((f) => ({ kind: f.kind, message: f.message })),
  };
  return `Summarise this match result:\n${JSON.stringify(payload)}`;
}
