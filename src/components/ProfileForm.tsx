"use client";

import { Check, Circle, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { sampleProfile } from "../data/sampleProfile";
import { notifyStorageChange, useProfile } from "../hooks/useLocalState";
import { profileStrength } from "../lib/profileStrength";
import { EDUCATION_LEVELS, LANGUAGE_LEVELS, profileFormSchema } from "../lib/schemas";
import { clearAll } from "../lib/storage";
import type { Profile, WorkAuth } from "../lib/types";
import { TagInput } from "./TagInput";
import { btnGhost, btnOutline, btnPrimary, field, fieldError, fieldHint, fieldLabel } from "./ui";

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
  none: "No formal qualification",
  secondary: "Secondary school",
  diploma: "Diploma",
  bachelor: "Bachelor's degree",
  master: "Master's degree",
  phd: "Doctorate (PhD)",
};
const LANGUAGE_LABEL: Record<string, string> = {
  basic: "Basic",
  conversational: "Conversational",
  professional: "Professional",
  native: "Native",
};

type Errors = Partial<Record<keyof Profile, string>>;

const FRIENDLY: Partial<Record<keyof Profile, string>> = {
  educationLevel: "Select your highest level of education.",
  yearsExperience: "Enter your years of work experience (0–50).",
};

const sectionCls = "grid scroll-mt-24 gap-5 border-t-2 border-ink bg-white p-5 sm:p-6";
const legendCls = "float-left mb-1 w-full text-lg font-bold tracking-tight text-ink";

const RAIL: { href: string; label: string; done: (p: Profile) => boolean }[] = [
  { href: "#education", label: "Education and experience", done: (p) => p.educationLevel !== null && p.yearsExperience !== null },
  { href: "#skills", label: "Skills and interests", done: (p) => p.skills.length > 0 && p.interests.length > 0 },
  { href: "#languages", label: "Languages", done: (p) => p.languages.length > 0 },
  { href: "#preferredCountries", label: "Countries and work authorisation", done: (p) => p.preferredCountries.length > 0 },
];

