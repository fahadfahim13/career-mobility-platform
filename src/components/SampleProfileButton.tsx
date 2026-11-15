"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { sampleProfile } from "../data/sampleProfile";
import { useProfile } from "../hooks/useLocalState";

/** One-click demo: saves the brief's sample candidate and opens the ranked matches. */
export function SampleProfileButton({ className }: { className: string }) {
  const router = useRouter();
  const [, save] = useProfile();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        save(sampleProfile);
        router.push("/matches");
      }}
    >
      Try with a sample profile
      <ArrowRight className="size-4" aria-hidden />
    </button>
  );
}
