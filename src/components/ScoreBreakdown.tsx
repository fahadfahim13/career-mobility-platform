import { CRITICAL_CAP } from "../lib/matching/engine";
import type { MatchResult } from "../lib/matching/types";
import { StatusText } from "./badges";

/**
 * Per-criterion score table. On narrow screens the reasoning moves under each criterion name
 * instead of taking its own column, so nothing is squeezed into a one-word-wide cell.
 */
export function ScoreBreakdown({ result }: { result: MatchResult }) {
  const raw = result.criteria.reduce((s, c) => s + c.points, 0);
  const note =
    result.band === "Critical gap" && raw > result.score
      ? `Final score capped at ${CRITICAL_CAP} because a hard requirement is not met.`
      : "Criteria marked “Not provided” receive 50% of their weight.";
  return (
    <div>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">How the match score was calculated</caption>
        <thead className="border-b border-line text-xs font-semibold text-slate-600">
          <tr>
            <th scope="col" className="py-2 pr-3">Criterion</th>
            <th scope="col" className="py-2 pr-3">Status</th>
            <th scope="col" className="py-2 pr-3 text-right">Points</th>
            <th scope="col" className="hidden py-2 pl-1 sm:table-cell">Reasoning</th>
          </tr>
        </thead>
        <tbody>
          {result.criteria.map((c) => (
            <tr key={c.key} className="border-b border-slate-100 align-top" data-testid="breakdown-row">
              <th scope="row" className="py-2.5 pr-3 font-normal">
                <span className="font-medium text-ink">{c.label}</span>
                <span className="mt-0.5 block text-slate-600 sm:hidden">{c.detail}</span>
              </th>
              <td className="py-2.5 pr-3"><StatusText status={c.status} /></td>
              <td className="whitespace-nowrap py-2.5 pr-3 text-right tabular-nums">{c.points} / {c.weight}</td>
              <td className="hidden py-2.5 pl-1 text-slate-700 sm:table-cell">{c.detail}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="pt-3 font-semibold text-ink">Total</th>
            <td />
            <td className="whitespace-nowrap pr-3 pt-3 text-right font-semibold tabular-nums">{raw} / 100</td>
            <td className="hidden pl-1 pt-3 text-slate-600 sm:table-cell">{note}</td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-2 text-sm text-slate-600 sm:hidden">{note}</p>
    </div>
  );
}
