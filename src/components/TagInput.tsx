"use client";

import { Plus, X } from "lucide-react";
import { useId, useState } from "react";
import { field, fieldError, fieldHint, fieldLabel } from "./ui";

interface Props {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  suggestions?: string[];
}

/** Free-text list input: type and press Enter or comma to add; duplicates (case-insensitive) are ignored. */
export function TagInput({ label, values, onChange, placeholder, hint, error, suggestions = [] }: Props) {
  const id = useId();
  const [draft, setDraft] = useState("");

  function add(raw: string) {
    const v = raw.trim().replace(/,$/, "").trim();
    if (!v || values.some((x) => x.toLowerCase() === v.toLowerCase())) return setDraft("");
    onChange([...values, v]);
    setDraft("");
  }

  const unused = suggestions.filter((s) => !values.some((v) => v.toLowerCase() === s.toLowerCase()));
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-err` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className={fieldLabel}>{label}</label>
      {hint && <p id={`${id}-hint`} className={fieldHint}>{hint}</p>}
      {values.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2" aria-label={`${label} added`}>
          {values.map((v) => (
            <li key={v} className="inline-flex items-center gap-1 bg-brand-50 py-1 pl-3 pr-1 text-sm text-brand-700 ring-1 ring-inset ring-brand-100">
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                className="inline-flex size-6 items-center justify-center transition-colors duration-150 hover:bg-brand-100 hover:text-red-700"
                onClick={() => onChange(values.filter((x) => x !== v))}
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        value={draft}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          }
        }}
        onBlur={() => draft && add(draft)}
        className={field}
      />
      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {unused.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange([...values, s])}
              className="inline-flex min-h-8 items-center gap-1 border border-slate-300 bg-white px-3 text-xs text-slate-700 transition-colors duration-150 hover:border-brand-600 hover:text-brand-700"
            >
              <Plus className="size-3" aria-hidden />
              {s}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p id={`${id}-err`} className={fieldError}>{error}</p>
      )}
    </div>
  );
}
