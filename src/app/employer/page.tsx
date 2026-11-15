"use client";

import { Check, ChevronDown, Minus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BandBadge, EligibilityTag, ScoreFigure } from "../../components/badges";
import { ScoreBreakdown } from "../../components/ScoreBreakdown";
import { ScoreStrip } from "../../components/ScoreStrip";
import { btnPrimary, btnSecondary, field, fieldLabel, pageTitle } from "../../components/ui";
import { candidates } from "../../data/candidates";
import { useAccount } from "../../hooks/useLocalState";
import { getOpportunities } from "../../lib/data";
import { formatSalary, refCode } from "../../lib/format";
import { rankCandidates, type CandidateSort } from "../../lib/rankCandidates";

export default function EmployerPage() {
  const { account, ready } = useAccount();
  const roles = getOpportunities();
  const [roleId, setRoleId] = useState(roles[1]?.id ?? roles[0].id);
  const [sort, setSort] = useState<CandidateSort>("fit");
  const role = roles.find((r) => r.id === roleId) ?? roles[0];
  const rows = useMemo(() => rankCandidates(role, candidates, sort), [role, sort]);

  if (!ready) return <p className="text-sm text-muted" role="status">Loading…</p>;
  if (!account || account.role !== "employer") {
    return (
      <section className="on-field mx-auto max-w-2xl bg-field p-8 text-on-field">
        <h1 className="text-3xl font-extrabold tracking-tight">Find qualified international candidates</h1>
        <p className="mt-3 text-on-field-muted">Sign in with an employer account to see candidates ranked against your roles.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/signup?role=employer" className="inline-flex min-h-11 items-center bg-paper px-4 text-sm font-semibold text-ink hover:bg-field-tint">
            Create employer account
          </Link>
          <Link href="/signin" className="inline-flex min-h-11 items-center border border-on-field-muted px-4 text-sm font-semibold hover:bg-field-deep">
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  const strong = rows.filter((r) => r.result.band === "Strong").length;
  const stated = rows.filter((r) => r.result.eligibility === "clear").length;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-muted">{account.organisation}</p>
        <h1 className={pageTitle}>Candidates</h1>
        <p className="mt-3 max-w-2xl text-muted">Ranked by fit for the selected role. Right to work is shown separately.</p>
      </header>

      <div className="grid gap-4 border-y-2 border-ink py-4 sm:grid-cols-12 sm:items-end">
        <div className="sm:col-span-7">
          <label htmlFor="role" className={fieldLabel}>Open role</label>
          <select id="role" className={field} value={roleId} onChange={(e) => setRoleId(e.target.value)}>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.title} · {r.city}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-5">
          <label htmlFor="sort" className={fieldLabel}>Sort by</label>
          <select id="sort" className={field} value={sort} onChange={(e) => setSort(e.target.value as CandidateSort)}>
            <option value="fit">Fit score</option>
            <option value="eligibility">Right to work first</option>
          </select>
        </div>
      </div>

      <dl className="grid grid-cols-3 border-b border-line pb-4 text-center sm:text-left">
        <div><dt className="text-xs font-semibold text-muted">Candidates</dt><dd className="text-3xl font-extrabold tabular-nums">{rows.length}</dd></div>
        <div><dt className="text-xs font-semibold text-muted">Strong matches</dt><dd className="text-3xl font-extrabold tabular-nums">{strong}</dd></div>
        <div><dt className="text-xs font-semibold text-muted">Right to work stated</dt><dd className="text-3xl font-extrabold tabular-nums">{stated}</dd></div>
      </dl>

      <p className="text-sm text-muted">
        Ref. {refCode(role)} · {role.country} · {formatSalary(role)} ·{" "}
        <Link href={`/opportunities/${role.id}`} className="font-semibold text-field underline">View role</Link>
      </p>

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
                    <h2 className="text-xl font-bold tracking-tight">{candidate.name}</h2>
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

      <p className="text-xs text-muted">
        All candidates are fictional. Scores are guidance, not a hiring decision. Right to work is self-stated and must be verified.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/how-it-works" className={btnSecondary}>How scoring works</Link>
        <Link href="/opportunities" className={btnPrimary}>All roles</Link>
      </div>
    </div>
  );
}
