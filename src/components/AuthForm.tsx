"use client";

import { Briefcase, Building2, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { sampleProfile } from "../data/sampleProfile";
import { notifyStorageChange } from "../hooks/useLocalState";
import { createAccount, signIn, signInDemo, signUpSchema, type Account, type Role } from "../lib/accounts";
import { loadProfile, saveProfile } from "../lib/storage";
import { btnPrimary, btnSecondary, field, fieldError, fieldLabel } from "./ui";

const ROLE_OPTIONS: { role: Role; title: string; body: string; Icon: typeof Briefcase }[] = [
  { role: "seeker", title: "I’m looking for work", body: "Find roles abroad that fit you", Icon: Briefcase },
  { role: "employer", title: "I’m hiring", body: "Find qualified international talent", Icon: Building2 },
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
        if (!r.ok) return setErrors({ form: "Email or password is incorrect." });
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
        return setErrors(r.error === "email-taken" ? { email: "An account with this email already exists. Sign in instead." } : { form: "Check the details and try again." });
      }
      finish(r.account);
    } finally {
      setBusy(false);
    }
  }

  async function demo(r: Role) {
    setBusy(true);
    const account = await signInDemo(r);
    if (r === "seeker" && !loadProfile()) saveProfile(sampleProfile);
    setBusy(false);
    finish(account);
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

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
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
            <input id="organisation" name="organisation" autoComplete="organization" className={field} {...aria("organisation")} />
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

        {errors.form && <p role="alert" className="bg-blocked-tint px-3 py-2 text-sm text-ink">{errors.form}</p>}

        <button type="submit" disabled={busy} className={`${btnPrimary} w-full`}>
          {mode === "signin" ? "Sign in" : role === "employer" ? "Create employer account" : "Create account"}
        </button>
      </form>

      <div className="mt-8 border-t border-line pt-6">
        <p className="text-sm font-semibold">Exploring the prototype?</p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button type="button" disabled={busy} onClick={() => demo("seeker")} className={btnSecondary}>Demo candidate</button>
          <button type="button" disabled={busy} onClick={() => demo("employer")} className={btnSecondary}>Demo employer</button>
        </div>
        <p className="mt-4 text-xs text-muted">Prototype: accounts are stored only in this browser. Nothing is sent to a server.</p>
      </div>
    </div>
  );
}
