import { CRITICAL_CAP } from "../lib/matching/engine";
import type { MatchResult } from "../lib/matching/types";

const SHORT: Record<string, string> = {
  skills: "Skills",
  experience: "Experience",
  education: "Education",
  location: "Location",
  language: "Language",
  interests: "Interests",
};

/**
 * The signature element: one unbroken strip on a fixed 0–100 scale. Each segment's width is the
 * criterion's weight; its fill is the points earned. Hatched fill = neutral credit for missing data.
 * Every strip uses the same scale, so roles compare at a glance.
 */
export function ScoreStrip({
  result,
  variant = "compact",
  onField = false,
  animate = false,
}: {
  result: MatchResult;
  variant?: "compact" | "full";
  onField?: boolean;
  animate?: boolean;
}) {
  const raw = result.criteria.reduce((s, c) => s + c.points, 0);
  const capped = result.band === "Critical gap" && raw > result.score;
  const fill = onField ? "bg-paper" : "bg-field";
  const track = onField ? "bg-field-deep" : "bg-slate-200";
  const divider = onField ? "border-field" : "border-paper";
  const full = variant === "full";
  const desc = result.criteria.map((c) => `${c.label} ${c.points} of ${c.weight}`).join(", ");

  return (
    <figure className="w-full" aria-label={`Score breakdown: ${desc}. Total ${raw}${capped ? `, capped at ${CRITICAL_CAP}` : ""}.`}>
      {full && (
        <div className="flex" aria-hidden>
          {result.criteria.map((c) => (
            <div key={c.key} style={{ width: `${c.weight}%` }} className="min-w-0 pr-1">
              <span className={`block truncate text-[11px] font-bold uppercase tracking-wide ${onField ? "text-on-field-muted" : "text-muted"}`}>
                {SHORT[c.key]}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className={`relative mt-1 flex ${full ? "h-5" : "h-2.5"} ${animate ? "strip-fill" : ""}`} aria-hidden>
        {result.criteria.map((c) => {
          const pct = Math.max(0, Math.min(100, (c.points / c.weight) * 100));
          return (
            <div key={c.key} style={{ width: `${c.weight}%` }} className={`relative h-full border-r-2 last:border-r-0 ${divider} ${track}`}>
              <div style={{ width: `${pct}%` }} className={`h-full ${c.status === "unknown" ? "hatch" : fill}`} />
            </div>
          );
        })}
        {capped && (
          <div className="absolute inset-y-[-4px] w-0.5 bg-blocked" style={{ left: `${CRITICAL_CAP}%` }} />
        )}
      </div>
      {full && (
        <div className="mt-1.5 flex" aria-hidden>
          {result.criteria.map((c) => (
            <div key={c.key} style={{ width: `${c.weight}%` }} className="min-w-0 pr-1">
              <span className={`block text-sm font-bold tabular-nums ${onField ? "text-on-field" : "text-ink"}`}>
                {c.points}
                <span className={`font-medium ${onField ? "text-on-field-muted" : "text-muted"}`}>/{c.weight}</span>
              </span>
            </div>
          ))}
        </div>
      )}
      {full && capped && (
        <figcaption className={`mt-2 text-xs font-semibold ${onField ? "text-verify" : "text-blocked"}`}>
          Raw {raw}, capped at {CRITICAL_CAP} because a hard requirement is not met.
        </figcaption>
      )}
    </figure>
  );
}
