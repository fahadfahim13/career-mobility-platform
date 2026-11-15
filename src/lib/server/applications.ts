import { getOpportunity } from "../data";
import { matchOne } from "../matching/engine";
import type { MatchResult } from "../matching/types";
import type { Profile } from "../types";
import type { Session } from "./session";
import { getStore } from "./store";

export interface StoredApplication {
  candidateId: string;
  name: string;
  email: string;
  opportunityId: string;
  profile: Profile;
  resume: { key: string; name: string } | null;
  appliedAt: string;
}

export interface Applicant extends Omit<StoredApplication, "resume"> {
  resumeName: string | null;
  result: MatchResult;
}

const appKey = (opportunityId: string, candidateId: string) => `applications/${opportunityId}/${candidateId}.json`;

/** A resume key the candidate may attach: one they uploaded while signed in, or before they had an account. */
export function resumeKeyAllowed(key: string, candidateId: string): boolean {
  const m = /^resumes\/([A-Za-z0-9-]+)\/[0-9a-f-]{36}\.pdf$/.exec(key);
  return !!m && (m[1] === "anon" || m[1] === candidateId);
}

export const resumeKeyFor = (owner: string) => `resumes/${owner}/${crypto.randomUUID()}.pdf`;

/** One application per candidate per role; applying again replaces it with the latest profile. */
export async function submitApplication(
  s: Session,
  opportunityId: string,
  profile: Profile,
  resume: { key: string; name: string } | null,
): Promise<StoredApplication> {
  const application: StoredApplication = {
    candidateId: s.id,
    name: s.name,
    email: s.email,
    opportunityId,
    profile,
    resume,
    appliedAt: new Date().toISOString(),
  };
  await getStore().putJson(appKey(opportunityId, s.id), application);
  return application;
}

export async function getApplication(opportunityId: string, candidateId: string): Promise<StoredApplication | null> {
  return getStore().getJson<StoredApplication>(appKey(opportunityId, candidateId));
}

export async function listMine(candidateId: string): Promise<{ opportunityId: string; appliedAt: string }[]> {
  const store = getStore();
  const keys = (await store.listKeys("applications/")).filter((k) => k.endsWith(`/${candidateId}.json`));
  const apps = await Promise.all(keys.map((k) => store.getJson<StoredApplication>(k)));
  return apps.flatMap((a) => (a ? [{ opportunityId: a.opportunityId, appliedAt: a.appliedAt }] : []));
}

/** Applicants for one role, scored by the same engine the candidate sees, best fit first. */
export async function listApplicants(opportunityId: string): Promise<Applicant[]> {
  const opp = getOpportunity(opportunityId);
  if (!opp) return [];
  const store = getStore();
  const keys = await store.listKeys(`applications/${opportunityId}/`);
  const apps = (await Promise.all(keys.map((k) => store.getJson<StoredApplication>(k)))).filter((a): a is StoredApplication => !!a);
  return apps
    .map(({ resume, ...a }) => ({ ...a, resumeName: resume?.name ?? null, result: matchOne(a.profile, opp) }))
    .sort((a, b) => b.result.score - a.result.score || a.name.localeCompare(b.name));
}
