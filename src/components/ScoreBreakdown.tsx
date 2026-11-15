import { CRITICAL_CAP } from "../lib/matching/engine";
import type { MatchResult } from "../lib/matching/types";
import { StatusText } from "./badges";

/**
 * The full rule trace: weight × share earned = points, for every criterion, then the total.
 * On narrow screens the reasoning moves under the criterion name.
 */
export function ScoreBreakdown({ result }: { result: MatchResult }) {
  const raw = result.criteria.reduce((s, c) => s + c.points, 0);
  const capped = result.band === "Critical gap" && raw > result.score;
  const share = (c: MatchResult["criteria"][number]) => (c.score === null ? "0.50 (not provided)" : c.score.toFixed(2));
  return (
    <div>
      <table className="w-full text-left text-sm">
        <caption className="sr-only">How the match score was calculated</caption>
        <thead className="border-b-2 border-ink text-xs font-bold uppercase tracking-wide text-muted">
          <tr>
            <th scope="col" className="py-2 pr-3">Criterion</th>
            <th scope="col" className="py-2 pr-3">Status</th>
            <th scope="col" className="hidden py-2 pr-3 md:table-cell">Weight × share</th>
            <th scope="col" className="py-2 pr-3 text-right">Points</th>
            <th scope="col" className="hidden py-2 pl-2 lg:table-cell">Reasoning</th>
          </tr>
        </thead>
        <tbody>
          {result.criteria.map((c) => (
            <tr key={c.key} className="border-b border-line align-top" data-testid="breakdown-row">
              <th scope="row" className="py-3 pr-3 font-normal">
                <span className="font-bold">{c.label}</span>
                <span className="mt-0.5 block text-muted lg:hidden">{c.detail}</span>
              </th>
              <td className="py-3 pr-3"><StatusText status={c.status} /></td>
              <td className="hidden whitespace-nowrap py-3 pr-3 tabular-nums text-muted md:table-cell">
                {c.weight} × {share(c)}
              </td>
              <td className="whitespace-nowrap py-3 pr-3 text-right font-bold tabular-nums">{c.points} / {c.weight}</td>
              <td className="hidden py-3 pl-2 text-muted lg:table-cell">{c.detail}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="pt-3 font-extrabold">Total</th>
            <td />
            <td className="hidden md:table-cell" />
            <td className="whitespace-nowrap pr-3 pt-3 text-right text-base font-extrabold tabular-nums">
              {capped ? (
                <>
                  <s className="font-medium text-muted">{raw}</s> {result.score} / 100
                </>
              ) : (
                `${raw} / 100`
              )}
            </td>
            <td className="hidden lg:table-cell" />
          </tr>
        </tfoot>
      </table>
      <p className="mt-3 text-sm text-muted">
        {capped
          ? `A hard requirement is not met, so the score is capped at ${CRITICAL_CAP}. A blocked role can never outrank an eligible one on skills alone.`
          : "Criteria marked “Not provided” receive half their weight: neither rewarded nor penalised."}
      </p>
    </div>
  );
}
