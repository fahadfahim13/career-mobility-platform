import { z } from "zod";
import { profileSchema } from "./schemas";
import type { Profile } from "./types";

// Versioned keys: a future schema change bumps the suffix instead of misreading old data.
export const PROFILE_KEY = "cm.profile.v1";
/** Legacy v1 shortlist (array of ids). Migrated into the tracker on first read. */
export const SHORTLIST_KEY = "cm.shortlist.v1";
export const TRACKER_KEY = "cm.tracker.v1";

export const STAGES = ["Saved", "Applying", "Applied", "Interviewing", "Offer", "Closed"] as const;
export type Stage = (typeof STAGES)[number];

const shortlistSchema = z.array(z.string());
const trackerSchema = z.array(
  z.object({
    id: z.string(),
    stage: z.enum(STAGES),
    note: z.string().max(500),
    savedAt: z.string(),
  }),
);
export type TrackedItem = z.infer<typeof trackerSchema>[number];

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; // Private mode or blocked storage.
  }
}

function read<T>(key: string, schema: z.ZodType<T>): T | null {
  try {
    const raw = storage()?.getItem(key);
    if (!raw) return null;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    storage()?.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or blocked storage: the app keeps working for this session.
  }
}

export function loadProfile(): Profile | null {
  return read(PROFILE_KEY, profileSchema);
}

export function saveProfile(p: Profile): void {
  write(PROFILE_KEY, profileSchema.parse(p));
}

function migrateShortlist(): TrackedItem[] | null {
  const legacy = read(SHORTLIST_KEY, shortlistSchema);
  if (!legacy) return null;
  const savedAt = new Date().toISOString();
  const items = legacy.map((id) => ({ id, stage: "Saved" as const, note: "", savedAt }));
  write(TRACKER_KEY, items);
  try {
    storage()?.removeItem(SHORTLIST_KEY);
  } catch {
    // Old key stays; the tracker key now wins.
  }
  return items;
}

export function loadTracker(): TrackedItem[] {
  const hasTracker = (() => {
    try {
      return storage()?.getItem(TRACKER_KEY) != null;
    } catch {
      return false;
    }
  })();
  if (hasTracker) return read(TRACKER_KEY, trackerSchema) ?? [];
  return migrateShortlist() ?? [];
}

export function loadShortlist(): string[] {
  return loadTracker().map((i) => i.id);
}

export function toggleShortlist(id: string): string[] {
  const current = loadTracker();
  const next = current.some((i) => i.id === id)
    ? current.filter((i) => i.id !== id)
    : [...current, { id, stage: "Saved" as const, note: "", savedAt: new Date().toISOString() }];
  write(TRACKER_KEY, next);
  return next.map((i) => i.id);
}

function update(id: string, patch: Partial<Pick<TrackedItem, "stage" | "note">>): void {
  const current = loadTracker();
  if (!current.some((i) => i.id === id)) return;
  write(TRACKER_KEY, current.map((i) => (i.id === id ? { ...i, ...patch } : i)));
}

export function setStage(id: string, stage: Stage): void {
  update(id, { stage });
}

export function setNote(id: string, note: string): void {
  update(id, { note: note.slice(0, 500) });
}

export function clearAll(): void {
  try {
    storage()?.removeItem(PROFILE_KEY);
    storage()?.removeItem(SHORTLIST_KEY);
    storage()?.removeItem(TRACKER_KEY);
  } catch {
    // Nothing to clear.
  }
}
