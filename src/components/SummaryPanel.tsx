"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { MatchResult } from "../lib/matching/types";
import type { SummaryResult } from "../lib/summary/ai";
import { templateSummary } from "../lib/summary/template";
import type { Opportunity, Profile } from "../lib/types";

/**
 * Shows the rule-based summary immediately, then swaps in the AI-written version if the server
 * returns one. Any network or server failure keeps the rule-based text.
 */
export function SummaryPanel({ opp, result, profile }: { opp: Opportunity; result: MatchResult; profile: Profile }) {
  const [summary, setSummary] = useState<SummaryResult>(() => ({ text: templateSummary(opp, result), source: "template" }));
  const [loading, setLoading] = useState(true);

  // Keyed on content, not object identity: storage re-syncs (e.g. a shortlist toggle) create a new
  // but identical result object and must not trigger another AI request.
  const resultKey = JSON.stringify(result);
  const profileKey = JSON.stringify(profile);

  useEffect(() => {
    const current = JSON.parse(resultKey) as MatchResult;
    const controller = new AbortController();
    setSummary({ text: templateSummary(opp, current), source: "template" });
    setLoading(true);
    fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The server recomputes the match from the profile; the free-text summary is never sent.
      body: JSON.stringify({ opportunityId: opp.id, profile: { ...(JSON.parse(profileKey) as Profile), experienceSummary: "" } }),
      signal: controller.signal,
    })
      .then((res) => (res.ok ? (res.json() as Promise<SummaryResult>) : null))
      .then((data) => {
        if (data && typeof data.text === "string") setSummary(data);
      })
      .catch(() => {
        /* Keep the rule-based summary. */
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [opp, resultKey, profileKey]);

  return (
    <div className="rounded-md border border-brand-100 bg-brand-50 p-4" data-testid="summary" aria-busy={loading}>
      <p className="text-sm text-ink">{summary.text}</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600" data-testid="summary-source">
        {summary.source === "ai" ? (
          <>
            <Sparkles className="size-3.5" aria-hidden />
            Written by AI from the score breakdown above. The score itself is calculated by fixed rules.
          </>
        ) : (
          "Summary generated from the scoring rules."
        )}
      </p>
    </div>
  );
}
