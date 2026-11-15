import { z } from "zod";
import { getOpportunities } from "./data";

/**
 * Accounts live on the server (see src/lib/server/accounts.ts). The browser only holds an HttpOnly
 * session cookie it cannot read. This module has the shared rules plus small fetch helpers.
 */
export const ROLES = ["seeker", "employer"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = { seeker: "Job seeker", employer: "Employer" };

/** Employers belong to one of the organisations that post roles, and see only that organisation's applicants. */
export const ORGANISATIONS: string[] = [...new Set(getOpportunities().map((o) => o.organisation))].sort((a, b) => a.localeCompare(b));

export interface Account {
  id: string;
  name: string;
  email: string;
  role: Role;
  organisation: string | null;
}

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(200),
    password: z.string().min(8, "Use at least 8 characters").max(128),
    role: z.enum(ROLES),
    organisation: z.string().trim().max(100).optional(),
  })
  .refine((v) => v.role !== "employer" || ORGANISATIONS.includes(v.organisation ?? ""), {
    path: ["organisation"],
    message: "Select your organisation",
  });
export type SignUpInput = z.input<typeof signUpSchema>;

export const DEMO_ACCOUNTS: Record<Role, { name: string; email: string; organisation: string | null }> = {
  seeker: { name: "Demo candidate", email: "candidate@demo.pathway", organisation: null },
  employer: { name: "Demo hirer", email: "employer@demo.pathway", organisation: "Harbourline Logistics" },
};

export type AuthResult = { ok: true; account: Account } | { ok: false; error: "email-taken" | "invalid-credentials" | "invalid" | "network" };

async function post(path: string, body?: unknown): Promise<AuthResult> {
  try {
    const res = await fetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    const data = (await res.json().catch(() => ({}))) as { account?: Account; error?: AuthResult extends { error: infer E } ? E : never };
    if (res.ok && data.account) return { ok: true, account: data.account };
    return { ok: false, error: data.error ?? "invalid" };
  } catch {
    return { ok: false, error: "network" };
  }
}

export const createAccount = (input: SignUpInput) => post("/api/auth/signup", input);
export const signIn = (email: string, password: string) => post("/api/auth/signin", { email, password });

/** One-click demo access: the server creates the demo account on first use, then signs in. */
export async function signInDemo(role: Role): Promise<Account> {
  const r = await post("/api/auth/demo", { role });
  if (!r.ok) throw new Error("Could not open the demo account");
  return r.account;
}

export async function signOut(): Promise<void> {
  await fetch("/api/auth/signout", { method: "POST" }).catch(() => undefined);
}

export async function fetchAccount(): Promise<Account | null> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = (await res.json()) as { account: Account | null };
    return data.account;
  } catch {
    return null;
  }
}
