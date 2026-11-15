import { normalizeCountry, normalizeText } from "./normalize";
import { unmetLanguages, type CriterionEval } from "./criteria";
import type { Opportunity, Profile, WorkAuth } from "../types";
import type { CriterionKey, CriterionResult, Eligibility, Flag, NextStep, ProfileField } from "./types";

/** Fixed copy: the platform never makes a legal determination about visa or work status. */
export const VERIFY_WORK_AUTH_MESSAGE = "Work authorisation not confirmed — needs verification";
export const RECOGNITION_MESSAGE = "Qualification recognition may be required — check before applying";

export function workAuthFor(profile: Profile, country: string): WorkAuth {
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

  if (opp.recognitionMayBeRequired && opp.education) {
    flags.push({ kind: "verify", message: RECOGNITION_MESSAGE });
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

/** Right to work only: "no" blocks, unknown needs verification, everything else is clear. */
export function eligibilityFor(profile: Profile, opp: Opportunity): Eligibility {
  if (!opp.localWorkAuthRequired) return "clear";
  const auth = workAuthFor(profile, opp.country);
  if (auth === "no") return "blocked";
  return auth === "unknown" ? "verify" : "clear";
}

const MISSING_FIELD: Record<CriterionKey, ProfileField> = {
  skills: "skills",
  experience: "yearsExperience",
  education: "education",
  location: "preferredCountries",
  language: "languages",
  interests: "interests",
};

const MAX_STEPS = 4;

/** Actionable, truthful suggestions, most important first. Each points at the profile field it concerns. */
export function buildNextSteps(
  profile: Profile,
  opp: Opportunity,
  criteria: CriterionResult[],
  missingSkills: string[],
): NextStep[] {
  const steps: NextStep[] = [];

  for (const l of profile.languages.length ? unmetLanguages(profile, opp) : []) {
    steps.push({
      field: "languages",
      text: `This role needs ${l.level} ${l.name}. If your level is already higher, update your profile; otherwise plan for a course or certificate first.`,
    });
  }
  if (opp.enrolledStudentRequired && profile.enrolledStudent !== true) {
    steps.push({ field: "enrolledStudent", text: "This role is for enrolled students. Confirm your enrolment status, or look at graduate roles instead." });
  }
  if (eligibilityFor(profile, opp) === "verify") {
    steps.push({
      field: "workAuthorisation",
      text: `Confirm your right to work in ${opp.country} with the official sources below, then record the answer in your profile.`,
    });
  }
  if (missingSkills.length && profile.skills.length) {
    steps.push({
      field: "skills",
      text: `If you have used ${missingSkills.join(", ")}, add ${missingSkills.length === 1 ? "it" : "them"} to your skills. If not, consider building ${missingSkills.length === 1 ? "this skill" : "these skills"} before applying.`,
    });
  }
  for (const c of criteria) {
    if (c.score === null) steps.push({ field: MISSING_FIELD[c.key], text: `Add your ${c.label.toLowerCase()} to your profile so this criterion can be scored fully.` });
  }
  const location = criteria.find((c) => c.key === "location");
  if (location?.status === "unmet") {
    steps.push({ field: "preferredCountries", text: `Add ${opp.country} to your preferred countries if you would consider moving there.` });
  }
  if (opp.recognitionMayBeRequired && opp.education) {
    steps.push({ field: "education", text: `Check whether your qualification needs formal recognition in ${opp.country}.` });
  }
  return steps.slice(0, MAX_STEPS);
}
