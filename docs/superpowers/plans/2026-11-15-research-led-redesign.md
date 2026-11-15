# Research-led Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Turn the MVP into a product-grade international mobility platform. The features come from competitor research, and the redesign uses the International Typographic Style.

**Architecture:** The pure matching engine stays as it is; new outputs are added to it and the scores do not change. New pure modules cover profile strength, match filtering and the tracker storage. The UI is rebuilt on new tokens and a score-strip signature component.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind 4, zod 4, Vitest, Playwright.

**Spec:** docs/COMPETITOR_RESEARCH.md (features 1–11), PRODUCT.md, .impeccable/briefs/landing.md (direction contract).

## Global Constraints
- The sample-profile ranking must not change: Programme Assistant 100 … Software Engineer 19.
- Verify copy: "Work authorisation not confirmed — needs verification". Never a legal determination.
- British spelling. No invented customers, testimonials or usage numbers. All roles and salaries are labelled fictional.
- Must work at 360px with no horizontal overflow. WCAG AA. Status is never shown by colour alone.

## Review Focus
- Old `cm.shortlist.v1` data must migrate into the tracker without loss.
- A profile with no data shows a strength of 0% and the matches page still renders.
- When filters remove every role, the page shows an empty state with a reset action.
- The country guide lookup handles a remote role and an unknown country with a generic fallback.
- The recognition flag must never change the score.

### Task 1: Data — salary, visa support, relocation package, recognition, country guides
- `opportunitySchema` gains:
  - `salary: {min, max, currency, period: "year"|"month"}`
  - `visaSupport: "offered"|"case-by-case"|"not-offered"`
  - `relocation: string[]`
  - `recognitionMayBeRequired: boolean`
- Fill in all 12 roles.
- `src/data/countryGuides.ts`: `getCountryGuide(country) → {country, steps: string[], sources: {label, url}[]}`, with a generic fallback.
- Test: data.test asserts every role parses and every role country has a guide.

### Task 2: Engine outputs
`MatchResult` gains:
- `eligibility: "clear"|"verify"|"blocked"` (right to work only)
- `skillCoverage: {matched: string[], missing: string[]}`
- `nextSteps: {text, field}[]`

Add a verify flag "Qualification recognition may be required — check before applying" when `recognitionMayBeRequired`. Tests are written first; the ranking stays unchanged.

### Task 3: Tracker storage
- Key `cm.tracker.v1`: `[{id, stage, note, savedAt}]`, where stage is one of Saved | Applying | Applied | Interviewing | Offer | Closed.
- Migrate from `cm.shortlist.v1` on the first read.
- Functions: `loadTracker`, `toggleTracked`, `setStage`, `setNote`.
- `useShortlist` keeps `{ids, has, toggle, ready}` and adds `items`, `setStage` and `setNote`.

### Task 4: Profile strength
`profileStrength(p) → {percent, missing: string[]}`, made of 8 equally weighted fields. Tested.

### Task 5: Match filtering and sorting
`filterMatches(rows, {band, country, eligibility, visaSupport}, sort)`, where sort is `"fit"|"eligibility"|"salary"`. Tested, including the empty result.

### Task 6: Visual system + shell
- Archivo via next/font.
- Tokens: paper, ink, ultramarine field, verify yellow, blocked red, met green.
- New Nav and footer with the disclaimer. Pages to add: `/how-it-works`.

### Task 7: Components and pages
- Score strip (segment width = weight, fill = points, pinned notes).
- MatchCard: ref code, x of y skills, why chips, separate eligibility.
- Detail page: arithmetic trace, covers / does not cover, steps to verify, next steps, relocation and salary.
- Matches page: filters.
- Profile page: sections + strength rail.
- Tracker page.
- Landing page.

### Task 8: Verify
Unit tests, e2e tests (update the selectors), screenshots at 360/390/768/1280, overflow check, then a fresh review.
