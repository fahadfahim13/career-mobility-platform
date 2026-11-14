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

/** Whole-word tokens of 3+ characters; shorter fragments ("it", "a") are too ambiguous to match on. */
function tokens(s: string): Set<string> {
  return new Set(normalizeText(s).split(/[^a-z0-9]+/).filter((t) => t.length >= 3));
}

/**
 * True when every meaningful word of one phrase appears as a whole word in the other,
 * e.g. "Business" ~ "Business Administration", but "IT" never matches "monitoring".
 */
export function phrasesOverlap(a: string, b: string): boolean {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return false;
  const [small, large] = ta.size <= tb.size ? [ta, tb] : [tb, ta];
  return [...small].every((t) => large.has(t));
}
