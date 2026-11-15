import { afterEach, describe, expect, it, vi } from "vitest";
import { getOpportunity } from "../data";
import { sampleProfile } from "../../data/sampleProfile";
import { matchOne } from "../matching/engine";
import { aiSummary } from "./ai";
import { DEFAULT_OPENROUTER_MODEL, openRouterGenerator } from "./openrouter";

const ngo = getOpportunity("programme-assistant-ngo")!;
const result = matchOne(sampleProfile, ngo);
const GOOD = "This programme assistant role in Toronto fits your reporting and coordination background well. Your right to work in Canada still needs to be verified.";

function okResponse(content: string) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 });
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("openRouterGenerator", () => {
  it("returns null without OPENROUTER_API_KEY (mock mode)", () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    expect(openRouterGenerator()).toBeNull();
  });

  it("calls the OpenRouter chat completions API with the key, model and a JSON schema", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    const fetchFn = vi.fn(async () => okResponse(JSON.stringify({ summary: GOOD })));
    const generate = openRouterGenerator({ fetchFn })!;
    const out = await generate("prompt text");

    expect(out).toEqual({ summary: GOOD });
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe(DEFAULT_OPENROUTER_MODEL);
    expect(body.response_format.type).toBe("json_schema");
    expect(body.messages.at(-1)).toEqual({ role: "user", content: "prompt text" });
  });

  it("uses OPENROUTER_MODEL when set", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    vi.stubEnv("OPENROUTER_MODEL", "anthropic/claude-sonnet-5.5");
    const fetchFn = vi.fn(async () => okResponse(JSON.stringify({ summary: GOOD })));
    await openRouterGenerator({ fetchFn })!("p");
    const body = JSON.parse((fetchFn.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(body.model).toBe("anthropic/claude-sonnet-5.5");
  });

  it("an HTTP error from OpenRouter falls back to the template summary", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    const fetchFn = vi.fn(async () => new Response("rate limited", { status: 429 }));
    const out = await aiSummary(ngo, result, { generate: openRouterGenerator({ fetchFn }) });
    expect(out.source).toBe("template");
  });

  it("non-JSON content falls back to the template summary", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    const fetchFn = vi.fn(async () => okResponse("Sure! Here is a summary..."));
    const out = await aiSummary(ngo, result, { generate: openRouterGenerator({ fetchFn }) });
    expect(out.source).toBe("template");
  });

  it("a valid OpenRouter response produces an AI summary", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key");
    const fetchFn = vi.fn(async () => okResponse(JSON.stringify({ summary: GOOD })));
    const out = await aiSummary(ngo, result, { generate: openRouterGenerator({ fetchFn }) });
    expect(out).toEqual({ text: GOOD, source: "ai" });
  });
});
