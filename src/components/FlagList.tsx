import { CircleHelp, OctagonX, ShieldQuestion } from "lucide-react";
import type { Flag, FlagKind } from "../lib/matching/types";

const STYLE: Record<FlagKind, string> = {
  critical: "bg-blocked-tint text-ink [&_svg]:text-blocked",
  verify: "bg-verify-tint text-ink [&_svg]:text-verify-ink",
  missing: "bg-slate-100 text-ink [&_svg]:text-muted",
};

const ICON: Record<FlagKind, typeof OctagonX> = {
  critical: OctagonX,
  verify: ShieldQuestion,
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
    <ul className="space-y-1">
      {shown.map((f, i) => {
        const Icon = ICON[f.kind];
        return (
          <li key={i} className={`flex gap-2 px-3 py-2 text-sm ${STYLE[f.kind]}`}>
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              <span className="font-bold">{PREFIX[f.kind]}.</span> {f.message}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