export function ProfileForm() {
  const router = useRouter();
  const [stored, save, ready] = useProfile();
  const [p, setP] = useState<Profile>(EMPTY);
  const [years, setYears] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const loadedRef = useRef(false);

  // Populate the form once from the saved profile, without overwriting edits on later storage events.
  useEffect(() => {
    if (ready && stored && !loadedRef.current) {
      loadedRef.current = true;
      setP(stored);
      setYears(stored.yearsExperience === null ? "" : String(stored.yearsExperience));
    }
    // Next steps link to #field anchors that only exist once the saved profile has rendered.
    if (ready && window.location.hash) {
      const id = window.location.hash.slice(1);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "start" }));
    }
  }, [ready, stored]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setP((prev) => ({ ...prev, [key]: value }));

  function loadSample() {
    setP(sampleProfile);
    setYears(String(sampleProfile.yearsExperience));
    setErrors({});
    setNotice("Sample profile loaded. Review the details, then save to see your matches.");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    const candidate = {
      ...p,
      languages: p.languages.map((l) => ({ ...l, name: l.name.trim() })),
      yearsExperience: years.trim() === "" ? null : Number(years),
      // Keep authorisation answers only for countries that are still listed.
      workAuthorisation: Object.fromEntries(
        p.preferredCountries.map((c) => [c, p.workAuthorisation[c] ?? "unknown"]),
      ) as Record<string, WorkAuth>,
    };
    const parsed = profileFormSchema.safeParse(candidate);
    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Profile;
        if (!next[key]) next[key] = FRIENDLY[key] ?? issue.message;
      }
      setErrors(next);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setErrors({});
    save(parsed.data);
    router.push("/matches");
  }

  function onClear() {
    clearAll();
    notifyStorageChange();
    setP(EMPTY);
    setYears("");
    setErrors({});
    setNotice("Your profile, shortlist, stages and notes have been removed from this browser.");
  }

  const errorCount = Object.keys(errors).length;
  const draft: Profile = { ...p, yearsExperience: years.trim() === "" ? null : Number(years) };
  const strength = profileStrength(draft);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <aside className="lg:order-last lg:col-span-4" aria-label="Profile progress">
        <div className="on-field bg-field p-5 text-on-field lg:sticky lg:top-24">
          <p className="text-6xl font-extrabold leading-none tracking-tighter">
            {strength.percent}
            <span className="text-2xl">%</span>
          </p>
          <p className="mt-1 text-sm font-bold">Profile strength</p>
          <div className="mt-3 h-2 bg-field-deep" aria-hidden>
            <div className="h-full bg-verify transition-[width] duration-500" style={{ width: `${strength.percent}%` }} />
          </div>
          <ul className="mt-4 space-y-1 text-sm">
            {RAIL.map((r) => {
              const ok = r.done(draft);
              return (
                <li key={r.href}>
                  <a href={r.href} className="flex min-h-9 items-center gap-2 hover:underline">
                    {ok ? <Check className="size-4 text-verify" aria-hidden /> : <Circle className="size-4 text-on-field-muted" aria-hidden />}
                    {r.label}
                    <span className="sr-only">{ok ? "(complete)" : "(incomplete)"}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 border-t border-on-field-muted/40 pt-3 text-xs text-on-field-muted">
            About five minutes. If you do not know your work authorisation, answer &ldquo;Not sure&rdquo;: affected roles are
            marked for verification, never hidden.
          </p>
        </div>
      </aside>
    <form onSubmit={onSubmit} noValidate className="space-y-6 lg:col-span-8">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={loadSample} className={btnOutline}>
          Load sample profile
        </button>
        <button type="button" onClick={onClear} className={btnGhost}>
          <Trash2 className="size-4" aria-hidden />
          Clear my data
        </button>
      </div>

      <div aria-live="polite">
        {notice && <p className="bg-field-tint px-4 py-3 text-sm font-medium text-field-deep">{notice}</p>}
      </div>

      {errorCount > 0 && (
        <div ref={summaryRef} tabIndex={-1} role="alert" className="bg-blocked-tint px-4 py-3 text-sm text-ink">
          <p className="font-semibold">Please correct {errorCount === 1 ? "1 field" : `${errorCount} fields`} before saving:</p>
          <ul className="mt-1 list-disc pl-5">
            {Object.values(errors).map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      )}

      <fieldset id="education" className={`${sectionCls} sm:grid-cols-2`}>
        <legend className={legendCls}>Education and experience</legend>
        <div>
          <label htmlFor="educationLevel" className={fieldLabel}>Highest level of education</label>
          <select
            id="educationLevel"
            className={field}
            value={p.educationLevel ?? ""}
            aria-invalid={!!errors.educationLevel}
            aria-describedby={errors.educationLevel ? "educationLevel-err" : undefined}
            onChange={(e) => set("educationLevel", e.target.value === "" ? null : (e.target.value as Profile["educationLevel"]))}
          >
            <option value="">Select a level</option>
            {EDUCATION_LEVELS.map((l) => (
              <option key={l} value={l}>{LEVEL_LABEL[l]}</option>
            ))}
          </select>
          {errors.educationLevel && <p id="educationLevel-err" className={fieldError}>{errors.educationLevel}</p>}
        </div>
        <div>
          <label htmlFor="educationField" className={fieldLabel}>Field of study</label>
          <input id="educationField" className={field} value={p.educationField} placeholder="For example, Business Administration" onChange={(e) => set("educationField", e.target.value)} />
        </div>
        <div id="yearsExperience" className="scroll-mt-24">
          <label htmlFor="years" className={fieldLabel}>Years of professional experience</label>
          <input
            id="years"
            type="number"
            min={0}
            max={50}
            step={0.5}
            inputMode="decimal"
            className={`${field} tabular-nums`}
            value={years}
            aria-invalid={!!errors.yearsExperience}
            aria-describedby={errors.yearsExperience ? "years-err" : undefined}
            onChange={(e) => setYears(e.target.value)}
          />
          {errors.yearsExperience && <p id="years-err" className={fieldError}>{errors.yearsExperience}</p>}
        </div>
        <fieldset id="enrolledStudent" className="scroll-mt-24">
          <legend className={fieldLabel}>Are you currently enrolled as a student?</legend>
          <p className={fieldHint}>Some internships are open only to enrolled students.</p>
          <div className="mt-1 flex flex-wrap gap-x-5 text-sm">
            {([["Yes", true], ["No", false], ["Prefer not to say", null]] as const).map(([label, value]) => (
              <label key={label} className="flex min-h-11 items-center gap-2">
                <input type="radio" name="enrolled" className="size-4" checked={p.enrolledStudent === value} onChange={() => set("enrolledStudent", value)} />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <label htmlFor="summary" className={fieldLabel}>Experience summary <span className="font-normal text-muted">(optional)</span></label>
          <textarea id="summary" rows={3} maxLength={500} className={`${field} py-2`} value={p.experienceSummary} onChange={(e) => set("experienceSummary", e.target.value)} />
        </div>
      </fieldset>

      <fieldset id="skills" className={sectionCls}>
        <legend className={legendCls}>Skills and career interests</legend>
        <TagInput
          label="Skills"
          hint="Press Enter or type a comma after each skill."
          values={p.skills}
          onChange={(v) => set("skills", v)}
          error={errors.skills}
          placeholder="For example, Excel"
        />
        <div id="interests" className="-mb-5 scroll-mt-24" />
        <TagInput
          label="Career interests"
          hint="Areas of work you would like to pursue."
          values={p.interests}
          onChange={(v) => set("interests", v)}
          placeholder="For example, Project coordination"
        />
      </fieldset>

      <fieldset id="languages" className={sectionCls}>
        <legend className={legendCls}>Languages</legend>
        {p.languages.length === 0 && <p className="text-sm text-muted">Add each language you can work in and your level.</p>}
        {p.languages.map((l, i) => (
          <div key={i} className="grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
            <div>
              <label htmlFor={`lang-${i}`} className={fieldLabel}>Language</label>
              <input
                id={`lang-${i}`}
                className={field}
                value={l.name}
                aria-invalid={!!errors.languages && l.name.trim() === ""}
                onChange={(e) => set("languages", p.languages.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              />
            </div>
            <div>
              <label htmlFor={`lang-level-${i}`} className={fieldLabel}>Proficiency</label>
              <select
                id={`lang-level-${i}`}
                className={field}
                value={l.level}
                onChange={(e) => set("languages", p.languages.map((x, j) => (j === i ? { ...x, level: e.target.value as typeof l.level } : x)))}
              >
                {LANGUAGE_LEVELS.map((lv) => (
                  <option key={lv} value={lv}>{LANGUAGE_LABEL[lv]}</option>
                ))}
              </select>
            </div>
            <button type="button" aria-label={`Remove ${l.name || `language ${i + 1}`}`} className={btnGhost} onClick={() => set("languages", p.languages.filter((_, j) => j !== i))}>
              <Trash2 className="size-4" aria-hidden />
              <span className="sm:sr-only">Remove</span>
            </button>
          </div>
        ))}
        <div>
          <button type="button" className={btnOutline} onClick={() => set("languages", [...p.languages, { name: "", level: "professional" }])}>
            <Plus className="size-4" aria-hidden />
            Add language
          </button>
        </div>
        {errors.languages && <p className={fieldError}>{errors.languages}</p>}
      </fieldset>

      <fieldset id="preferredCountries" className={sectionCls}>
        <legend className={legendCls}>Preferred locations and work authorisation</legend>
        <TagInput
          label="Preferred countries"
          values={p.preferredCountries}
          onChange={(v) => set("preferredCountries", v)}
          error={errors.preferredCountries}
          suggestions={COUNTRY_SUGGESTIONS}
          placeholder="For example, Germany"
        />
        {p.preferredCountries.length > 0 && (
          <div id="workAuthorisation" className="scroll-mt-24">
            <p className={fieldLabel}>Do you have the right to work in each country?</p>
            <p className={fieldHint}>
              Pathway does not assess visa or immigration status. If you are unsure, matching roles will be marked as requiring verification.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {p.preferredCountries.map((c) => (
                <label key={c} className="flex items-center justify-between gap-3 border border-line px-3 py-2 text-sm font-semibold text-ink">
                  {c}
                  <select
                    className="min-h-10 border border-slate-300 bg-white px-2 text-sm"
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

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className={btnPrimary}>Save profile and view matches</button>
        <p className="text-xs text-muted">Your profile is stored only in this browser. Nothing is sent to an employer.</p>
      </div>
    </form>
    </div>
  );
}
