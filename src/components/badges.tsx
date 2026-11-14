import type { Band, CriterionStatus } from "../lib/matching/types";

const BAND_STYLE: Record<Band, string> = {
  Strong: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  Partial: "bg-amber-50 text-amber-900 ring-amber-200",
  Weak: "bg-slate-100 text-slate-700 ring-slate-200",
  "Critical gap": "bg-red-50 text-red-800 ring-red-200",
};

const BAND_LABEL: Record<Band, string> = {
  Strong: "Strong match",
  Partial: "Partial match",
  Weak: "Weak match",
  "Critical gap": "Critical gap",
};

export function BandBadge({ band }: { band: Band }) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${BAND_STYLE[band]}`}>
      {BAND_LABEL[band]}
    </span>
  );
}

/** Shown beside the band whenever eligibility is unconfirmed, so a high score never reads as "eligible". */
export function VerifyBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span data-testid="verify-badge" className="inline-flex whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900 ring-1 ring-inset ring-amber-200">
      Eligibility to verify
    </span>
  );
}

export function ScorePill({ score }: { score: number }) {
  return (
    <span className="text-2xl font-semibold tabular-nums text-ink" aria-label={`Match score ${score} out of 100`}>
      {score}
      <span className="text-sm font-normal text-slate-500">/100</span>
    </span>
  );
}

const STATUS_STYLE: Record<CriterionStatus, string> = {
  met: "text-emerald-700",
  partial: "text-amber-800",
  unmet: "text-red-700",
  unknown: "text-slate-600",
};

const STATUS_LABEL: Record<CriterionStatus, string> = {
  met: "Met",
  partial: "Partial",
  unmet: "Not met",
  unknown: "Not provided",
};

export function StatusText({ status }: { status: CriterionStatus }) {
  return <span className={`whitespace-nowrap font-medium ${STATUS_STYLE[status]}`}>{STATUS_LABEL[status]}</span>;
}
