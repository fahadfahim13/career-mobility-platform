import { EDUCATION_LABEL, formatLanguage, formatLocation } from "../format";
import { EDUCATION_LEVELS, LANGUAGE_LEVELS } from "../schemas";
import type { Opportunity, Profile } from "../types";
import { normalizeCountry, normalizeSkill, normalizeText, phrasesOverlap } from "./normalize";
import type { CriterionKey, CriterionStatus } from "./types";

export const WEIGHTS: Record<CriterionKey, number> = {
  skills: 30,
  experience: 20,
  education: 15,
  location: 15,
  language: 10,
  interests: 10,
};

export const LABELS: Record<CriterionKey, string> = {
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  location: "Location",
  language: "Language",
  interests: "Career interests",
};

/** Output of one criterion before weighting. `strength` / `gap` feed the explanation lists. */
export interface CriterionEval {
  score: number | null;
  status: CriterionStatus;
  detail: string;
  strength?: string;
  gap?: string;
}

function statusFor(score: number | null): CriterionStatus {
  if (score === null) return "unknown";
  if (score >= 1) return "met";
  if (score <= 0) return "unmet";
  return "partial";
}

function evalOf(score: number | null, detail: string, extra: Partial<CriterionEval> = {}): CriterionEval {
  return { score, status: statusFor(score), detail, ...extra };
}

const list = (items: string[]) => items.join(", ");

/** Required skills split into those the profile has and those it lacks. */
export function skillCoverage(profile: Profile, opp: Opportunity) {
  const have = new Set(profile.skills.map(normalizeSkill));
  return {
    matched: opp.requiredSkills.filter((s) => have.has(normalizeSkill(s))),
    missing: opp.requiredSkills.filter((s) => !have.has(normalizeSkill(s))),
  };
}

export function scoreSkills(profile: Profile, opp: Opportunity): CriterionEval {
  if (profile.skills.length === 0) return evalOf(null, "No skills provided in your profile");
  const have = new Set(profile.skills.map(normalizeSkill));
  const matched = opp.requiredSkills.filter((s) => have.has(normalizeSkill(s)));
  const missing = opp.requiredSkills.filter((s) => !have.has(normalizeSkill(s)));
  const bonus = opp.niceToHaveSkills.filter((s) => have.has(normalizeSkill(s)));
  const score = matched.length / opp.requiredSkills.length;
  const parts = [`${matched.length} of ${opp.requiredSkills.length} required skills matched`];
  if (missing.length) parts.push(`missing: ${list(missing)}`);
  if (bonus.length) parts.push(`nice-to-have matched: ${list(bonus)}`);
  return evalOf(score, parts.join("; "), {
    strength: matched.length ? `Has ${matched.length} of ${opp.requiredSkills.length} required skills: ${list(matched)}` : undefined,
    gap: missing.length ? `Missing required skills: ${list(missing)}` : undefined,
  });
}

function requiredYears(opp: Opportunity): string {
  if (opp.maxYears === null) return `${opp.minYears}+ years`;
  return `${opp.minYears}–${opp.maxYears} years`;
}

export function scoreExperience(profile: Profile, opp: Opportunity): CriterionEval {
  const req = requiredYears(opp);
  const y = profile.yearsExperience;
  if (y === null) return evalOf(null, `Role requires ${req}; your experience is not provided`);
  if (y < opp.minYears) {
    const short = opp.minYears - y;
    const score = short <= 1 ? 0.5 : 0;
    const msg = `Role requires ${req}; you have ${y} (${short} ${short === 1 ? "year" : "years"} short)`;
    return evalOf(score, msg, { gap: msg });
  }
  if (opp.maxYears !== null && y > opp.maxYears) {
    const msg = `Role requires ${req}; with ${y} years you may be overqualified`;
    return evalOf(0.8, msg, { strength: `Experience exceeds the ${req} required`, gap: msg });
  }
  const msg = `${y} years of experience is within the required ${req}`;
  return evalOf(1, msg, { strength: msg });
}

const levelRank = (l: (typeof EDUCATION_LEVELS)[number]) => EDUCATION_LEVELS.indexOf(l);

