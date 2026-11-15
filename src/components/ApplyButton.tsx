"use client";

import { CheckCircle2, LoaderCircle, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useProfile, useResumeRef, useShortlist } from "../hooks/useLocalState";
import { profileFormSchema } from "../lib/schemas";
import { btnOnField, btnOnFieldOutline } from "./ui";

type State = { kind: "idle" | "sending" | "applied" | "error"; message?: string; at?: string };

/**
 * Sends the candidate's current profile (and last uploaded resume, if any) to the employer.
 * Guests are asked to sign in, and candidates with an incomplete profile to finish it first.
 */
export function ApplyButton({ id, title }: { id: string; title: string }) {
  const { account, ready } = useAccount();
  const [profile, , profileReady] = useProfile();
  const resume = useResumeRef();
  const { has, toggle, setStage } = useShortlist();
  const [state, setState] = useState<State>({ kind: "idle" });

  const seeker = account?.role === "seeker";
  useEffect(() => {
    if (!seeker) return;
    let live = true;
    fetch("/api/applications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { applications: [] }))
      .then((d: { applications: { opportunityId: string; appliedAt: string }[] }) => {
        const mine = d.applications.find((a) => a.opportunityId === id);
        if (live && mine) setState({ kind: "applied", at: mine.appliedAt });
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [seeker, id]);

  if (!ready || !profileReady) return <span className={`${btnOnField} pointer-events-none opacity-60`}>Apply</span>;
  if (!account) return <Link href="/signin" className={btnOnField}>Sign in to apply</Link>;
  if (!seeker) return null;

  const complete = profile ? profileFormSchema.safeParse(profile) : null;
  if (!complete?.success) return <Link href="/profile" className={btnOnField}>Complete your profile to apply</Link>;

  async function apply() {
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ opportunityId: id, profile: complete!.data, resume }),
      });
      const data = (await res.json().catch(() => ({}))) as { appliedAt?: string; error?: string };
      if (!res.ok) return setState({ kind: "error", message: data.error ?? "The application failed. Try again." });
      if (!has(id)) toggle(id);
      setStage(id, "Applied");
      setState({ kind: "applied", at: data.appliedAt });
    } catch {
      setState({ kind: "error", message: "Could not reach the server. Try again." });
    }
  }

  if (state.kind === "applied") {
    const date = state.at ? new Date(state.at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className={`${btnOnField} pointer-events-none`} aria-live="polite">
          <CheckCircle2 className="size-4 text-met" aria-hidden />
          Applied{date && ` on ${date}`}
        </span>
        <button type="button" onClick={apply} className={btnOnFieldOutline}>Send updated profile</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <button type="button" onClick={apply} disabled={state.kind === "sending"} className={btnOnField} aria-label={`Apply for ${title}`}>
        {state.kind === "sending" ? <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : <Send className="size-4" aria-hidden />}
        {state.kind === "sending" ? "Sending…" : "Apply now"}
      </button>
      <p className="text-xs text-on-field-muted">
        {resume ? `Sends your profile and ${resume.name}.` : "Sends your profile. Upload a resume on your profile to attach it."}
      </p>
      {state.kind === "error" && <p role="alert" className="bg-blocked-tint px-3 py-2 text-sm text-ink">{state.message}</p>}
    </div>
  );
}
