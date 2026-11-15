// Shared class strings so every control behaves the same way across pages. Square corners, 44px targets.
const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-semibold transition-colors duration-150 disabled:opacity-50";

export const btnPrimary = `${base} bg-field text-on-field hover:bg-field-deep`;
/** For use on the ultramarine field. */
export const btnOnField = `${base} bg-paper text-ink hover:bg-verify`;
export const btnOnFieldOutline = `${base} border border-on-field-muted text-on-field hover:bg-field-deep`;
export const btnSecondary = `${base} border border-ink bg-paper text-ink hover:bg-ink hover:text-paper`;
export const btnOutline = `${base} border border-field bg-paper text-field hover:bg-field-tint`;
export const btnGhost = `${base} font-medium text-muted hover:bg-slate-100 hover:text-ink`;
export const btnDark = `${base} bg-ink text-paper hover:bg-slate-800`;

export const field =
  "mt-1 block min-h-11 w-full rounded-sm border border-slate-300 bg-white px-3 text-base text-ink transition-colors duration-150 placeholder:text-slate-500 hover:border-slate-500 aria-[invalid=true]:border-blocked sm:text-sm";

export const fieldLabel = "block text-sm font-semibold text-ink";
export const fieldHint = "mt-0.5 text-xs text-muted";
export const fieldError = "mt-1 text-sm font-medium text-blocked";
export const panel = "border border-line bg-white";

/** Section heading used across Operate pages. */
export const h2 = "text-lg font-bold tracking-tight text-ink";
export const pageTitle = "text-3xl font-extrabold tracking-tight text-ink sm:text-5xl";
export const textLink = "font-semibold text-field underline hover:text-field-deep";
