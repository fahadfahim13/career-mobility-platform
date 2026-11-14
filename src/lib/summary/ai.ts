import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import type { MatchResult } from "../matching/types";
import type { Opportunity } from "../types";
import { templateSummary } from "./template";

export const SUMMARY_MODEL = "claude-haiku-5-5";
const DEFAULT_TIMEOUT_MS = 6000;

/** Returns the model's raw structured output (untrusted). Injected so tests never call the network. */
export type SummaryGenerator = (prompt: string) => Promise<unknown>;

export interface SummaryResult {
  text: string;
  source: "ai" | "template";
}

const outputSchema = z.object({ summary: z.string() });
const acceptedSchema = z.object({ summary: z.string().trim().min(40).max(600) });

const SYSTEM = [
  "You write a two-sentence summary of how well a candidate matches a job, for the candidate to read.",
  "Use only the facts in the JSON you are given. Do not add skills, requirements, numbers or scores that are not in it.",
  "Never state or imply a visa, immigration or work-authorisation outcome. If the input contains a 'verify' flag, say that the right to work still needs to be verified.",
  "If the input contains a 'critical' flag, mention that requirement plainly as the main obstacle.",
  "Write in plain, professional British English. No bullet points, no headings, no score.",
].join(" ");

/** Builds the prompt. Only role facts and the rule-engine output are included; no free-text profile fields. */
export function buildPrompt(opp: Opportunity, r: MatchResult): string {
  const payload = {
    role: { title: opp.title, organisation: opp.organisation, country: opp.country, type: opp.type },
    band: r.band,
    strengths: r.strengths,
    gaps: r.gaps,
    flags: r.flags.map((f) => ({ kind: f.kind, message: f.message })),
  };
  return `Summarise this match result:\n${JSON.stringify(payload)}`;
}

/** Rejects summaries that mention numbers not present in the input (e.g. an invented score). */
function hasInventedNumbers(summary: string, prompt: string): boolean {
  const numbers = summary.match(/\d+/g) ?? [];
  return numbers.some((n) => !prompt.includes(n));
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`AI summary timed out after ${ms} ms`)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

/** Real generator backed by the Anthropic API, or null when no API key is configured (mock mode). */
export function defaultGenerator(timeoutMs = DEFAULT_TIMEOUT_MS): SummaryGenerator | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic({ timeout: timeoutMs, maxRetries: 0 });
  return async (prompt) => {
    const response = await client.messages.parse({
      model: SUMMARY_MODEL,
      max_tokens: 400,
      output_config: { effort: "low", format: zodOutputFormat(outputSchema) },
      system: SYSTEM,
      messages: [{ role: "user", content: prompt }],
    });
    if (response.stop_reason !== "end_turn") throw new Error(`Unexpected stop reason: ${response.stop_reason}`);
    return response.parsed_output;
  };
}

/**
 * AI-written summary with a deterministic fallback. The AI never changes the score, band or flags:
 * it only rephrases the rule output. Any failure, timeout or output that fails validation returns
 * the template summary instead.
 */
export async function aiSummary(
  opp: Opportunity,
  r: MatchResult,
  deps: { generate?: SummaryGenerator | null; timeoutMs?: number } = {},
): Promise<SummaryResult> {
  const fallback: SummaryResult = { text: templateSummary(opp, r), source: "template" };
  const timeoutMs = deps.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const generate = deps.generate === undefined ? defaultGenerator(timeoutMs) : deps.generate;
  if (!generate) return fallback;

  const prompt = buildPrompt(opp, r);
  try {
    const raw = await withTimeout(generate(prompt), timeoutMs);
    const parsed = acceptedSchema.safeParse(raw);
    if (!parsed.success || hasInventedNumbers(parsed.data.summary, prompt)) return fallback;
    return { text: parsed.data.summary, source: "ai" };
  } catch (err) {
    console.warn("[summary] falling back to template:", err instanceof Error ? err.message : err);
    return fallback;
  }
}
