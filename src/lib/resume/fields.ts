import { EDUCATION_LEVELS, LANGUAGE_LEVELS } from "../schemas";
import type { EducationLevel, Language, LanguageLevel, Profile } from "../types";

/**
 * Profile fields that can be read from a resume. Preferred countries and work authorisation are
 * deliberately absent: a resume does not state them, and eligibility must never be guessed.
 */
export interface ResumeFields {
  educationLevel: EducationLevel | null;
  educationField: string;
  yearsExperience: number | null;
  experienceSummary: string;
  skills: string[];
  languages: Language[];
  interests: string[];
  enrolledStudent: boolean | null;
}

export const EMPTY_PROFILE: Profile = {
  educationLevel: null,
  educationField: "",
  yearsExperience: null,
  experienceSummary: "",
  skills: [],
  languages: [],
  preferredCountries: [],
  interests: [],
  enrolledStudent: null,
  workAuthorisation: {},
};

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function list(v: unknown, maxItems: number, maxLen: number): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of v) {
    const s = text(item, maxLen);
    const key = s.toLowerCase();
    if (!s || seen.has(key)) continue;
    seen.add(key);
    out.push(s);
    if (out.length === maxItems) break;
  }
  return out;
}

function languages(v: unknown): Language[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: Language[] = [];
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const name = text((item as { name?: unknown }).name, 40);
    const rawLevel = (item as { level?: unknown }).level;
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    // An unclear level is recorded as the most cautious one, never as a stronger claim.
    const level: LanguageLevel = LANGUAGE_LEVELS.includes(rawLevel as LanguageLevel) ? (rawLevel as LanguageLevel) : "basic";
    out.push({ name, level });
    if (out.length === 10) break;
  }
  return out;
}

function monthIndex(v: unknown): number | null {
  const m = typeof v === "string" ? /^(\d{4})-(\d{2})$/.exec(v.trim()) : null;
  if (!m) return null;
  const month = Number(m[2]);
  return month >= 1 && month <= 12 ? Number(m[1]) * 12 + month - 1 : null;
}

/**
 * Years of work from dated roles, counted in code because small models add dates badly. Months are
 * inclusive, "present" is the current month, overlapping roles count once and internships count half.
 * Returns null when no role has a usable date range.
 */
export function yearsFromRoles(roles: unknown, today = new Date()): number | null {
  if (!Array.isArray(roles)) return null;
  const now = today.getUTCFullYear() * 12 + today.getUTCMonth();
  const weight = new Map<number, number>();
  for (const role of roles) {
    if (!role || typeof role !== "object") continue;
    const r = role as { start?: unknown; end?: unknown; internship?: unknown };
    const start = monthIndex(r.start);
    const end = r.end === "present" ? now : monthIndex(r.end);
    if (start === null || end === null || end < start) continue;
    const w = r.internship === true ? 0.5 : 1;
    for (let m = start; m <= Math.min(end, now); m++) weight.set(m, Math.max(weight.get(m) ?? 0, w));
  }
  if (weight.size === 0) return null;
  const months = [...weight.values()].reduce((a, b) => a + b, 0);
  return Math.min(50, Math.round((months / 12) * 10) / 10);
}

/** Turns untrusted model output into safe profile values. Anything unusable becomes "not provided". */
export function sanitizeResumeFields(raw: unknown, today = new Date()): ResumeFields {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const stated = typeof r.yearsExperience === "number" && Number.isFinite(r.yearsExperience) && r.yearsExperience >= 0
    ? Math.min(50, Math.round(r.yearsExperience * 10) / 10)
    : null;
  const years = yearsFromRoles(r.roles, today) ?? stated;
  return {
    educationLevel: EDUCATION_LEVELS.includes(r.educationLevel as EducationLevel) ? (r.educationLevel as EducationLevel) : null,
    educationField: text(r.educationField, 100),
    yearsExperience: years,
    experienceSummary: text(r.experienceSummary, 500),
    skills: list(r.skills, 40, 60),
    languages: languages(r.languages),
    interests: list(r.interests, 15, 60),
    enrolledStudent: typeof r.enrolledStudent === "boolean" ? r.enrolledStudent : null,
  };
}

function union(current: string[], extra: string[], max: number): string[] {
  const seen = new Set(current.map((s) => s.toLowerCase()));
  return [...current, ...extra.filter((s) => !seen.has(s.toLowerCase()))].slice(0, max);
}

/**
 * Fills a profile from resume fields. Resume values replace single values only when present, list
 * items are added (never removed), and countries and work authorisation are left untouched.
 */
export function mergeResume(current: Profile, f: ResumeFields): { profile: Profile; filled: number } {
  let filled = 0;
  const pick = <T,>(value: T, has: boolean, fallback: T): T => {
    if (!has) return fallback;
    filled += 1;
    return value;
  };

  const langs = current.languages.map((l) => {
    const match = f.languages.find((x) => x.name.toLowerCase() === l.name.toLowerCase());
    return match ? { ...l, level: match.level } : l;
  });
  const newLangs = f.languages.filter((x) => !current.languages.some((l) => l.name.toLowerCase() === x.name.toLowerCase()));

  const profile: Profile = {
    ...current,
    educationLevel: pick(f.educationLevel, f.educationLevel !== null, current.educationLevel),
    educationField: pick(f.educationField, f.educationField !== "", current.educationField),
    yearsExperience: pick(f.yearsExperience, f.yearsExperience !== null, current.yearsExperience),
    experienceSummary: pick(f.experienceSummary, f.experienceSummary !== "", current.experienceSummary),
    skills: pick(union(current.skills, f.skills, 40), f.skills.length > 0, current.skills),
    languages: pick([...langs, ...newLangs].slice(0, 10), f.languages.length > 0, current.languages),
    interests: pick(union(current.interests, f.interests, 15), f.interests.length > 0, current.interests),
    enrolledStudent: pick(f.enrolledStudent, f.enrolledStudent !== null, current.enrolledStudent),
  };
  return { profile, filled };
}
