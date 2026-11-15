import { describe, expect, it } from "vitest";
import { getOpportunities } from "./data";
import { sampleProfile } from "../data/sampleProfile";
import { rankOpportunities } from "./matching/engine";
import { DEFAULT_FILTERS, filterMatches, type MatchRow } from "./filterMatches";

const byId = new Map(getOpportunities().map((o) => [o.id, o]));
const rows: MatchRow[] = rankOpportunities(sampleProfile, getOpportunities()).map((result) => ({
  opp: byId.get(result.opportunityId)!,
  result,
}));

describe("filterMatches", () => {
  it("returns every row in rank order with default filters", () => {
    expect(filterMatches(rows, DEFAULT_FILTERS).map((r) => r.result.opportunityId)).toEqual(rows.map((r) => r.result.opportunityId));
  });

  it("filters by band, country and visa support together", () => {
    const out = filterMatches(rows, { ...DEFAULT_FILTERS, country: "Germany", visaSupportOnly: true });
    expect(out.length).toBeGreaterThan(0);
    for (const r of out) {
      expect(r.opp.country).toBe("Germany");
      expect(r.opp.visaSupport).not.toBe("not-offered");
    }
    const strong = filterMatches(rows, { ...DEFAULT_FILTERS, band: "Strong" });
    expect(strong.every((r) => r.result.band === "Strong")).toBe(true);
  });

  it("filters by eligibility status", () => {
    const clear = filterMatches(rows, { ...DEFAULT_FILTERS, eligibility: "clear" });
    expect(clear.map((r) => r.result.opportunityId)).toEqual(["research-assistant-remote"]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterMatches(rows, { ...DEFAULT_FILTERS, country: "Atlantis" })).toEqual([]);
  });

  it("sorts eligible roles first when asked, then by score", () => {
    const out = filterMatches(rows, { ...DEFAULT_FILTERS, sort: "eligibility" });
    expect(out[0].result.eligibility).toBe("clear");
    expect(out.at(-1)?.result.eligibility).not.toBe("clear");
  });
});
