"use client";

import { ArrowRight, Briefcase, Building2, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { sampleProfile } from "../data/sampleProfile";
import { notifyStorageChange } from "../hooks/useLocalState";
import { createAccount, ORGANISATIONS, signIn, signInDemo, signUpSchema, type Account, type Role } from "../lib/accounts";
import { EMPTY_PROFILE, mergeResume, type ResumeFields } from "../lib/resume/fields";
import { loadProfile, saveProfile } from "../lib/storage";
import { ResumeUpload } from "./ResumeUpload";
import { btnPrimary, field, fieldError, fieldLabel } from "./ui";

const ROLE_OPTIONS: { role: Role; title: string; body: string; Icon: typeof Briefcase }[] = [
  { role: "seeker", title: "I’m looking for work", body: "Find roles abroad that fit you", Icon: Briefcase },
  { role: "employer", title: "I’m hiring", body: "Find qualified international talent", Icon: Building2 },
];

const QUICK_SIGNIN: { role: Role; title: string; body: string; Icon: typeof Briefcase }[] = [
  { role: "seeker", title: "Sign in as candidate", body: "Sample profile, ranked matches", Icon: Briefcase },
  { role: "employer", title: "Sign in as hirer", body: "Employer view, ranked candidates", Icon: Building2 },
];

function destination(account: Account): string {
  if (account.role === "employer") return "/employer";
  return loadProfile() ? "/matches" : "/profile";
}

type Errors = Partial<Record<"name" | "email" | "password" | "organisation" | "form", string>>;

export function AuthForm({ mode, initialRole }: { mode: "signin" | "signup"; initialRole: Role }) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(initialRole);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [resume, setResume] = useState<ResumeFields | null>(null);

  const finish = (account: Account) => {
    notifyStorageChange();
    router.push(destination(account));
  };

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true);
    setErrors({});
    try {
      if (mode === "signin") {
        const r = await signIn(data.email ?? "", data.password ?? "");
        if (!r.ok) return setErrors({ form: r.error === "network" ? "Could not reach the server. Try again." : "Email or password is incorrect." });
        return finish(r.account);
      }
      const input = { name: data.name, email: data.email, password: data.password, role, organisation: data.organisation };
      const parsed = signUpSchema.safeParse(input);
      if (!parsed.success) {
        const next: Errors = {};
        for (const issue of parsed.error.issues) next[issue.path[0] as keyof Errors] ??= issue.message;
        return setErrors(next);
      }
      const r = await createAccount(input);
      if (!r.ok) {
        return setErrors(
          r.error === "email-taken"
            ? { email: "An account with this email already exists. Sign in instead." }
            : { form: r.error === "network" ? "Could not reach the server. Try again." : "Check the details and try again." },
        );
      }
      if (role === "seeker" && resume) {
        // Pre-fill the profile, then open it so the candidate can check the fields and add countries.
        saveProfile(mergeResume(loadProfile() ?? EMPTY_PROFILE, resume).profile);
        notifyStorageChange();
        return router.push("/profile");
      }
      finish(r.account);
    } finally {
      setBusy(false);
    }
  }

  async function demo(r: Role) {
    setBusy(true);
    try {
      const account = await signInDemo(r);
      if (r === "seeker" && !loadProfile()) saveProfile(sampleProfile);
      finish(account);
    } catch {
      setErrors({ form: "Could not open the demo account. Try again." });
    } finally {
      setBusy(false);
    }
  }

  const err = (k: keyof Errors) =>
    errors[k] ? <p id={`${k}-err`} className={fieldError}>{errors[k]}</p> : null;
  const aria = (k: keyof Errors) => ({ "aria-invalid": errors[k] ? true : undefined, "aria-describedby": errors[k] ? `${k}-err` : undefined });

  return (
    <div className="w-full max-w-md">
      <h1 className="text-3xl font-extrabold tracking-tight">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
      <p className="mt-2 text-sm text-muted">
        {mode === "signin" ? "New to Pathway? " : "Already have an account? "}
        <Link href={mode === "signin" ? `/signup?role=${role}` : "/signin"} className="font-semibold text-field underline">
          {mode === "signin" ? "Create an account" : "Sign in"}
        </Link>
      </p>

      <div className="mt-8">
        <p className="text-sm font-semibold">One-click demo</p>
        <div className="mt-3 grid grid-cols-1 gap-3">
          {QUICK_SIGNIN.map((q) => (
            <button
              key={q.role}
              type="button"
              disabled={busy}
              onClick={() => demo(q.role)}
              className="group flex items-center gap-3 border border-slate-300 bg-white p-4 text-left transition-colors duration-150 hover:border-field hover:bg-field-tint focus-visible:outline-2 focus-visible:outline-field disabled:opacity-60"
            >
              <q.Icon className="size-5 shrink-0 text-field" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{q.title}</span>
                <span className="block text-xs text-muted">{q.body}</span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-field transition-transform group-hover:translate-x-0.5" aria-hidden />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        or use email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5">
        {mode === "signup" && (
          <fieldset>
            <legend className={fieldLabel}>I am</legend>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ROLE_OPTIONS.map((o) => {
                const active = role === o.role;
                return (
                  <label
                    key={o.role}
                    className={`relative flex cursor-pointer flex-col gap-1 border p-4 transition-colors duration-150 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-field ${
                      active ? "border-field bg-field-tint" : "border-slate-300 bg-white hover:border-ink"
                    }`}
                  >
                    <input type="radio" name="role" value={o.role} checked={active} onChange={() => setRole(o.role)} className="sr-only" />
                    <o.Icon className="size-5 text-field" aria-hidden />
                    <span className="text-sm font-bold">{o.title}</span>
                    <span className="text-xs text-muted">{o.body}</span>
                    {active && <Check className="absolute right-3 top-3 size-4 text-field" aria-hidden />}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {mode === "signup" && (
          <div>
            <label htmlFor="name" className={fieldLabel}>Full name</label>
            <input id="name" name="name" autoComplete="name" className={field} {...aria("name")} />
            {err("name")}
          </div>
        )}
        {mode === "signup" && role === "employer" && (
          <div>
            <label htmlFor="organisation" className={fieldLabel}>Organisation</label>
            <select id="organisation" name="organisation" defaultValue="" className={field} {...aria("organisation")}>
              <option value="" disabled>Select your organisation</option>
              {ORGANISATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <p className="mt-0.5 text-xs text-muted">You see applicants for your organisation’s roles only.</p>
            {err("organisation")}
          </div>
        )}
        <div>
          <label htmlFor="email" className={fieldLabel}>{role === "employer" && mode === "signup" ? "Work email" : "Email"}</label>
          <input id="email" name="email" type="email" autoComplete="email" className={field} {...aria("email")} />
          {err("email")}
        </div>
        <div>
          <label htmlFor="password" className={fieldLabel}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className={field}
            {...aria("password")}
          />
          {mode === "signup" && !errors.password && <p className="mt-0.5 text-xs text-muted">At least 8 characters.</p>}
          {err("password")}
        </div>

        {mode === "signup" && role === "seeker" && (
          <ResumeUpload
            title="Add your resume (optional)"
            onFields={(f) => {
              setResume(f);
              return mergeResume(EMPTY_PROFILE, f).filled;
            }}
          />
        )}

        {errors.form && <p role="alert" className="bg-blocked-tint px-3 py-2 text-sm text-ink">{errors.form}</p>}

        <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
          {mode === "signin" ? "Sign in" : role === "employer" ? "Create employer account" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-xs text-muted">Accounts are stored on our server with a hashed password. Your profile stays in this browser until you apply.</p>
    </div>
  );
}
