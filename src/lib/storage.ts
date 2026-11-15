import { z } from "zod";
import { profileSchema } from "./schemas";
import type { Profile } from "./types";

// Versioned keys: a future schema change bumps the suffix instead of misreading old data.
export const PROFILE_KEY = "cm.profile.v1";
/** Legacy v1 shortlist (array of ids). Migrated into the tracker on first read. */
export const SHORTLIST_KEY = "cm.shortlist.v1";
export const TRACKER_KEY = "cm.tracker.v1";
/** Holds unreadable tracker data so a later write cannot silently destroy it. */
export const TRACKER_BACKUP_KEY = "cm.tracker.v1.backup";

export const STAGES = ["Saved", "Applying", "Applied", "Interviewing", "Offer", "Closed"] as const;
export type Stage = (typeof STAGES)[number];

const shortlistSchema = z.array(z.string());
const trackedItemSchema = z.object({
  id: z.string(),
  stage: z.enum(STAGES),
  note: z.string().max(500),
  savedAt: z.string(),
});
export type TrackedItem = z.infer<typeof trackedItemSchema>;

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)));
}

function rawItem(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

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
  const items = uniqueById(legacy.map((id) => ({ id, stage: "Saved" as const, note: "", savedAt })));
  write(TRACKER_KEY, items);
  // Remove the legacy key only once the tracker copy is safely stored.
  if (rawItem(TRACKER_KEY) !== null) {
    try {
      storage()?.removeItem(SHORTLIST_KEY);
    } catch {
      // Old key stays; the tracker key now wins.
    }
  }
  return items;
}

/**
 * Reads the tracker item by item: one invalid entry is dropped instead of discarding the whole list.
 * Data that cannot be read at all is copied to a backup key before any later write replaces it.
 */
export function loadTracker(): TrackedItem[] {
  const raw = rawItem(TRACKER_KEY);
  if (raw === null) return migrateShortlist() ?? [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  if (!Array.isArray(parsed)) {
    try {
      storage()?.setItem(TRACKER_BACKUP_KEY, raw);
    } catch {
      // Nothing more can be done; the original value is still in place until the next write.
    }
    return [];
  }
  return uniqueById(parsed.flatMap((x) => {
    const r = trackedItemSchema.safeParse(x);
    return r.success ? [r.data] : [];
  }));
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
