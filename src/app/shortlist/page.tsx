"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BandBadge, EligibilityTag } from "../../components/badges";
import { OpportunityRow } from "../../components/OpportunityRow";
import { field, fieldLabel, pageTitle, textLink } from "../../components/ui";
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

export default function ShortlistPage() {
  const { items, ready, setStage, setNote } = useShortlist();
  const [profile] = useProfile();

  if (!ready) return <p className="text-sm text-muted" role="status">Loading your shortlist…</p>;

  // Ids for roles that no longer exist are skipped rather than crashing the page.
  const rows = items.flatMap((item) => {
    const opp = getOpportunity(item.id);
    return opp ? [{ item, opp }] : [];
  });
  const countFor = (s: Stage) => rows.filter((r) => r.item.stage === s).length;

  return (
    <div className="space-y-8">
      <header className="border-b-2 border-ink pb-8">
        <h1 className={pageTitle}>Your shortlist</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Track each saved role from first look to offer. Stages and notes are stored only in this browser.
        </p>
      </header>

      {rows.length > 0 && (
        <ol className="grid grid-cols-3 gap-px bg-line sm:grid-cols-6" aria-label="Roles by stage">
          {STAGES.map((s) => (
            <li key={s} className="bg-paper p-3">
              <span className="block text-xs font-bold uppercase tracking-wide text-muted">{s}</span>
              <span className="text-2xl font-extrabold tabular-nums">{countFor(s)}</span>
            </li>
          ))}
        </ol>
      )}

      {rows.length === 0 ? (
        <div className="mx-auto max-w-xl border-t-4 border-field bg-white p-8 text-center">
          <p className="text-lg font-bold">Your shortlist is empty</p>
          <p className="mt-1 text-sm text-muted">
            Select <span className="font-semibold">Shortlist</span> on any role to save it here and track your application.
          </p>
          <Link href="/matches" className={`${textLink} mt-4 inline-block text-sm`}>Review your matches</Link>
        </div>
      ) : (
        <ul className="space-y-6">
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
  );
}
