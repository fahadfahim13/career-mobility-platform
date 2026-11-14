"use client";

import { useId, useState } from "react";

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

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <div className="mt-1 flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">
            {v}
            <button
              type="button"
              aria-label={`Remove ${v}`}
              className="text-brand-700 hover:text-red-700"
              onClick={() => onChange(values.filter((x) => x !== v))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        id={id}
        value={draft}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          }
        }}
        onBlur={() => draft && add(draft)}
        className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      {unused.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {unused.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChange([...values, s])}
              className="rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:border-brand-600"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
