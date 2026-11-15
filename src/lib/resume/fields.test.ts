import { describe, expect, it } from "vitest";
import { sampleProfile } from "../../data/sampleProfile";
import { EMPTY_PROFILE, mergeResume, sanitizeResumeFields, yearsFromRoles } from "./fields";

describe("sanitizeResumeFields", () => {
  it("keeps valid values and trims, dedupes and caps lists", () => {
    const f = sanitizeResumeFields({
      educationLevel: "master",
      educationField: "  Business Administration ",
      yearsExperience: 4.26,
      experienceSummary: "Ran supply planning for a regional retailer.",
      skills: ["Excel", "excel", " SQL ", "", ...Array.from({ length: 60 }, (_, i) => `Skill ${i}`)],
      languages: [{ name: "English", level: "native" }, { name: "German", level: "fluent-ish" }],
      interests: ["Logistics"],
      enrolledStudent: false,
    });
    expect(f.educationLevel).toBe("master");
    expect(f.educationField).toBe("Business Administration");
    expect(f.yearsExperience).toBe(4.3);
    expect(f.skills.slice(0, 2)).toEqual(["Excel", "SQL"]);
    expect(f.skills).toHaveLength(40);
    // Unknown level falls back to the most cautious level rather than dropping the language.
    expect(f.languages).toEqual([{ name: "English", level: "native" }, { name: "German", level: "basic" }]);
    expect(f.enrolledStudent).toBe(false);
  });

  it("turns unusable values into 'not provided' instead of guessing", () => {
    const f = sanitizeResumeFields({ educationLevel: "wizard", yearsExperience: -3, skills: "Excel", languages: null });
    expect(f.educationLevel).toBeNull();
    expect(f.yearsExperience).toBeNull();
    expect(f.skills).toEqual([]);
    expect(f.languages).toEqual([]);
    expect(f.enrolledStudent).toBeNull();
  });

  it("caps years at 50 and long text at the profile limits", () => {
    const f = sanitizeResumeFields({ yearsExperience: 80, experienceSummary: "x".repeat(900), educationField: "y".repeat(300) });
    expect(f.yearsExperience).toBe(50);
    expect(f.experienceSummary).toHaveLength(500);
    expect(f.educationField).toHaveLength(100);
  });

  it("returns empty fields for non-object input", () => {
    expect(sanitizeResumeFields("nope").skills).toEqual([]);
    expect(sanitizeResumeFields(null).educationLevel).toBeNull();
  });
});

describe("mergeResume", () => {
  it("fills an empty profile and counts the filled fields", () => {
    const { profile, filled } = mergeResume(EMPTY_PROFILE, sanitizeResumeFields({
      educationLevel: "bachelor",
      educationField: "Economics",
      yearsExperience: 3,
      skills: ["Excel"],
      languages: [{ name: "English", level: "professional" }],
    }));
    expect(profile.educationLevel).toBe("bachelor");
    expect(profile.yearsExperience).toBe(3);
    expect(profile.skills).toEqual(["Excel"]);
    expect(filled).toBe(5);
  });

  it("never touches countries or work authorisation, and keeps existing list items", () => {
    const { profile } = mergeResume(sampleProfile, sanitizeResumeFields({ skills: ["Kotlin", sampleProfile.skills[0]!.toLowerCase()] }));
    expect(profile.preferredCountries).toEqual(sampleProfile.preferredCountries);
    expect(profile.workAuthorisation).toEqual(sampleProfile.workAuthorisation);
    expect(profile.skills).toEqual([...sampleProfile.skills, "Kotlin"]);
    // Blank resume values do not erase what the user already entered.
    expect(profile.educationLevel).toBe(sampleProfile.educationLevel);
  });

  it("updates a language level when the resume names the same language", () => {
    const base = { ...EMPTY_PROFILE, languages: [{ name: "German", level: "basic" as const }] };
    const { profile } = mergeResume(base, sanitizeResumeFields({ languages: [{ name: "german", level: "professional" }] }));
    expect(profile.languages).toEqual([{ name: "German", level: "professional" }]);
  });
});

describe("yearsFromRoles", () => {
  const today = new Date("2026-11-16");
  it("sums dated roles, treats present as today and counts internships as half", () => {
    expect(yearsFromRoles([{ start: "2019-01", end: "2021-12", internship: false }, { start: "2022-01", end: "present", internship: false }], today)).toBe(7.9);
    expect(yearsFromRoles([{ start: "2024-01", end: "2024-12", internship: true }], today)).toBe(0.5);
  });

  it("does not double count overlapping roles", () => {
    expect(yearsFromRoles([{ start: "2020-01", end: "2021-12", internship: false }, { start: "2021-01", end: "2021-12", internship: false }], today)).toBe(2);
  });

  it("returns null when no role has usable dates, and ignores future or reversed ranges", () => {
    expect(yearsFromRoles([{ start: null, end: "present", internship: false }], today)).toBeNull();
    expect(yearsFromRoles([{ start: "2025-06", end: "2025-01", internship: false }], today)).toBeNull();
    expect(yearsFromRoles("x", today)).toBeNull();
  });

  it("is used by sanitizeResumeFields when roles are present", () => {
    const f = sanitizeResumeFields({ roles: [{ start: "2023-11", end: "present", internship: false }], yearsExperience: 9 }, today);
    expect(f.yearsExperience).toBe(3.1); // 37 months, the current month included
  });
});
