import { getOpportunities } from "./data";
import type { EducationLevel, Language, Opportunity } from "./types";

export const EDUCATION_LABEL: Record<EducationLevel, string> = {
  none: "No formal qualification",
  secondary: "Secondary school",
  diploma: "Diploma",
  bachelor: "Bachelor's degree",
  master: "Master's degree",
  phd: "Doctorate",
};

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function formatLanguage(l: Language): string {
  return `${l.name} (${capitalise(l.level)})`;
}

export function formatLocation(opp: Opportunity): string {
  return opp.city === opp.country ? opp.country : `${opp.city}, ${opp.country}`;
}

const COUNTRY_CODE: Record<string, string> = {
  Canada: "CA",
  Germany: "DE",
  Netherlands: "NL",
  Singapore: "SG",
  "United Kingdom": "UK",
  "United Arab Emirates": "AE",
};

/** Stable reference code, e.g. "DE-02": country code plus position among that country's roles. */
export function refCode(opp: Opportunity): string {
  const code = COUNTRY_CODE[opp.country] ?? opp.country.slice(0, 2).toUpperCase();
  const sameCountry = getOpportunities().filter((o) => o.country === opp.country);
  const n = sameCountry.findIndex((o) => o.id === opp.id) + 1;
  return `${code}-${String(n).padStart(2, "0")}`;
}

export function formatSalary(opp: Opportunity): string {
  const f = (n: number) => n.toLocaleString("en-GB");
  return `${opp.salary.currency} ${f(opp.salary.min)}–${f(opp.salary.max)} / ${opp.salary.period}`;
}

export const VISA_SUPPORT_LABEL: Record<Opportunity["visaSupport"], string> = {
  offered: "Visa support offered",
  "case-by-case": "Visa support case by case",
  "not-offered": "No visa support",
};

export function formatYears(opp: Opportunity): string {
  return opp.maxYears === null ? `${opp.minYears}+ years` : `${opp.minYears}–${opp.maxYears} years`;
}
