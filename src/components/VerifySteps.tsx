import { ExternalLink } from "lucide-react";
import { getCountryGuide } from "../data/countryGuides";
import type { Opportunity } from "../lib/types";

/** Steps to verify before applying, linked to official sources. Never a statement of eligibility. */
export function VerifySteps({ opp }: { opp: Opportunity }) {
  const guide = getCountryGuide(opp.country);
  return (
    <section aria-labelledby="verify-h" className="bg-verify-tint p-5 sm:p-6">
      <h2 id="verify-h" className="text-lg font-bold tracking-tight">
        Steps to verify before applying in {opp.country}
      </h2>
      {!opp.localWorkAuthRequired && (
        <p className="mt-2 text-sm">
          This is a remote contract that does not require the right to work in {opp.country}. Check the tax and contract rules
          where you live.
        </p>
      )}
      <ol className="mt-4 space-y-3">
        {guide.steps.map((s, i) => (
          <li key={s} className="grid grid-cols-[2rem_1fr] text-sm">
            <span className="flex size-6 items-center justify-center bg-ink text-xs font-bold text-paper" aria-hidden>{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
      {guide.sources.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {guide.sources.map((src) => (
            <li key={src.url}>
              <a href={src.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 border border-ink bg-paper px-3 text-sm font-semibold hover:bg-ink hover:text-paper">
                {src.label}
                <ExternalLink className="size-3.5" aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 border-t border-verify-ink/20 pt-3 text-xs text-verify-ink">
        This information is for reference only and is not legal or immigration advice. No decision about your eligibility is
        made from your answers. Rules change; the official authority is the only source of a decision.
      </p>
    </section>
  );
}
