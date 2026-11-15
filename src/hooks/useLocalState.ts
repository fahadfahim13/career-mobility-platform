"use client";

import { useCallback, useEffect, useState } from "react";
import { loadProfile, loadResumeRef, loadTracker, saveProfile, setNote as storeNote, setStage as storeStage, toggleShortlist, type ResumeRef, type Stage, type TrackedItem } from "../lib/storage";
import { fetchAccount, signOut as serverSignOut, type Account } from "../lib/accounts";
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

/** Shortlist plus application tracking (stage and note per saved role). */
export function useShortlist() {
  const [items, setItems] = useState<TrackedItem[]>([]);
  const [ready, setReady] = useState(false);
  const sync = useCallback(() => {
    setItems(loadTracker());
    setReady(true);
  }, []);
  useStorageSync(sync);
  const toggle = useCallback((id: string) => {
    toggleShortlist(id);
    notify();
  }, []);
  const setStage = useCallback((id: string, stage: Stage) => {
    storeStage(id, stage);
    notify();
  }, []);
  const setNote = useCallback((id: string, note: string) => {
    storeNote(id, note);
    notify();
  }, []);
  const ids = items.map((i) => i.id);
  const has = useCallback((id: string) => items.some((i) => i.id === id), [items]);
  return { ids, items, toggle, has, setStage, setNote, ready };
}

export function notifyStorageChange() {
  notify();
}

/** Last uploaded resume reference, or null. */
export function useResumeRef(): ResumeRef | null {
  const [ref, setRef] = useState<ResumeRef | null>(null);
  const sync = useCallback(() => setRef(loadResumeRef()), []);
  useStorageSync(sync);
  return ref;
}

/**
 * Signed-in account from the server session (HttpOnly cookie). `ready` is false until the first
 * answer arrives. Re-checks after sign-in or sign-out (same-tab change signal).
 */
export function useAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  const [ready, setReady] = useState(false);
  const sync = useCallback(() => {
    let live = true;
    void fetchAccount().then((a) => {
      if (!live) return;
      setAccount(a);
      setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);
  useEffect(() => {
    sync();
    const onChange = () => sync();
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, [sync]);
  const signOut = useCallback(async () => {
    await serverSignOut();
    notify();
  }, []);
  return { account, ready, signOut };
}
