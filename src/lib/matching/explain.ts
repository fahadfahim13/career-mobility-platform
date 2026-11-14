import { normalizeCountry, normalizeText } from "./normalize";
import { unmetLanguages, type CriterionEval } from "./criteria";
import type { Opportunity, Profile, WorkAuth } from "../types";
import type { CriterionKey, CriterionResult, Flag } from "./types";

/** Fixed copy: the platform never makes a legal determination about visa or work status. */
export const VERIFY_WORK_AUTH_MESSAGE = "Work authorisation not confirmed — needs verification";

function workAuthFor(profile: Profile, country: string): WorkAuth {
  const key = Object.keys(profile.workAuthorisation).find((k) => normalizeCountry(k) === normalizeCountry(country));
  return key ? profile.workAuthorisation[key] : "unknown";
}

/** Hard constraints and unknowns, kept separate from the weighted score. */
export function eligibilityFlags(profile: Profile, opp: Opportunity, criteria: CriterionResult[]): Flag[] {
  const flags: Flag[] = [];

  if (profile.languages.length > 0) {
    for (const l of unmetLanguages(profile, opp)) {
      const own = profile.languages.find((x) => normalizeText(x.name) === normalizeText(l.name));
      flags.push({
        kind: "critical",
        message: `Requires ${l.name} at ${l.level} level; your profile lists ${own ? `${own.level} ${l.name}` : `no ${l.name}`}`,
      });
    }
  }

  if (opp.enrolledStudentRequired) {
    if (profile.enrolledStudent === false) {
      flags.push({ kind: "critical", message: "Open only to currently enrolled students; your profile states that you are not enrolled" });
    } else if (profile.enrolledStudent === null) {
      flags.push({ kind: "missing", message: "Enrolment status not provided; this role is open only to enrolled students" });
    }
  }

  if (opp.localWorkAuthRequired) {
    const auth = workAuthFor(profile, opp.country);
    if (auth === "no") {
      flags.push({ kind: "critical", message: `Requires the right to work in ${opp.country}; you indicated that you do not have it` });
    } else if (auth === "unknown") {
      flags.push({ kind: "verify", message: VERIFY_WORK_AUTH_MESSAGE });
    }
  }

  for (const c of criteria) {
    if (c.score === null) flags.push({ kind: "missing", message: `${c.label}: ${c.detail}. Scored as neutral (50%)` });
  }

  return flags;
}

/** Strengths come from criteria that are met; gaps list hard blockers first, then weaker criteria. */
export function buildExplanation(evals: Record<CriterionKey, CriterionEval>, flags: Flag[]) {
  const strengths: string[] = [];
  const gaps: string[] = flags.filter((f) => f.kind === "critical").map((f) => f.message);
  for (const e of Object.values(evals)) {
    if (e.strength && e.status !== "unmet") strengths.push(e.strength);
    if (e.gap && e.status !== "met") gaps.push(e.gap);
  }
  return { strengths, gaps };
}
