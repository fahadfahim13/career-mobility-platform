import { ArrowDown, ArrowRight, Building2, Check, Gauge, ShieldCheck, UserRound, X } from "lucide-react";
import { CRITICAL_CAP } from "../lib/matching/engine";
import { LABELS, WEIGHTS } from "../lib/matching/criteria";
import type { CriterionKey } from "../lib/matching/types";
import { EligibilityTag } from "./badges";

/** One navy, stepped down in opacity, so the chart stays inside the palette. */
const SHADES = [1, 0.8, 0.62, 0.46, 0.32, 0.2];

/**
 * Donut chart of the six criterion weights. Values come straight from the engine,
 * so the chart can never drift from the real scoring.
 */
export function WeightsDonut({ onField = false }: { onField?: boolean }) {
  const keys = Object.keys(WEIGHTS) as CriterionKey[];
  const total = keys.reduce((s, k) => s + WEIGHTS[k], 0);
  const r = 15.915; // circumference ≈ 100, so dash lengths equal percentages
  let offset = 25; // start at 12 o'clock
  const stroke = onField ? "#ffffff" : "var(--color-field)";

  return (
    <figure className="grid items-center gap-6 sm:grid-cols-[11rem_1fr]">
      <svg viewBox="0 0 42 42" className="mx-auto size-44" role="img" aria-label={`Score weights: ${keys.map((k) => `${LABELS[k]} ${WEIGHTS[k]}`).join(", ")}`}>
        {keys.map((k, i) => {
          const pct = (WEIGHTS[k] / total) * 100;
          const el = (
            <circle
              key={k}
              cx="21"
              cy="21"
              r={r}
              fill="none"
              stroke={stroke}
              strokeOpacity={SHADES[i]}
              strokeWidth="6"
              strokeDasharray={`${pct - 0.6} ${100 - pct + 0.6}`}
              strokeDashoffset={offset}
            />
          );
          offset -= pct;
          return el;
        })}
        <text x="21" y="20.5" textAnchor="middle" className="fill-current text-[7px] font-extrabold">{total}</text>
        <text x="21" y="26" textAnchor="middle" className="fill-current text-[2.6px] font-semibold uppercase tracking-wider opacity-70">points</text>
      </svg>
      <figcaption>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {keys.map((k, i) => (
            <li key={k} className="flex items-center gap-2">
              <span className="size-3 shrink-0" style={{ background: stroke, opacity: SHADES[i] }} aria-hidden />
              <span className="flex-1">{LABELS[k]}</span>
              <span className="font-bold tabular-nums">{WEIGHTS[k]}</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

/** Decision diagram: one question per country, three outcomes. */
export function EligibilityFlow({ onField = false }: { onField?: boolean }) {
  const box = onField ? "border-on-field-muted/50 bg-field-deep" : "border-line bg-white";
  const muted = onField ? "text-on-field-muted" : "text-muted";
  const outcomes = [
    { answer: "Yes", tag: "clear" as const, note: "Shown as stated." },
    { answer: "Not sure", tag: "verify" as const, note: "Official steps linked. No points lost." },
    { answer: "No", tag: "blocked" as const, note: `Score capped at ${CRITICAL_CAP}.` },
  ];
  return (
    <figure aria-label="How right to work is decided">
      <div className={`mx-auto flex max-w-xs items-center justify-center gap-2 border px-4 py-3 text-center text-sm font-bold ${box}`}>
        <ShieldCheck className="size-5 shrink-0" aria-hidden />
        Right to work in this country?
      </div>
      <div className="flex justify-center py-2" aria-hidden>
        <ArrowDown className={`size-5 ${muted}`} />
      </div>
      <ol className="space-y-2">
        {outcomes.map((o) => (
          <li key={o.answer} className={`grid items-center gap-x-4 gap-y-1 border p-3 text-sm sm:grid-cols-[5rem_1fr] ${box}`}>
            <p className="font-bold">{o.answer}</p>
            <div className="min-w-0">
              <EligibilityTag eligibility={o.tag} />
              <p className={`mt-1 ${muted}`}>{o.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/** The two-sided flow: candidates and employers meet in one engine. */
export function TwoSidedFlow() {
  const side = (Icon: typeof UserRound, title: string, items: string[]) => (
    <div className="border border-line bg-white p-5">
      <Icon className="size-7 text-field" aria-hidden />
      <p className="mt-2 font-bold">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-muted">
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
  const arrow = (
    <div className="flex items-center justify-center text-field" aria-hidden>
      <ArrowRight className="hidden size-6 lg:block" />
      <ArrowDown className="size-6 lg:hidden" />
    </div>
  );
  return (
    <figure className="grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1.1fr_auto_1fr]" aria-label="Candidate profile and employer role meet in the matching engine">
      {side(UserRound, "Candidate profile", ["Skills and experience", "Languages", "Right to work, per country"])}
      {arrow}
      <div className="on-field flex flex-col justify-center bg-field p-5 text-on-field">
        <Gauge className="size-7" aria-hidden />
        <p className="mt-2 text-lg font-bold">Pathway match</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <span className="border border-on-field-muted/50 px-2 py-1.5 text-center font-semibold">Fit score 0–100</span>
          <span className="border border-on-field-muted/50 px-2 py-1.5 text-center font-semibold">Right to work</span>
        </div>
      </div>
      <div className="flex items-center justify-center text-field" aria-hidden>
        <ArrowRight className="hidden size-6 rotate-180 lg:block" />
        <ArrowDown className="size-6 rotate-180 lg:hidden" />
      </div>
      {side(Building2, "Employer role", ["Required skills", "Experience range", "Location and languages"])}
    </figure>
  );
}

/** Typical tools versus Pathway, as a check matrix instead of prose. */
export function CompareMatrix({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="grid gap-px bg-line">
      <div className="grid grid-cols-[1fr_4rem_5.5rem] bg-paper text-xs font-bold uppercase tracking-normal text-muted sm:tracking-wider sm:grid-cols-[1fr_7rem_7rem]">
        <span className="p-3"><span className="sr-only">Feature</span></span>
        <span className="p-3 text-center">Typical</span>
        <span className="bg-field p-3 text-center text-on-field">Pathway</span>
      </div>
      {rows.map(([topic, them, us]) => (
        <div key={topic} className="grid grid-cols-[1fr_4rem_5.5rem] items-center bg-paper sm:grid-cols-[1fr_7rem_7rem]">
          <div className="p-3">
            <p className="font-bold">{topic}</p>
            <p className="text-sm text-muted">{us}</p>
          </div>
          <div className="flex justify-center p-3" title={them}>
            <X className="size-5 text-blocked" aria-label={`Typical: ${them}`} />
          </div>
          <div className="flex h-full items-center justify-center bg-field-tint p-3">
            <Check className="size-5 text-field" aria-label="Pathway: yes" />
          </div>
        </div>
      ))}
    </div>
  );
}
