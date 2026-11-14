/**
 * Text normalisation for matching. Kept deliberately small and explicit: every synonym is listed here
 * so an assessor can see exactly which terms are treated as equal.
 */

const SKILL_SYNONYMS: Record<string, string> = {
  coordination: "project coordination",
  "project coordinator": "project coordination",
  "report writing": "reporting",
  "reports": "reporting",
  "stakeholder management": "stakeholder communication",
  "stakeholder engagement": "stakeholder communication",
  "data analytics": "data analysis",
  spreadsheets: "excel",
  "ms excel": "excel",
  presentations: "presentation skills",
  presenting: "presentation skills",
  "customer service": "customer support",
  crm: "crm software",
};

const COUNTRY_ALIASES: Record<string, string> = {
  uk: "united kingdom",
  "great britain": "united kingdom",
  uae: "united arab emirates",
  us: "united states",
  usa: "united states",
  "the netherlands": "netherlands",
  holland: "netherlands",
};

export function normalizeText(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeSkill(s: string): string {
  const base = normalizeText(s).replace(/^microsoft /, "");
  return SKILL_SYNONYMS[base] ?? base;
}

export function normalizeCountry(s: string): string {
  const base = normalizeText(s);
  return COUNTRY_ALIASES[base] ?? base;
}
