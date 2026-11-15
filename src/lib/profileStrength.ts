import { normalizeCountry } from "./matching/normalize";
import type { Profile } from "./types";

/** Eight equally weighted sections. A section counts once it holds enough to be scored. */
const SECTIONS: { label: string; done: (p: Profile) => boolean }[] = [
  { label: "Education level", done: (p) => p.educationLevel !== null },
  { label: "Field of study", done: (p) => p.educationField.trim().length > 0 },
  { label: "Years of experience", done: (p) => p.yearsExperience !== null },
  { label: "Skills", done: (p) => p.skills.length > 0 },
  { label: "Languages", done: (p) => p.languages.length > 0 },
  { label: "Preferred countries", done: (p) => p.preferredCountries.length > 0 },
  { label: "Career interests", done: (p) => p.interests.length > 0 },
  {
    label: "Work authorisation for each preferred country",
    done: (p) =>
      p.preferredCountries.length > 0 &&
      p.preferredCountries.every((c) => {
        const key = Object.keys(p.workAuthorisation).find((k) => normalizeCountry(k) === normalizeCountry(c));
        return key !== undefined && p.workAuthorisation[key] !== "unknown";
      }),
  },
];

export function profileStrength(p: Profile): { percent: number; missing: string[] } {
  const missing = SECTIONS.filter((s) => !s.done(p)).map((s) => s.label);
  return { percent: Math.round(((SECTIONS.length - missing.length) / SECTIONS.length) * 100), missing };
}
