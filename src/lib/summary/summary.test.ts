import { describe, expect, it } from "vitest";
import { getOpportunity } from "../data";
import { sampleProfile } from "../../data/sampleProfile";
import { matchOne } from "../matching/engine";
import { aiSummary, type SummaryGenerator } from "./ai";
import { templateSummary } from "./template";

const ngo = getOpportunity("programme-assistant-ngo")!;
const analyst = getOpportunity("junior-data-analyst-amsterdam")!;
const ngoResult = matchOne(sampleProfile, ngo);
const analystResult = matchOne(sampleProfile, analyst);

const GOOD =
  "This programme assistant role in Toronto fits your reporting and coordination background well. Your right to work in Canada still needs to be verified.";

describe("templateSummary", () => {
  it("template mentions band and top gap", () => {
    const text = templateSummary(analyst, analystResult);
    expect(text).toContain("Partial");
    expect(text).toContain("SQL");
  });

  it("mentions verification when work authorisation is unknown", () => {
    expect(templateSummary(ngo, ngoResult)).toMatch(/verified/);
  });
});

describe("aiSummary", () => {
  it("no key → source template", async () => {
    const out = await aiSummary(ngo, ngoResult, { generate: null });
    expect(out).toEqual({ text: templateSummary(ngo, ngoResult), source: "template" });
  });

  it("client throws → template", async () => {
    const generate: SummaryGenerator = async () => {
      throw new Error("503 overloaded");
    };
    expect((await aiSummary(ngo, ngoResult, { generate })).source).toBe("template");
  });

  it("client returns non-JSON → template", async () => {
    const generate: SummaryGenerator = async () => "not json at all";
    expect((await aiSummary(ngo, ngoResult, { generate })).source).toBe("template");
  });

  it("rejects summaries that are too short or invent numbers", async () => {
    const short: SummaryGenerator = async () => ({ summary: "Good fit." });
    const invented: SummaryGenerator = async () => ({ summary: `${GOOD} You scored 97 out of 100.` });
    expect((await aiSummary(ngo, ngoResult, { generate: short })).source).toBe("template");
    expect((await aiSummary(ngo, ngoResult, { generate: invented })).source).toBe("template");
  });

  it("slow client beyond timeout → template", async () => {
    const generate: SummaryGenerator = () => new Promise((r) => setTimeout(() => r({ summary: GOOD }), 200));
    const out = await aiSummary(ngo, ngoResult, { generate, timeoutMs: 20 });
    expect(out.source).toBe("template");
  });

  it("valid JSON → source ai", async () => {
    let prompt = "";
    const generate: SummaryGenerator = async (p) => {
      prompt = p;
      return { summary: GOOD };
    };
    const out = await aiSummary(ngo, ngoResult, { generate });
    expect(out).toEqual({ text: GOOD, source: "ai" });
    // Only rule output and role facts are sent; never free-text profile fields.
    expect(prompt).not.toContain(sampleProfile.experienceSummary);
    expect(prompt).toContain("Programme Assistant");
  });
});
