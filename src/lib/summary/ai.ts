import { z } from "zod";
import type { MatchResult } from "../matching/types";
import type { Opportunity } from "../types";
import { openRouterGenerator } from "./openrouter";
import { buildPrompt } from "./prompt";
import { templateSummary } from "./template";

const DEFAULT_TIMEOUT_MS = 8000;

/** Returns the model's raw structured output (untrusted). Injected so tests never call the network. */
export type SummaryGenerator = (prompt: string) => Promise<unknown>;

export interface SummaryResult {
  text: string;
  source: "ai" | "template";
}

const acceptedSchema = z.object({ summary: z.string().trim().min(40).max(600) });

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
  const generate = deps.generate === undefined ? openRouterGenerator({ timeoutMs }) : deps.generate;
  if (!generate) return fallback;

  const prompt = buildPrompt(opp, r);
  try {
    const raw = await withTimeout(generate(prompt), timeoutMs);
    const parsed = acceptedSchema.safeParse(raw);
    if (!parsed.success || hasInventedNumbers(parsed.data.summary, prompt)) return fallback;
    // A summary must never drop the work-authorisation caveat the rules raised.
    if (r.flags.some((f) => f.kind === "verify") && !/verif/i.test(parsed.data.summary)) return fallback;
    return { text: parsed.data.summary, source: "ai" };
  } catch (err) {
    console.warn("[summary] falling back to template:", err instanceof Error ? err.message : err);
    return fallback;
  }
}
