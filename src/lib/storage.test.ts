// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { sampleProfile } from "../data/sampleProfile";
import {
  clearAll,
  loadProfile,
  loadShortlist,
  loadTracker,
  PROFILE_KEY,
  saveProfile,
  setNote,
  setStage,
  SHORTLIST_KEY,
  toggleShortlist,
  TRACKER_KEY,
} from "./storage";

describe("local storage", () => {
  beforeEach(() => window.localStorage.clear());

  it("round-trips profile", () => {
    saveProfile(sampleProfile);
    expect(loadProfile()).toEqual(sampleProfile);
  });

  it("returns null when nothing is stored", () => {
    expect(loadProfile()).toBeNull();
    expect(loadShortlist()).toEqual([]);
  });

  it("ignores corrupt storage", () => {
    window.localStorage.setItem(PROFILE_KEY, "{bad");
    window.localStorage.setItem(SHORTLIST_KEY, JSON.stringify({ not: "an array" }));
    expect(loadProfile()).toBeNull();
    expect(loadShortlist()).toEqual([]);
  });

  it("ignores stored profiles that fail the schema", () => {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...sampleProfile, yearsExperience: -4 }));
    expect(loadProfile()).toBeNull();
  });

  it("toggleShortlist adds then removes", () => {
    expect(toggleShortlist("a")).toEqual(["a"]);
    expect(toggleShortlist("b")).toEqual(["a", "b"]);
    expect(toggleShortlist("a")).toEqual(["b"]);
    expect(loadShortlist()).toEqual(["b"]);
  });

  it("clearAll removes profile and shortlist", () => {
    saveProfile(sampleProfile);
    toggleShortlist("a");
    clearAll();
    expect(loadProfile()).toBeNull();
    expect(loadShortlist()).toEqual([]);
  });
});

describe("application tracker", () => {
  beforeEach(() => window.localStorage.clear());

  it("migrates a v1 shortlist into tracker items at the Saved stage", () => {
    window.localStorage.setItem(SHORTLIST_KEY, JSON.stringify(["a", "b"]));
    const items = loadTracker();
    expect(items.map((i) => [i.id, i.stage, i.note])).toEqual([
      ["a", "Saved", ""],
      ["b", "Saved", ""],
    ]);
    expect(window.localStorage.getItem(SHORTLIST_KEY)).toBeNull();
    expect(loadShortlist()).toEqual(["a", "b"]);
  });

  it("moves an item through stages and keeps a note", () => {
    toggleShortlist("a");
    setStage("a", "Applied");
    setNote("a", "Sent CV on Monday");
    expect(loadTracker()[0]).toMatchObject({ id: "a", stage: "Applied", note: "Sent CV on Monday" });
  });

  it("ignores stage and note updates for untracked ids", () => {
    setStage("zzz", "Offer");
    setNote("zzz", "x");
    expect(loadTracker()).toEqual([]);
  });

  it("removes an item and its stage when toggled off", () => {
    toggleShortlist("a");
    setStage("a", "Interviewing");
    toggleShortlist("a");
    expect(loadTracker()).toEqual([]);
  });

  it("drops corrupt tracker data", () => {
    window.localStorage.setItem(TRACKER_KEY, JSON.stringify([{ id: "a", stage: "Unknown" }]));
    expect(loadTracker()).toEqual([]);
  });
});
