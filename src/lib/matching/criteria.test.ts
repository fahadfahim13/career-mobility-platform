import { describe, expect, it } from "vitest";
import { getOpportunity } from "../data";
import { sampleProfile } from "../../data/sampleProfile";
import { scoreEducation, scoreExperience, scoreInterests, scoreLanguage, scoreLocation } from "./criteria";
import { normalizeSkill } from "./normalize";

const ngo = getOpportunity("programme-assistant-ngo")!;
const remote = getOpportunity("research-assistant-remote")!;
const london = getOpportunity("software-engineer-london")!;

describe("criteria", () => {
  it("normalizeSkill strips vendor prefix, case and synonyms", () => {
    expect(normalizeSkill("  Microsoft Excel ")).toBe("excel");
    expect(normalizeSkill("Report writing")).toBe("reporting");
  });

  it("experience: within range, overqualified, slightly short, far short, unknown", () => {
    expect(scoreExperience({ ...sampleProfile, yearsExperience: 2 }, ngo).score).toBe(1);
    expect(scoreExperience({ ...sampleProfile, yearsExperience: 6 }, ngo).score).toBe(0.8);
    expect(scoreExperience({ ...sampleProfile, yearsExperience: 3 }, london).score).toBe(0.5);
    expect(scoreExperience({ ...sampleProfile, yearsExperience: 1 }, london).score).toBe(0);
    expect(scoreExperience({ ...sampleProfile, yearsExperience: null }, ngo).score).toBeNull();
  });

  it("education: relevant field, unrelated field, level not met", () => {
    expect(scoreEducation(sampleProfile, ngo).score).toBe(1);
    expect(scoreEducation(sampleProfile, london).score).toBe(0.6);
    expect(scoreEducation({ ...sampleProfile, educationLevel: "diploma" }, ngo).score).toBe(0);
  });

  it("location: preferred, remote, other", () => {
    expect(scoreLocation(sampleProfile, ngo).score).toBe(1);
    expect(scoreLocation(sampleProfile, remote).score).toBe(0.7);
    expect(scoreLocation(sampleProfile, london).score).toBe(0);
  });

  it("language: met vs below level", () => {
    expect(scoreLanguage(sampleProfile, ngo).score).toBe(1);
    const weak = { ...sampleProfile, languages: [{ name: "English", level: "conversational" as const }] };
    expect(scoreLanguage(weak, ngo).score).toBe(0);
  });
});

describe("whole-word matching (review fix)", () => {
  const officer = getOpportunity("programme-officer-berlin")!;
  it('interest "IT" does not match "monitoring and evaluation"', () => {
    expect(scoreInterests({ ...sampleProfile, interests: ["IT"] }, officer).score).toBe(0);
  });
  it("a one-letter interest matches nothing", () => {
    expect(scoreInterests({ ...sampleProfile, interests: ["a"] }, ngo).score).toBe(0);
  });
  it("a one-letter field of study is not a relevant field", () => {
    expect(scoreEducation({ ...sampleProfile, educationField: "a" }, ngo).score).toBe(0.6);
  });
  it("multi-word interests still match their category", () => {
    expect(scoreInterests(sampleProfile, ngo).score).toBe(1);
  });
});
