"use client";

import type { MatchResult } from "../lib/matching/types";
import { templateSummary } from "../lib/summary/template";
import type { Opportunity } from "../lib/types";

export function SummaryPanel({ opp, result }: { opp: Opportunity; result: MatchResult }) {
  return (
    <div className="rounded-md border border-brand-100 bg-brand-50 p-4" data-testid="summary">
      <p className="text-sm text-ink">{templateSummary(opp, result)}</p>
      <p className="mt-2 text-xs text-slate-600">Summary generated from the scoring rules.</p>
    </div>
  );
}
