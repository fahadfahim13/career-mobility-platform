"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { sampleProfile } from "../data/sampleProfile";
import { useProfile } from "../hooks/useLocalState";

/**
 * One-click demo: saves the brief's sample candidate and opens the ranked matches.
 * If a profile is already saved it is never overwritten; the button opens the matches instead.
 */
export function SampleProfileButton({ className }: { className: string }) {
  const router = useRouter();
  const [profile, save, ready] = useProfile();
  const hasProfile = ready && profile !== null;
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (!hasProfile) save(sampleProfile);
        router.push("/matches");
      }}
    >
      {hasProfile ? "View your matches" : "Try with a sample profile"}
      <ArrowRight className="size-4" aria-hidden />
    </button>
  );
}
