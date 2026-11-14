"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useShortlist } from "../hooks/useLocalState";
import { btnOutline, btnPrimary } from "./ui";

export function ShortlistButton({ id, title }: { id: string; title: string }) {
  const { has, toggle, ready } = useShortlist();
  const saved = has(id);
  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      disabled={!ready}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from shortlist` : `Add ${title} to shortlist`}
      onClick={() => toggle(id)}
      className={saved ? btnPrimary : btnOutline}
    >
      <Icon className="size-4" aria-hidden />
      {saved ? "Shortlisted" : "Shortlist"}
    </button>
  );
}
