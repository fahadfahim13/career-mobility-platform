import { describe, expect, it } from "vitest";
import { getOpportunities, getOpportunity } from "./data";
import { profileSchema } from "./schemas";
import { sampleProfile } from "../data/sampleProfile";
import { getCountryGuide } from "../data/countryGuides";

describe("opportunity data", () => {
  it("loads at least 10 valid opportunities", () => {
    expect(getOpportunities().length).toBeGreaterThanOrEqual(10);
  });

  it("has unique ids", () => {
    const ids = getOpportunities().map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("includes at least two hard constraints", () => {
    const constrained = getOpportunities().filter(
      (o) =>
        o.enrolledStudentRequired ||
        o.localWorkAuthRequired ||
        o.languages.some((l) => l.name.toLowerCase() !== "english"),
    );
    expect(constrained.length).toBeGreaterThanOrEqual(2);
  });

  it("finds one opportunity by id and returns undefined for unknown ids", () => {
    const first = getOpportunities()[0];
    expect(getOpportunity(first.id)?.title).toBe(first.title);
    expect(getOpportunity("does-not-exist")).toBeUndefined();
  });

  it("sample profile passes schema", () => {
    expect(() => profileSchema.parse(sampleProfile)).not.toThrow();
  });

  it("gives every role a salary range, visa support status and relocation list", () => {
    for (const o of getOpportunities()) {
      expect(o.salary.max).toBeGreaterThanOrEqual(o.salary.min);
      expect(["offered", "case-by-case", "not-offered"]).toContain(o.visaSupport);
      expect(Array.isArray(o.relocation)).toBe(true);
    }
  });

  it("has a country guide with official https sources for every role country", () => {
    for (const o of getOpportunities()) {
      const g = getCountryGuide(o.country);
      expect(g.country).toBe(o.country);
      expect(g.steps.length).toBeGreaterThanOrEqual(3);
      expect(g.sources.length).toBeGreaterThanOrEqual(1);
      for (const s of g.sources) expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it("falls back to a generic guide for an unknown country", () => {
    const g = getCountryGuide("Atlantis");
    expect(g.country).toBe("Atlantis");
    expect(g.generic).toBe(true);
    expect(g.steps.length).toBeGreaterThanOrEqual(3);
  });
});
