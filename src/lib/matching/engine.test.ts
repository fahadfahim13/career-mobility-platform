import { describe, expect, it } from "vitest";
import { getOpportunities, getOpportunity } from "../data";
import { sampleProfile } from "../../data/sampleProfile";
import type { Opportunity, Profile } from "../types";
import { matchOne, rankOpportunities } from "./engine";
import { WEIGHTS } from "./criteria";
import { RECOGNITION_MESSAGE, VERIFY_WORK_AUTH_MESSAGE } from "./explain";

function opp(id: string): Opportunity {
  const o = getOpportunity(id);
  if (!o) throw new Error(`missing sample opportunity ${id}`);
  return o;
}

describe("matching engine — required assessment cases", () => {
  it("strong match: Programme Assistant NGO", () => {
    const r = matchOne(sampleProfile, opp("programme-assistant-ngo"));
    expect(r.band).toBe("Strong");
    expect(r.score).toBeGreaterThanOrEqual(75);
    expect(r.flags.some((f) => f.kind === "critical")).toBe(false);
  });

  it("partial match: Junior Data Analyst", () => {
    const r = matchOne(sampleProfile, opp("junior-data-analyst-amsterdam"));
    expect(["Partial", "Weak"]).toContain(r.band);
    expect(r.gaps.join(" ")).toContain("SQL");
  });

  it("critical gap: German-speaking Client Associate", () => {
    const r = matchOne(sampleProfile, opp("german-client-associate-frankfurt"));
    expect(r.band).toBe("Critical gap");
    expect(r.score).toBeLessThanOrEqual(35);
    const critical = r.flags.filter((f) => f.kind === "critical");
    expect(critical.some((f) => f.message.includes("German"))).toBe(true);
  });

  it("critical gap: Business Analyst Intern", () => {
    const r = matchOne(sampleProfile, opp("business-analyst-intern-berlin"));
    expect(r.band).toBe("Critical gap");
    expect(r.flags.some((f) => f.kind === "critical" && /enrolled student/i.test(f.message))).toBe(true);
    expect(r.flags).toContainEqual({ kind: "verify", message: VERIFY_WORK_AUTH_MESSAGE });
  });
});

describe("matching engine — eligibility handling", () => {
  it("unknown work auth is never treated as satisfied", () => {
    for (const o of getOpportunities().filter((x) => x.localWorkAuthRequired)) {
      const r = matchOne(sampleProfile, o);
      expect(r.flags).toContainEqual({ kind: "verify", message: VERIFY_WORK_AUTH_MESSAGE });
    }
    const target = opp("programme-assistant-ngo");
    const yes = matchOne({ ...sampleProfile, workAuthorisation: { Canada: "yes" } }, target);
    expect(yes.flags.some((f) => f.kind === "verify")).toBe(false);
    const no = matchOne({ ...sampleProfile, workAuthorisation: { Canada: "no" } }, target);
    expect(no.band).toBe("Critical gap");
    expect(no.flags.some((f) => f.kind === "critical" && f.message.includes("Canada"))).toBe(true);
  });

  it("does not flag work authorisation for roles that do not require it", () => {
    const r = matchOne(sampleProfile, opp("research-assistant-remote"));
    expect(r.flags.some((f) => f.kind === "verify")).toBe(false);
  });

  it("handles empty profile fields", () => {
    const empty: Profile = {
      ...sampleProfile,
      educationLevel: null,
      educationField: "",
      yearsExperience: null,
      skills: [],
      languages: [],
      preferredCountries: [],
      interests: [],
      enrolledStudent: null,
    };
    const results = rankOpportunities(empty, getOpportunities());
    expect(results).toHaveLength(getOpportunities().length);
    for (const r of results) {
      expect(Number.isFinite(r.score)).toBe(true);
      expect(r.flags.some((f) => f.kind === "missing")).toBe(true);
    }
  });

  it("treats an unknown enrolment status as needing verification, not as a pass", () => {
    const r = matchOne({ ...sampleProfile, enrolledStudent: null }, opp("business-analyst-intern-berlin"));
    expect(r.flags.some((f) => f.kind === "missing" && /enrol/i.test(f.message))).toBe(true);
  });
});

