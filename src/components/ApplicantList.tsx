"use client";

import { Check, ChevronDown, Download, Mail, Minus } from "lucide-react";
import { EDUCATION_LABEL, formatLanguage } from "../lib/format";
import type { MatchResult } from "../lib/matching/types";
import type { Opportunity, Profile } from "../lib/types";
import { BandBadge, EligibilityTag, ScoreFigure } from "./badges";
import { ScoreBreakdown } from "./ScoreBreakdown";
import { ScoreStrip } from "./ScoreStrip";
import { btnOutline } from "./ui";

export interface ApplicantView {
  candidateId: string;
  name: string;
  email: string;
  appliedAt: string;
  profile: Profile;
  resumeName: string | null;
  result: MatchResult;
}

const AUTH_LABEL = { yes: "Yes, stated", no: "No, stated", unknown: "Not sure" } as const;

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5 py-2 sm:grid-cols-[11rem_1fr]">
      <dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/** Real applicants for one role: score, eligibility, full profile and a resume download. */
export function ApplicantList({ role, applicants }: { role: Opportunity; applicants: ApplicantView[] }) {
  if (applicants.length === 0) {
    return (
      <p className="border-y-2 border-ink py-8 text-sm text-muted">
        No applications yet. When a candidate applies to this role, they appear here, ranked by fit.
      </p>
    );
  }
  return (
    <ol className="border-b-2 border-ink">
      {applicants.map((a, i) => {
        const { matched, missing } = a.result.skillCoverage;
        const p = a.profile;
        const auth = p.workAuthorisation[role.country];
        const date = new Date(a.appliedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
        return (
          <li key={a.candidateId} className="border-t-2 border-ink py-5" data-testid="applicant-row">
            <div className="grid gap-4 md:grid-cols-12 md:gap-6">
              <div className="flex gap-4 md:col-span-6">
                <span className="w-8 shrink-0 text-3xl font-extrabold leading-none tracking-tighter text-field">
                  <span className="sr-only">Rank </span>{i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold tracking-tight">{a.name}</h3>
                  <a href={`mailto:${a.email}`} className="inline-flex min-h-9 items-center gap-1.5 break-all text-sm font-semibold text-field underline">
                    <Mail className="size-4 shrink-0" aria-hidden />{a.email}
                  </a>
                  <p className="text-xs font-semibold text-muted">Applied {date}</p>
                  <p className="mt-2 text-sm"><strong>{matched.length} of {matched.length + missing.length}</strong> required skills</p>
                </div>
              </div>
              <div className="md:col-span-6">
                <div className="flex items-end justify-between gap-3">
                  <ScoreFigure score={a.result.score} />
                  <div className="flex flex-col items-end gap-1">
                    <BandBadge band={a.result.band} />
                    <EligibilityTag eligibility={a.result.eligibility} required={role.localWorkAuthRequired} />
                  </div>
                </div>
                <div className="mt-3"><ScoreStrip result={a.result} /></div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 md:ml-12">
              {a.resumeName ? (
                <a
                  href={`/api/employer/resume?opportunityId=${encodeURIComponent(role.id)}&candidateId=${encodeURIComponent(a.candidateId)}`}
                  download
                  className={btnOutline}
                >
                  <Download className="size-4" aria-hidden />
                  Download resume
                  <span className="sr-only"> of {a.name}</span>
                </a>
              ) : (
                <span className="text-sm text-muted">No resume attached</span>
              )}
            </div>

            <details className="group mt-3 md:ml-12">
              <summary className="inline-flex min-h-10 cursor-pointer items-center gap-1 text-sm font-bold text-field">
                Profile and score <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <dl className="mt-2 divide-y divide-line border-y border-line">
                {p.experienceSummary && <Fact label="Summary">{p.experienceSummary}</Fact>}
                <Fact label="Education">
                  {p.educationLevel ? EDUCATION_LABEL[p.educationLevel] : "Not provided"}
                  {p.educationField && `, ${p.educationField}`}
                </Fact>
                <Fact label="Experience">{p.yearsExperience === null ? "Not provided" : `${p.yearsExperience} years`}</Fact>
                <Fact label="Skills">{p.skills.join(", ") || "Not provided"}</Fact>
                <Fact label="Languages">{p.languages.map(formatLanguage).join(", ") || "Not provided"}</Fact>
                <Fact label="Preferred countries">{p.preferredCountries.join(", ") || "Not provided"}</Fact>
                <Fact label={`Right to work in ${role.country}`}>{auth ? AUTH_LABEL[auth] : "Not stated"}</Fact>
              </dl>
              <div className="mt-4 grid gap-6 sm:grid-cols-2">
                <ul className="space-y-1.5 text-sm">
                  {a.result.strengths.slice(0, 3).map((s) => (
                    <li key={s} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-met" aria-hidden />{s}</li>
                  ))}
                </ul>
                <ul className="space-y-1.5 text-sm">
                  {a.result.gaps.slice(0, 3).map((g) => (
                    <li key={g} className="flex gap-2"><Minus className="mt-0.5 size-4 shrink-0 text-blocked" aria-hidden />{g}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-4"><ScoreBreakdown result={a.result} /></div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
