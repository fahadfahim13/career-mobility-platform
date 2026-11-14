// Shared class strings so every button and field behaves the same way across pages.
const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150 disabled:opacity-50";

export const btnPrimary = `${base} bg-brand-600 font-semibold text-white hover:bg-brand-700`;
export const btnSecondary = `${base} border border-slate-300 bg-white text-ink hover:border-slate-400 hover:bg-slate-50`;
export const btnOutline = `${base} border border-brand-600 bg-white text-brand-700 hover:bg-brand-50`;
export const btnGhost = `${base} text-slate-600 hover:bg-slate-100 hover:text-ink`;
export const btnDark = `${base} bg-ink text-white hover:bg-slate-800`;

export const field =
  "mt-1 block min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-ink transition-colors duration-150 placeholder:text-slate-400 hover:border-slate-400 aria-[invalid=true]:border-red-600 sm:text-sm";

export const fieldLabel = "block text-sm font-medium text-ink";
export const fieldHint = "mt-0.5 text-xs text-slate-600";
export const fieldError = "mt-1 text-sm text-red-700";
export const panel = "rounded-lg border border-line bg-white";
