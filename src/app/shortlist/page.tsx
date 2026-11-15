"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BandBadge, EligibilityTag } from "../../components/badges";
import { OpportunityRow } from "../../components/OpportunityRow";
import { PageHero } from "../../components/PageHero";
import { field, fieldLabel, textLink, wrap } from "../../components/ui";
import { useProfile, useShortlist } from "../../hooks/useLocalState";
import { getOpportunity } from "../../lib/data";
import { matchOne } from "../../lib/matching/engine";
import { STAGES, type Stage, type TrackedItem } from "../../lib/storage";

/** Note field that saves on blur, so typing never re-renders every row. */
function NoteField({ item, onSave }: { item: TrackedItem; onSave: (note: string) => void }) {
  const [value, setValue] = useState(item.note);
  useEffect(() => setValue(item.note), [item.note]);
  return (
    <div className="sm:col-span-2">
      <label htmlFor={`note-${item.id}`} className={fieldLabel}>Notes</label>
      <textarea
        id={`note-${item.id}`}
        rows={2}
        maxLength={500}
        className={`${field} py-2`}
        placeholder="For example, contact name or the next deadline"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => value !== item.note && onSave(value)}
      />
    </div>
  );
}

/** Application pipeline drawn as numbered stages with live counts. */
function StagePipeline({ count }: { count: (s: Stage) => number }) {
  return (
    <ol aria-label="Roles per stage" className="grid grid-cols-3 gap-px border border-on-field-muted/40 bg-on-field-muted/40">
      {STAGES.map((s, i) => (
        <li key={s} className={`px-3 py-3 ${count(s) > 0 ? "bg-field-deep" : "bg-field"}`}>
          <p className="text-xs font-semibold text-on-field-muted">{i + 1}. {s}</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums">{count(s)}</p>
        </li>
      ))}
    </ol>
  );
}

export default function ShortlistPage() {
  const { items, ready, setStage, setNote } = useShortlist();
  const [profile] = useProfile();

  const heroBand = (aside?: React.ReactNode) => (
    <PageHero
      eyebrow="Step 3 of 3"
      title="Your shortlist"
      intro="Track each saved role from first look to offer. Stages and notes stay in this browser."
      aside={aside}
    />
  );

  if (!ready) {
    return (
      <>
        {heroBand()}
        <p className={`${wrap} py-12 text-sm text-muted`} role="status">Loading your shortlist…</p>
      </>
    );
  }

  // Ids for roles that no longer exist are skipped rather than crashing the page.
  const rows = items.flatMap((item) => {
    const opp = getOpportunity(item.id);
    return opp ? [{ item, opp }] : [];
  });
  const countFor = (s: Stage) => rows.filter((r) => r.item.stage === s).length;

  return (
    <>
    {heroBand(<StagePipeline count={countFor} />)}
    <div className={`${wrap} space-y-8 py-12 sm:py-16`}>

      {rows.length === 0 ? (
        <div className="mx-auto max-w-xl border-t-4 border-field bg-white p-8 text-center">
          <p className="text-lg font-bold">Your shortlist is empty</p>
          <p className="mt-1 text-sm text-muted">
            Select <span className="font-semibold">Shortlist</span> on any role to save it here and track your application.
          </p>
          <Link href="/matches" className={`${textLink} mt-4 inline-block text-sm`}>Review your matches</Link>
        </div>
      ) : (
        <ul className="border-b-2 border-ink">
          {rows.map(({ item, opp }) => {
            const r = profile ? matchOne(profile, opp) : null;
            return (
              <OpportunityRow
                key={opp.id}
                opp={opp}
                aside={
                  r && (
                    <span className="flex flex-wrap items-center gap-2 text-sm sm:justify-end">
                      <span className="text-2xl font-extrabold tabular-nums">{r.score}<span className="text-sm text-muted">/100</span></span>
                      <BandBadge band={r.band} />
                      <EligibilityTag eligibility={r.eligibility} required={opp.localWorkAuthRequired} />
                    </span>
                  )
                }
              >
                <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor={`stage-${opp.id}`} className={fieldLabel}>Application stage</label>
                    <select
                      id={`stage-${opp.id}`}
                      className={field}
                      value={item.stage}
                      onChange={(e) => setStage(opp.id, e.target.value as Stage)}
                    >
                      {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <NoteField item={item} onSave={(note) => setNote(opp.id, note)} />
                </div>
              </OpportunityRow>
            );
          })}
        </ul>
      )}
    </div>
    </>
  );
}