export function scoreEducation(profile: Profile, opp: Opportunity): CriterionEval {
  if (!opp.education) return evalOf(1, "No formal education requirement stated");
  const { minLevel, relevantFields } = opp.education;
  if (profile.educationLevel === null) return evalOf(null, `Role requires at least a ${EDUCATION_LABEL[minLevel].toLowerCase()}; your education level is not provided`);
  if (levelRank(profile.educationLevel) < levelRank(minLevel)) {
    const msg = `Role requires at least a ${EDUCATION_LABEL[minLevel].toLowerCase()}; your highest level is ${EDUCATION_LABEL[profile.educationLevel].toLowerCase()}`;
    return evalOf(0, msg, { gap: msg });
  }
  const relevant = relevantFields.length === 0 || relevantFields.some((f) => phrasesOverlap(profile.educationField, f));
  if (relevant) {
    const msg = `${EDUCATION_LABEL[profile.educationLevel]}${profile.educationField ? ` in ${profile.educationField}` : ""} meets the requirement for a ${EDUCATION_LABEL[minLevel].toLowerCase()} in a relevant field`;
    return evalOf(1, msg, { strength: msg });
  }
  const msg = `Education level met, but ${profile.educationField || "your field of study"} is not one of the preferred fields: ${list(relevantFields)}`;
  return evalOf(0.6, msg, { gap: msg });
}

export function scoreLocation(profile: Profile, opp: Opportunity): CriterionEval {
  if (profile.preferredCountries.length === 0) return evalOf(null, "No preferred countries provided");
  const preferred = new Set(profile.preferredCountries.map(normalizeCountry));
  if (preferred.has(normalizeCountry(opp.country))) {
    const msg = `${formatLocation(opp)} is in one of your preferred countries`;
    return evalOf(1, msg, { strength: msg });
  }
  if (opp.remote) {
    const msg = `Remote role; the organisation is based in ${opp.country}, which is not one of your preferred countries`;
    return evalOf(0.7, msg, { strength: "Remote role that can be performed from your current location" });
  }
  const msg = `${opp.country} is not in your preferred countries`;
  return evalOf(0, msg, { gap: msg });
}

const langRank = (l: (typeof LANGUAGE_LEVELS)[number]) => LANGUAGE_LEVELS.indexOf(l);

/** Returns the required languages the profile does not meet. Used by both scoring and eligibility flags. */
export function unmetLanguages(profile: Profile, opp: Opportunity) {
  return opp.languages.filter((req) => {
    const own = profile.languages.find((l) => normalizeText(l.name) === normalizeText(req.name));
    return !own || langRank(own.level) < langRank(req.level);
  });
}

export function scoreLanguage(profile: Profile, opp: Opportunity): CriterionEval {
  if (opp.languages.length === 0) return evalOf(1, "No language requirement stated");
  const required = list(opp.languages.map(formatLanguage));
  if (profile.languages.length === 0) return evalOf(null, `Role requires ${required}; no languages provided`);
  const unmet = unmetLanguages(profile, opp);
  const score = (opp.languages.length - unmet.length) / opp.languages.length;
  if (unmet.length === 0) {
    const msg = `Meets the language requirement: ${required}`;
    return evalOf(score, msg, { strength: msg });
  }
  const msg = `Does not meet the language requirement: ${list(unmet.map(formatLanguage))}`;
  return evalOf(score, msg, { gap: msg });
}

export function scoreInterests(profile: Profile, opp: Opportunity): CriterionEval {
  if (profile.interests.length === 0) return evalOf(null, "No career interests provided");
  const terms = [opp.category, ...opp.tags];
  const hits = profile.interests.filter((i) => terms.some((t) => phrasesOverlap(i, t)));
  if (hits.length) {
    const msg = `Aligns with your interest in ${list(hits.map((h) => h.toLowerCase()))}`;
    return evalOf(1, msg, { strength: msg });
  }
  return evalOf(0, `The role area (${opp.category}) is outside your stated career interests`);
}

export const EVALUATORS: Record<CriterionKey, (p: Profile, o: Opportunity) => CriterionEval> = {
  skills: scoreSkills,
  experience: scoreExperience,
  education: scoreEducation,
  location: scoreLocation,
  language: scoreLanguage,
  interests: scoreInterests,
};
