import { CircleHelp, OctagonAlert, ShieldAlert } from "lucide-react";
import type { Flag, FlagKind } from "../lib/matching/types";

const STYLE: Record<FlagKind, string> = {
  critical: "border-red-200 bg-red-50 text-red-900",
  verify: "border-amber-200 bg-amber-50 text-amber-950",
  missing: "border-slate-200 bg-slate-50 text-slate-700",
};

const ICON: Record<FlagKind, typeof OctagonAlert> = {
  critical: OctagonAlert,
  verify: ShieldAlert,
  missing: CircleHelp,
};

const PREFIX: Record<FlagKind, string> = {
  critical: "Requirement not met",
  verify: "Verification required",
  missing: "Information missing",
};

export function FlagList({ flags, compact = false }: { flags: Flag[]; compact?: boolean }) {
  const order: FlagKind[] = ["critical", "verify", "missing"];
  const sorted = [...flags].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind));
  const shown = compact ? sorted.filter((f) => f.kind !== "missing") : sorted;
  if (shown.length === 0) return null;
  return (
    <ul className="space-y-2">
      {shown.map((f, i) => {
        const Icon = ICON[f.kind];
        return (
          <li key={i} className={`flex gap-2 rounded-md border px-3 py-2 text-sm ${STYLE[f.kind]}`}>
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <span className="font-semibold">{PREFIX[f.kind]}.</span> {f.message}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
