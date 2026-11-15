import { SYSTEM_PROMPT } from "./prompt";
import type { SummaryGenerator } from "./ai";

export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const DEFAULT_OPENROUTER_MODEL = "anthropic/claude-haiku-5.5";

const SUMMARY_JSON_SCHEMA = {
  type: "object",
  properties: { summary: { type: "string", description: "Two-sentence match summary" } },
  required: ["summary"],
  additionalProperties: false,
};

/**
 * Summary generator backed by OpenRouter (OpenAI-compatible chat completions API).
 * Returns null when OPENROUTER_API_KEY is not set, which puts the app in mock mode.
 * The returned value is the model's parsed JSON, still untrusted: aiSummary validates it.
 */
export function openRouterGenerator(deps: { fetchFn?: typeof fetch; timeoutMs?: number } = {}): SummaryGenerator | null {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;
  const model = process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL;
  const fetchFn = deps.fetchFn ?? fetch;

  return async (prompt) => {
    const res = await fetchFn(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Title": "Pathway career matching",
      },
      body: JSON.stringify({
        model,
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "match_summary", strict: true, schema: SUMMARY_JSON_SCHEMA },
        },
      }),
      signal: deps.timeoutMs ? AbortSignal.timeout(deps.timeoutMs) : undefined,
    });
    if (!res.ok) throw new Error(`OpenRouter returned HTTP ${res.status}`);
    const data = (await res.json()) as { choices?: { message?: { content?: unknown } }[] };
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("OpenRouter response had no message content");
    return JSON.parse(content) as unknown; // Throws on non-JSON; the caller falls back to the template.
  };
}