describe("matching engine — scoring mechanics", () => {
  it("normalizes skills and synonyms", () => {
    const base = opp("programme-assistant-ngo");
    const profile: Profile = {
      ...sampleProfile,
      skills: ["microsoft excel", "COORDINATION", "reporting", "stakeholder management"],
    };
    const skills = matchOne(profile, base).criteria.find((c) => c.key === "skills");
    expect(skills?.score).toBe(1);
  });

  it("weights sum to 100", () => {
    expect(Object.values(WEIGHTS).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it("criteria points sum to score", () => {
    for (const r of rankOpportunities(sampleProfile, getOpportunities())) {
      if (r.band === "Critical gap") continue;
      expect(r.criteria.reduce((a, c) => a + c.points, 0)).toBe(r.score);
    }
  });

  it("ranking is deterministic", () => {
    const a = rankOpportunities(sampleProfile, getOpportunities());
    const b = rankOpportunities(sampleProfile, getOpportunities());
    expect(a).toEqual(b);
    for (let i = 1; i < a.length; i++) {
      const prev = a[i - 1];
      const cur = a[i];
      expect(prev.score > cur.score || (prev.score === cur.score && prev.opportunityId < cur.opportunityId)).toBe(true);
    }
  });

  it("ranks the strong NGO role first for the sample profile", () => {
    expect(rankOpportunities(sampleProfile, getOpportunities())[0].opportunityId).toBe("programme-assistant-ngo");
  });
});

describe("matching engine — research-led outputs", () => {
  it("keeps the sample ranking unchanged", () => {
    const ranked = rankOpportunities(sampleProfile, getOpportunities()).map((r) => `${r.opportunityId}:${r.score}`);
    expect(ranked).toEqual([
      "programme-assistant-ngo:100",
      "operations-coordinator-singapore:88",
      "project-coordinator-toronto:88",
      "research-assistant-remote:79",
      "operations-specialist-munich:72",
      "marketing-coordinator-vancouver:68",
      "junior-data-analyst-amsterdam:57",
      "programme-officer-berlin:53",
      "business-analyst-intern-berlin:35",
      "german-client-associate-frankfurt:35",
      "sales-executive-dubai:35",
      "software-engineer-london:19",
    ]);
  });

  it("reports eligibility separately from fit", () => {
    expect(matchOne(sampleProfile, opp("programme-assistant-ngo")).eligibility).toBe("verify");
    expect(matchOne(sampleProfile, opp("research-assistant-remote")).eligibility).toBe("clear");
    const yes: Profile = { ...sampleProfile, workAuthorisation: { Canada: "yes" } };
    expect(matchOne(yes, opp("programme-assistant-ngo")).eligibility).toBe("clear");
    const no: Profile = { ...sampleProfile, workAuthorisation: { Canada: "no" } };
    expect(matchOne(no, opp("programme-assistant-ngo")).eligibility).toBe("blocked");
  });

  it("lists matched and missing required skills", () => {
    const o = opp("junior-data-analyst-amsterdam");
    const r = matchOne(sampleProfile, o);
    expect(r.skillCoverage.missing).toContain("SQL");
    expect(r.skillCoverage.matched.length + r.skillCoverage.missing.length).toBe(o.requiredSkills.length);
  });

  it("flags qualification recognition for verification without changing the score", () => {
    const o = opp("project-coordinator-toronto");
    const r = matchOne(sampleProfile, o);
    expect(r.flags).toContainEqual({ kind: "verify", message: RECOGNITION_MESSAGE });
    const without = matchOne(sampleProfile, { ...o, recognitionMayBeRequired: false });
    expect(without.score).toBe(r.score);
    expect(without.flags.some((f) => f.message === RECOGNITION_MESSAGE)).toBe(false);
  });

  it("suggests next steps that point at the profile field to update", () => {
    const analyst = matchOne(sampleProfile, opp("junior-data-analyst-amsterdam"));
    expect(analyst.nextSteps.some((s) => s.field === "skills" && s.text.includes("SQL"))).toBe(true);
    const ngo = matchOne(sampleProfile, opp("programme-assistant-ngo"));
    expect(ngo.nextSteps.some((s) => s.field === "workAuthorisation")).toBe(true);
    const german = matchOne(sampleProfile, opp("german-client-associate-frankfurt"));
    expect(german.nextSteps.some((s) => s.field === "languages" && s.text.includes("German"))).toBe(true);
    expect(analyst.nextSteps.length).toBeLessThanOrEqual(4);
  });
});
