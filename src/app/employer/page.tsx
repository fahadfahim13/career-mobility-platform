"use client";

import { Check, ChevronDown, Minus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BandBadge, EligibilityTag, ScoreFigure } from "../../components/badges";
import { ApplicantList, type ApplicantView } from "../../components/ApplicantList";
import { ScoreBreakdown } from "../../components/ScoreBreakdown";
import { ScoreStrip } from "../../components/ScoreStrip";
import { HeroStats, PageHero } from "../../components/PageHero";
import { btnOnField, btnOnFieldOutline, btnPrimary, btnSecondary, field, fieldLabel, wrap } from "../../components/ui";
import team from "../../../public/images/team.webp";
import { candidates } from "../../data/candidates";
import { useAccount } from "../../hooks/useLocalState";
import { getOpportunities } from "../../lib/data";
import { formatSalary, refCode } from "../../lib/format";
import { rankCandidates, type CandidateSort } from "../../lib/rankCandidates";

export default function EmployerPage() {
  const { account, ready } = useAccount();
  const all = getOpportunities();
  // Employers see only their own organisation's roles (one per organisation in this dataset).
  const roles = account?.organisation ? all.filter((r) => r.organisation === account.organisation) : [];
  const [roleId, setRoleId] = useState<string | null>(null);
  const [sort, setSort] = useState<CandidateSort>("fit");
  const role = roles.find((r) => r.id === roleId) ?? roles[0] ?? all[0];
  const rows = useMemo(() => rankCandidates(role, candidates, sort), [role, sort]);
  const [applicants, setApplicants] = useState<Record<string, ApplicantView[]> | null>(null);
  const [loadError, setLoadError] = useState(false);

  const isEmployer = account?.role === "employer";
  useEffect(() => {
    if (!isEmployer) return;
    let live = true;
    fetch("/api/employer/applicants", { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<{ roles: { opportunityId: string; applicants: ApplicantView[] }[] }>;
      })
      .then((d) => live && setApplicants(Object.fromEntries(d.roles.map((r) => [r.opportunityId, r.applicants]))))
      .catch(() => live && setLoadError(true));
    return () => {
      live = false;
    };
  }, [isEmployer]);
  const roleApplicants = applicants?.[role.id] ?? [];

  if (!ready) {
    return (
      <>
        <PageHero eyebrow="For employers" title="Candidates" photo={team} />
        <p className={`${wrap} py-12 text-sm text-muted`} role="status">Loading…</p>
      </>
    );
  }
  if (!account || account.role !== "employer") {
    return (
      <PageHero
        eyebrow="For employers"
        title="Find qualified international candidates"
        intro="Sign in with an employer account to see candidates ranked against your roles."
        photo={team}
        photoAlt="A hiring team reviewing candidates around a table"
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/signup?role=employer" className={btnOnField}>Create employer account</Link>
          <Link href="/signin" className={btnOnFieldOutline}>Sign in</Link>
        </div>
      </PageHero>
    );
  }

  const strong = roleApplicants.filter((r) => r.result.band === "Strong").length;
  const withResume = roleApplicants.filter((r) => r.resumeName).length;

  return (
    <>
    <PageHero
      eyebrow={account.organisation}
      title="Candidates"
      intro={`Applicants for ${role.title}, ${role.city}. Ranked by fit. Right to work is shown separately.`}
      photo={team}
      photoAlt="A hiring team reviewing candidates around a table"
    >
      <HeroStats
        items={[
          { value: applicants ? roleApplicants.length : "–", label: "Applicants" },
          { value: applicants ? strong : "–", label: "Strong matches" },
          { value: applicants ? withResume : "–", label: "With resume" },
        ]}
      />
    </PageHero>
    <div className={`${wrap} space-y-8 py-12 sm:py-16`}>

      {roles.length > 1 && (
        <div>
          <label htmlFor="role" className={fieldLabel}>Open role</label>
          <select id="role" className={field} value={role.id} onChange={(e) => setRoleId(e.target.value)}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.title} · {r.city}</option>
            ))}
          </select>
        </div>
      )}

      <p className="text-sm text-muted">
        Ref. {refCode(role)} · {role.country} · {formatSalary(role)} ·{" "}
        <Link href={`/opportunities/${role.id}`} className="font-semibold text-field underline">View role</Link>
      </p>

      <section aria-labelledby="applicants-h" className="space-y-4">
        <h2 id="applicants-h" className="text-2xl font-extrabold tracking-tight">
          Applicants{applicants && <span className="text-muted"> ({roleApplicants.length})</span>}
        </h2>
        {loadError ? (
          <p role="alert" className="bg-blocked-tint px-4 py-3 text-sm">Could not load applicants. Refresh the page to try again.</p>
        ) : applicants ? (
          <ApplicantList role={role} applicants={roleApplicants} />
        ) : (
          <p role="status" className="text-sm text-muted">Loading applicants…</p>
        )}
      </section>

      <section aria-labelledby="pool-h" className="space-y-4 pt-6">
        <div className="grid gap-4 sm:grid-cols-12 sm:items-end">
          <div className="sm:col-span-7">
            <h2 id="pool-h" className="text-2xl font-extrabold tracking-tight">Suggested from the talent pool</h2>
            <p className="text-sm text-muted">Fictional sample candidates who have not applied, ranked for this role.</p>
          </div>
          <div className="sm:col-span-5">
            <label htmlFor="sort" className={fieldLabel}>Sort by</label>
            <select id="sort" className={field} value={sort} onChange={(e) => setSort(e.target.value as CandidateSort)}>
              <option value="fit">Fit score</option>
              <option value="eligibility">Right to work first</option>
            </select>
          </div>
        </div>

      <ol className="border-b-2 border-ink">
        {rows.map(({ candidate, result }, i) => {
          const { matched, missing } = result.skillCoverage;
          return (
            <li key={candidate.id} className="border-t-2 border-ink py-5" data-testid="candidate-row">
              <div className="grid gap-4 md:grid-cols-12 md:gap-6">
                <div className="flex gap-4 md:col-span-6">
                  <span className="w-8 shrink-0 text-3xl font-extrabold leading-none tracking-tighter text-field">
                    <span className="sr-only">Rank </span>{i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold tracking-tight">{candidate.name}</h3>
                    <p className="text-sm text-muted">{candidate.headline}</p>
                    <p className="mt-1 text-xs font-semibold text-muted">Based in {candidate.basedIn}</p>
                    <p className="mt-3 text-sm"><strong>{matched.length} of {matched.length + missing.length}</strong> required skills</p>
                  </div>
                </div>
                <div className="md:col-span-6">
                  <div className="flex items-end justify-between gap-3">
                    <ScoreFigure score={result.score} />
                    <div className="flex flex-col items-end gap-1">
                      <BandBadge band={result.band} />
                      <EligibilityTag eligibility={result.eligibility} required={role.localWorkAuthRequired} />
                    </div>
                  </div>
                  <div className="mt-3"><ScoreStrip result={result} /></div>
                </div>
              </div>
              <details className="group mt-4 md:ml-12">
                <summary className="inline-flex min-h-10 cursor-pointer items-center gap-1 text-sm font-bold text-field">
                  Why this score <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <div className="mt-3 grid gap-6 sm:grid-cols-2">
                  <ul className="space-y-1.5 text-sm">
                    {result.strengths.slice(0, 3).map((s) => (
                      <li key={s} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-met" aria-hidden />{s}</li>
                    ))}
                  </ul>
                  <ul className="space-y-1.5 text-sm">
                    {result.gaps.slice(0, 3).map((g) => (
                      <li key={g} className="flex gap-2"><Minus className="mt-0.5 size-4 shrink-0 text-blocked" aria-hidden />{g}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4"><ScoreBreakdown result={result} /></div>
              </details>
            </li>
          );
        })}
      </ol>
      </section>

      <p className="text-xs text-muted">
        Talent-pool candidates are fictional. Scores are guidance, not a hiring decision. Right to work is self-stated and must be verified.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/how-it-works" className={btnSecondary}>How scoring works</Link>
        <Link href="/opportunities" className={btnPrimary}>All roles</Link>
      </div>
    </div>
    </>
  );
}
