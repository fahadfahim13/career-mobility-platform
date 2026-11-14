"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sampleProfile } from "../data/sampleProfile";
import { notifyStorageChange, useProfile } from "../hooks/useLocalState";
import { EDUCATION_LEVELS, LANGUAGE_LEVELS, profileFormSchema } from "../lib/schemas";
import { clearAll } from "../lib/storage";
import type { Profile, WorkAuth } from "../lib/types";
import { TagInput } from "./TagInput";

const EMPTY: Profile = {
  educationLevel: null,
  educationField: "",
  yearsExperience: null,
  experienceSummary: "",
  skills: [],
  languages: [],
  preferredCountries: [],
  interests: [],
  enrolledStudent: null,
  workAuthorisation: {},
};

const COUNTRY_SUGGESTIONS = ["Germany", "Canada", "Singapore", "United Kingdom", "Netherlands", "United Arab Emirates"];
const LEVEL_LABEL: Record<string, string> = {
  none: "No formal education",
  secondary: "Secondary school",
  diploma: "Diploma",
  bachelor: "Bachelor's degree",
  master: "Master's degree",
  phd: "PhD",
};

type Errors = Partial<Record<keyof Profile | "form", string>>;

const inputCls = "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm";

export function ProfileForm() {
  const router = useRouter();
  const [stored, save, ready] = useProfile();
  const [p, setP] = useState<Profile>(EMPTY);
  const [years, setYears] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  // Load the saved profile once storage has been read.
  useEffect(() => {
    if (ready && stored) {
      setP(stored);
      setYears(stored.yearsExperience === null ? "" : String(stored.yearsExperience));
    }
  }, [ready, stored]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setP((prev) => ({ ...prev, [key]: value }));

  function loadSample() {
    setP(sampleProfile);
    setYears(String(sampleProfile.yearsExperience));
    setErrors({});
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const candidate = {
      ...p,
      yearsExperience: years.trim() === "" ? null : Number(years),
      // Only keep authorisation answers for countries still in the list.
      workAuthorisation: Object.fromEntries(
        p.preferredCountries.map((c) => [c, p.workAuthorisation[c] ?? "unknown"]),
      ) as Record<string, WorkAuth>,
    };
    const parsed = profileFormSchema.safeParse(candidate);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = (issue.path[0] as keyof Profile) ?? "form";
        if (!next[key]) next[key] = key === "yearsExperience" && candidate.yearsExperience === null ? "Enter your years of experience" : key === "educationLevel" ? "Select your highest education level" : issue.message;
      }
      setErrors(next);
      return;
    }
    save(parsed.data);
    router.push("/matches");
  }

  function onClear() {
    clearAll();
    notifyStorageChange();
    setP(EMPTY);
    setYears("");
    setErrors({});
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={loadSample} className="rounded-md border border-brand-600 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50">
          Load sample profile
        </button>
        <button type="button" onClick={onClear} className="rounded-md px-4 py-2 text-sm text-slate-600 hover:text-red-700">
          Clear my data
        </button>
      </div>

      {Object.keys(errors).length > 0 && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
          Please fix the highlighted fields.
        </p>
      )}

      <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold text-ink">Education and experience</legend>
        <div>
          <label htmlFor="educationLevel" className="block text-sm font-medium text-ink">Highest education level</label>
          <select
            id="educationLevel"
            className={inputCls}
            value={p.educationLevel ?? ""}
            aria-invalid={!!errors.educationLevel}
            onChange={(e) => set("educationLevel", e.target.value === "" ? null : (e.target.value as Profile["educationLevel"]))}
          >
            <option value="">Select…</option>
            {EDUCATION_LEVELS.map((l) => (
              <option key={l} value={l}>{LEVEL_LABEL[l]}</option>
            ))}
          </select>
          {errors.educationLevel && <p role="alert" className="mt-1 text-sm text-red-700">{errors.educationLevel}</p>}
        </div>
        <div>
          <label htmlFor="educationField" className="block text-sm font-medium text-ink">Field of study</label>
          <input id="educationField" className={inputCls} value={p.educationField} placeholder="e.g. Business Administration" onChange={(e) => set("educationField", e.target.value)} />
        </div>
        <div>
          <label htmlFor="years" className="block text-sm font-medium text-ink">Years of work experience</label>
          <input
            id="years"
            type="number"
            min={0}
            max={50}
            step={0.5}
            inputMode="decimal"
            className={inputCls}
            value={years}
            aria-invalid={!!errors.yearsExperience}
            onChange={(e) => setYears(e.target.value)}
          />
          {errors.yearsExperience && <p role="alert" className="mt-1 text-sm text-red-700">{errors.yearsExperience}</p>}
        </div>
        <div>
          <span className="block text-sm font-medium text-ink">Currently an enrolled student?</span>
          <div className="mt-2 flex gap-4 text-sm">
            {([["Yes", true], ["No", false], ["Prefer not to say", null]] as const).map(([label, value]) => (
              <label key={label} className="flex items-center gap-1">
                <input type="radio" name="enrolled" checked={p.enrolledStudent === value} onChange={() => set("enrolledStudent", value)} />
                {label}
              </label>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="summary" className="block text-sm font-medium text-ink">Experience summary (optional)</label>
          <textarea id="summary" rows={2} maxLength={500} className={inputCls} value={p.experienceSummary} onChange={(e) => set("experienceSummary", e.target.value)} />
        </div>
      </fieldset>

      <fieldset className="grid gap-5 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink">Skills and interests</legend>
        <TagInput label="Skills" hint="Press Enter or comma after each skill." values={p.skills} onChange={(v) => set("skills", v)} error={errors.skills} placeholder="e.g. Excel" />
        <TagInput label="Career interests" values={p.interests} onChange={(v) => set("interests", v)} placeholder="e.g. Project coordination" />
      </fieldset>

      <fieldset className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink">Languages</legend>
        {p.languages.map((l, i) => (
          <div key={i} className="flex flex-wrap items-end gap-2">
            <div className="grow">
              <label htmlFor={`lang-${i}`} className="block text-xs text-slate-600">Language</label>
              <input
                id={`lang-${i}`}
                className={inputCls}
                value={l.name}
                onChange={(e) => set("languages", p.languages.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              />
            </div>
            <div>
              <label htmlFor={`lang-level-${i}`} className="block text-xs text-slate-600">Level</label>
              <select
                id={`lang-level-${i}`}
                className={inputCls}
                value={l.level}
                onChange={(e) => set("languages", p.languages.map((x, j) => (j === i ? { ...x, level: e.target.value as typeof l.level } : x)))}
              >
                {LANGUAGE_LEVELS.map((lv) => (
                  <option key={lv} value={lv}>{lv}</option>
                ))}
              </select>
            </div>
            <button type="button" aria-label={`Remove language ${l.name || i + 1}`} className="mb-2 text-sm text-slate-500 hover:text-red-700" onClick={() => set("languages", p.languages.filter((_, j) => j !== i))}>
              Remove
            </button>
          </div>
        ))}
        <button type="button" className="justify-self-start text-sm font-medium text-brand-700" onClick={() => set("languages", [...p.languages, { name: "", level: "professional" }])}>
          + Add language
        </button>
        {errors.languages && <p role="alert" className="text-sm text-red-700">{errors.languages}</p>}
      </fieldset>

      <fieldset className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-ink">Locations and work authorisation</legend>
        <TagInput label="Preferred countries" values={p.preferredCountries} onChange={(v) => set("preferredCountries", v)} error={errors.preferredCountries} suggestions={COUNTRY_SUGGESTIONS} placeholder="e.g. Germany" />
        {p.preferredCountries.length > 0 && (
          <div>
            <p className="text-sm font-medium text-ink">Do you have the right to work in each country?</p>
            <p className="text-xs text-slate-500">We do not determine visa status. &quot;Not sure&quot; is shown on matches as needing verification.</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {p.preferredCountries.map((c) => (
                <label key={c} className="flex items-center justify-between gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                  {c}
                  <select
                    className="rounded border border-slate-300 px-2 py-1"
                    value={p.workAuthorisation[c] ?? "unknown"}
                    onChange={(e) => set("workAuthorisation", { ...p.workAuthorisation, [c]: e.target.value as WorkAuth })}
                  >
                    <option value="unknown">Not sure</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </label>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      <button type="submit" className="rounded-md bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">
        Save profile and see matches
      </button>
    </form>
  );
}
