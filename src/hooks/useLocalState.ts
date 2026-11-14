"use client";

import { useCallback, useEffect, useState } from "react";
import { loadProfile, loadShortlist, saveProfile, toggleShortlist } from "../lib/storage";
import type { Profile } from "../lib/types";

// Same-tab change signal so every component reading storage re-syncs after a write.
const CHANGE_EVENT = "cm-storage-change";

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function useStorageSync(sync: () => void) {
  useEffect(() => {
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync); // other tabs
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);
}

/**
 * Profile from localStorage. Storage is read after mount (not during render) so server and client
 * HTML match; `ready` is false until that first read so pages can avoid flashing an empty state.
 */
export function useProfile(): [Profile | null, (p: Profile) => void, boolean] {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(false);
  const sync = useCallback(() => {
    setProfile(loadProfile());
    setReady(true);
  }, []);
  useStorageSync(sync);
  const save = useCallback((p: Profile) => {
    saveProfile(p);
    notify();
  }, []);
  return [profile, save, ready];
}

export function useShortlist() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const sync = useCallback(() => {
    setIds(loadShortlist());
    setReady(true);
  }, []);
  useStorageSync(sync);
  const toggle = useCallback((id: string) => {
    toggleShortlist(id);
    notify();
  }, []);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  return { ids, toggle, has, ready };
}

export function notifyStorageChange() {
  notify();
}
