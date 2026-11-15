import { Check } from "lucide-react";
import type { ReactNode } from "react";

const POINTS = [
  "Every match scored 0–100, with the working shown",
  "Right to work shown separately, never assumed",
  "Official steps to verify for each country",
];

/** Two-column frame for sign-in and sign-up: a short promise on the field, the form on paper. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 border-2 border-ink bg-white lg:grid-cols-12">
      <aside className="on-field hidden bg-field p-10 text-on-field lg:col-span-5 lg:block">
        <p className="text-3xl font-extrabold leading-tight tracking-tight">The right match, across borders.</p>
        <ul className="mt-8 space-y-4 text-sm">
          {POINTS.map((p) => (
            <li key={p} className="flex gap-3">
              <Check className="mt-0.5 size-4 shrink-0" aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </aside>
      <div className="flex justify-center px-5 py-10 sm:px-10 lg:col-span-7">{children}</div>
    </div>
  );
}
