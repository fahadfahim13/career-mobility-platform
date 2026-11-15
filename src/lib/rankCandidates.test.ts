import { describe, expect, it } from "vitest";
import { candidates } from "../data/candidates";
import { getOpportunity } from "./data";
import { rankCandidates } from "./rankCandidates";
import { profileSchema } from "./schemas";

const opp = getOpportunity("operations-coordinator-singapore")!;

describe("candidate ranking for employers", () => {
  it("every fictional candidate has a valid profile and a unique id", () => {
    expect(candidates.length).toBeGreaterThanOrEqual(8);
    expect(new Set(candidates.map((c) => c.id)).size).toBe(candidates.length);
    for (const c of candidates) expect(profileSchema.safeParse(c.profile).success).toBe(true);
  });

  it("ranks by fit score, highest first, and is deterministic", () => {
    const rows = rankCandidates(opp, candidates);
    const scores = rows.map((r) => r.result.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
    expect(rankCandidates(opp, candidates).map((r) => r.candidate.id)).toEqual(rows.map((r) => r.candidate.id));
  });

  it("eligibility sort puts stated right to work first, then to verify, then not held", () => {
    const order = { clear: 0, verify: 1, blocked: 2 } as const;
    const rows = rankCandidates(opp, candidates, "eligibility");
    const ranks = rows.map((r) => order[r.result.eligibility]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(new Set(rows.map((r) => r.result.eligibility)).size).toBeGreaterThan(1);
  });

  it("the pool contains a mix of strong and weaker matches for this role", () => {
    const bands = new Set(rankCandidates(opp, candidates).map((r) => r.result.band));
    expect(bands.has("Strong")).toBe(true);
    expect(bands.size).toBeGreaterThan(1);
  });
});
