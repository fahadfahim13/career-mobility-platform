import { describe, expect, it } from "vitest";
import { getOpportunities, getOpportunity } from "./data";
import { profileSchema } from "./schemas";
import { sampleProfile } from "../data/sampleProfile";

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
});
