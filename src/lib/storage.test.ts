// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { sampleProfile } from "../data/sampleProfile";
import { clearAll, loadProfile, loadShortlist, PROFILE_KEY, saveProfile, SHORTLIST_KEY, toggleShortlist } from "./storage";

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
