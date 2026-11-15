import { Check, CircleHelp, OctagonX, ShieldQuestion } from "lucide-react";
import type { Band, CriterionStatus, Eligibility } from "../lib/matching/types";

const tag = "inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-0.5 text-xs font-bold uppercase tracking-wide";

const BAND_STYLE: Record<Band, string> = {
  Strong: "bg-met text-white",
  Partial: "bg-ink text-paper",
  Weak: "bg-slate-200 text-ink",
  "Critical gap": "bg-blocked text-white",
};

const BAND_LABEL: Record<Band, string> = {
  Strong: "Strong match",
  Partial: "Partial match",
  Weak: "Weak match",
  "Critical gap": "Critical gap",
};

export function BandBadge({ band }: { band: Band }) {
  return <span className={`${tag} ${BAND_STYLE[band]}`}>{BAND_LABEL[band]}</span>;
}

const ELIGIBILITY: Record<Eligibility, { label: string; cls: string; Icon: typeof Check }> = {
  clear: { label: "Right to work stated", cls: "bg-met-tint text-met", Icon: Check },
  verify: { label: "Eligibility to verify", cls: "bg-verify text-ink", Icon: ShieldQuestion },
  blocked: { label: "You stated no right to work", cls: "bg-blocked-tint text-blocked", Icon: OctagonX },
};

/**
 * Right-to-work status, shown apart from the fit score so a high score never reads as "eligible".
 * Roles that need no local work authorisation are shown as not required rather than "confirmed".
 */
export function EligibilityTag({ eligibility, required = true }: { eligibility: Eligibility; required?: boolean }) {
  if (!required) {
    return (
      <span className={`${tag} bg-slate-100 text-muted`}>
        <Check className="size-3.5" aria-hidden />
        No local permit needed
      </span>
    );
  }
  const e = ELIGIBILITY[eligibility];
  return (
    <span className={`${tag} ${e.cls}`} data-testid={eligibility === "verify" ? "verify-badge" : undefined}>
      <e.Icon className="size-3.5" aria-hidden />
      {e.label}
    </span>
  );
}

/** Big tabular score. `size` lg is used on detail pages and the landing demo. */
export function ScoreFigure({ score, size = "md", onField = false }: { score: number; size?: "md" | "lg"; onField?: boolean }) {
  const big = size === "lg" ? "text-7xl sm:text-8xl" : "text-5xl";
  return (
    <span className={`inline-flex items-baseline font-extrabold leading-none tracking-tighter ${big}`}>
      <span className="sr-only">Match score {score} out of 100</span>
      <span aria-hidden>{score}</span>
      <span aria-hidden className={`ml-1 text-sm font-semibold tracking-normal ${onField ? "text-on-field-muted" : "text-muted"}`}>/100</span>
    </span>
  );
}

const STATUS: Record<CriterionStatus, { label: string; cls: string; Icon: typeof Check }> = {
  met: { label: "Met", cls: "text-met", Icon: Check },
  partial: { label: "Partial", cls: "text-verify-ink", Icon: CircleHelp },
  unmet: { label: "Not met", cls: "text-blocked", Icon: OctagonX },
  unknown: { label: "Not provided", cls: "text-muted", Icon: CircleHelp },
};

export function StatusText({ status }: { status: CriterionStatus }) {
  const s = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap font-semibold ${s.cls}`}>
      <s.Icon className="size-3.5" aria-hidden />
      {s.label}
    </span>
  );
}
