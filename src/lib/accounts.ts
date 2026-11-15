import { z } from "zod";

/**
 * Browser-only demo accounts. This prototype has no server or database, so accounts live in
 * localStorage on this device. Passwords are stored only as a salted SHA-256 hash. This keeps the
 * sign-in flow realistic for the demo; a production build would use a real identity provider.
 */
export const ACCOUNTS_KEY = "cm.accounts.v1";
export const SESSION_KEY = "cm.session.v1";

export const ROLES = ["seeker", "employer"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = { seeker: "Job seeker", employer: "Employer" };

const storedSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(ROLES),
  organisation: z.string().nullable(),
  salt: z.string(),
  passwordHash: z.string(),
  createdAt: z.string(),
});
type StoredAccount = z.infer<typeof storedSchema>;

/** What the UI may see: never the hash or salt. */
export type Account = Omit<StoredAccount, "salt" | "passwordHash">;

export const signUpSchema = z
  .object({
    name: z.string().trim().min(1, "Enter your name").max(80),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters").max(128),
    role: z.enum(ROLES),
    organisation: z.string().trim().max(100).optional(),
  })
  .refine((v) => v.role !== "employer" || (v.organisation ?? "").length > 0, {
    path: ["organisation"],
    message: "Enter your organisation",
  });
export type SignUpInput = z.input<typeof signUpSchema>;

export const DEMO_ACCOUNTS: Record<Role, { name: string; email: string; organisation: string | null }> = {
  seeker: { name: "Demo candidate", email: "candidate@demo.pathway", organisation: null },
  employer: { name: "Demo employer", email: "employer@demo.pathway", organisation: "Northwind Logistics (fictional)" },
};
const DEMO_PASSWORD = "demo-account";

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

function loadStored(): StoredAccount[] {
  const raw = storage()?.getItem(ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((x) => {
      const r = storedSchema.safeParse(x);
      return r.success ? [r.data] : [];
    });
  } catch {
    return [];
  }
}

function saveStored(list: StoredAccount[]) {
  storage()?.setItem(ACCOUNTS_KEY, JSON.stringify(list));
}

function toPublic({ salt: _s, passwordHash: _h, ...rest }: StoredAccount): Account {
  return rest;
}

const normaliseEmail = (e: string) => e.trim().toLowerCase();

function randomHex(bytes: number): string {
  const a = new Uint8Array(bytes);
  globalThis.crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export type AuthResult = { ok: true; account: Account } | { ok: false; error: "email-taken" | "invalid-credentials" | "invalid" };

export async function createAccount(input: SignUpInput): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const v = parsed.data;
  const list = loadStored();
  const email = normaliseEmail(v.email);
  if (list.some((a) => a.email === email)) return { ok: false, error: "email-taken" };
  const salt = randomHex(16);
  const account: StoredAccount = {
    id: randomHex(8),
    name: v.name,
    email,
    role: v.role,
    organisation: v.role === "employer" ? (v.organisation ?? null) : null,
    salt,
    passwordHash: await hashPassword(v.password, salt),
    createdAt: new Date().toISOString(),
  };
  saveStored([...list, account]);
  storage()?.setItem(SESSION_KEY, account.id);
  return { ok: true, account: toPublic(account) };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const found = loadStored().find((a) => a.email === normaliseEmail(email));
  if (!found || (await hashPassword(password, found.salt)) !== found.passwordHash) {
    return { ok: false, error: "invalid-credentials" };
  }
  storage()?.setItem(SESSION_KEY, found.id);
  return { ok: true, account: toPublic(found) };
}

export function signOut() {
  storage()?.removeItem(SESSION_KEY);
}

export function currentAccount(): Account | null {
  const id = storage()?.getItem(SESSION_KEY);
  if (!id) return null;
  const found = loadStored().find((a) => a.id === id);
  return found ? toPublic(found) : null;
}

/** One-click demo access for assessors: creates the demo account on first use, then signs in. */
export async function signInDemo(role: Role): Promise<Account> {
  const demo = DEMO_ACCOUNTS[role];
  const existing = await signIn(demo.email, DEMO_PASSWORD);
  if (existing.ok) return existing.account;
  const created = await createAccount({
    name: demo.name,
    email: demo.email,
    password: DEMO_PASSWORD,
    role,
    organisation: demo.organisation ?? undefined,
  });
  if (!created.ok) throw new Error("Could not create the demo account");
  return created.account;
}
