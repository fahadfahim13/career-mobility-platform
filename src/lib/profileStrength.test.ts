import { describe, expect, it } from "vitest";
import { sampleProfile } from "../data/sampleProfile";
import { profileStrength } from "./profileStrength";
import type { Profile } from "./types";

const empty: Profile = {
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

describe("profileStrength", () => {
  it("is 0% for an empty profile and lists every section", () => {
    const s = profileStrength(empty);
    expect(s.percent).toBe(0);
    expect(s.missing).toHaveLength(8);
  });

  it("marks the sample profile incomplete only on work authorisation", () => {
    const s = profileStrength(sampleProfile);
    expect(s.percent).toBe(88);
    expect(s.missing).toEqual(["Work authorisation for each preferred country"]);
  });

  it("reaches 100% when work authorisation is answered for every preferred country", () => {
    const full: Profile = { ...sampleProfile, workAuthorisation: { Germany: "no", Canada: "yes", Singapore: "unknown" } };
    expect(profileStrength(full).percent).toBe(88);
    const answered: Profile = { ...sampleProfile, workAuthorisation: { Germany: "no", Canada: "yes", Singapore: "yes" } };
    expect(profileStrength(answered).percent).toBe(100);
  });
});
