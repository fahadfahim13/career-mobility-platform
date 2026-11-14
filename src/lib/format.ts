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
