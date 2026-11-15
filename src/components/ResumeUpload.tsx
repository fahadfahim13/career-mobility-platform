"use client";

import { FileText, LoaderCircle } from "lucide-react";
import { useId, useState, type ChangeEvent } from "react";
import type { ResumeFields } from "../lib/resume/fields";
import { btnOutline } from "./ui";

const MAX_BYTES = 4 * 1024 * 1024;

type Status = { kind: "idle" | "reading" | "done" | "error"; message?: string };

/**
 * Uploads a PDF resume to /api/resume, which stores it privately and returns the profile fields an
 * AI model read from it. The parent decides how to merge them and returns how many fields it filled.
 */
export function ResumeUpload({ onFields, title = "Fill from your resume" }: { onFields: (f: ResumeFields) => number; title?: string }) {
  const id = useId();
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // Allow the same file to be chosen again.
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return setStatus({ kind: "error", message: "This file is not a PDF. Save your resume as a PDF and try again." });
    }
    if (file.size > MAX_BYTES) return setStatus({ kind: "error", message: "The file is larger than 4 MB. Upload a smaller PDF." });

    setStatus({ kind: "reading", message: `Reading ${file.name}…` });
    try {
      const body = new FormData();
      body.append("resume", file);
      const res = await fetch("/api/resume", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { fields?: ResumeFields; error?: string };
      if (!res.ok || !data.fields) {
        return setStatus({ kind: "error", message: data.error ?? "We could not read this resume. Please fill in the form by hand." });
      }
      const filled = onFields(data.fields);
      setStatus(
        filled > 0
          ? { kind: "done", message: `Filled ${filled} ${filled === 1 ? "field" : "fields"} from ${file.name}. Check them before you save.` }
          : { kind: "error", message: "We found no profile details in this file. Please fill in the form by hand." },
      );
    } catch {
      setStatus({ kind: "error", message: "The upload failed. Check your connection and try again." });
    }
  }

  const reading = status.kind === "reading";
  return (
    <div className="border-2 border-dashed border-slate-300 bg-white p-5">
      <div className="flex flex-wrap items-center gap-4">
        <FileText className="size-8 shrink-0 text-field" aria-hidden />
        <div className="min-w-0 flex-1 basis-48">
          <p className="font-bold">{title}</p>
          <p className="text-sm text-muted">PDF, up to 4 MB. AI fills the fields. You check them.</p>
        </div>
        <label htmlFor={id} className={`${btnOutline} w-full cursor-pointer sm:w-auto has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-field ${reading ? "pointer-events-none opacity-60" : ""}`}>
          {reading && <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />}
          {reading ? "Reading…" : "Upload resume (PDF)"}
          <input id={id} type="file" accept="application/pdf,.pdf" className="sr-only" disabled={reading} onChange={onChange} />
        </label>
      </div>
      <p aria-live="polite" className="empty:hidden">
        {status.message && (
          <span
            className={`mt-4 block px-3 py-2 text-sm ${
              status.kind === "error" ? "bg-blocked-tint text-ink" : status.kind === "done" ? "bg-met-tint text-ink" : "bg-field-tint text-field-deep"
            }`}
          >
            {status.message}
          </span>
        )}
      </p>
    </div>
  );
}
