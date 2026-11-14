import { z } from "zod";
import { profileSchema } from "./schemas";
import type { Profile } from "./types";

// Versioned keys: a future schema change bumps the suffix instead of misreading old data.
export const PROFILE_KEY = "cm.profile.v1";
export const SHORTLIST_KEY = "cm.shortlist.v1";

const shortlistSchema = z.array(z.string());

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

export function loadShortlist(): string[] {
  return read(SHORTLIST_KEY, shortlistSchema) ?? [];
}

export function toggleShortlist(id: string): string[] {
  const current = loadShortlist();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  write(SHORTLIST_KEY, next);
  return next;
}

export function clearAll(): void {
  try {
    storage()?.removeItem(PROFILE_KEY);
    storage()?.removeItem(SHORTLIST_KEY);
  } catch {
    // Nothing to clear.
  }
}
