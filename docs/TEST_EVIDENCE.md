# Test evidence

Run date: 2026-11-15. Commands: `npm test` (unit), `npm run test:e2e` (end-to-end), `npm run report` (ranking).

**Result: 73/73 unit tests passed. 18/18 end-to-end runs passed (9 journeys × desktop and mobile).**

## 1. The three required cases (sample profile from the brief)

| Case | Opportunity | Score | Band | Why |
|---|---|---|---|---|
| Strong match | Programme Assistant – International NGO (Toronto) | 100 | Strong | All 4 required skills; 2 years within the 1–2 year range; Business Administration degree in a relevant field; Canada is preferred; English met; matches "programme support". Flag: work authorisation needs verification (unknown, not assumed). |
| Partial match | Junior Data Analyst (Amsterdam) | 57 | Partial | Skills 12/30 (has Excel and Reporting; missing SQL, Python, Data visualisation); Netherlands not preferred (0/15); interests 0/10; experience, education and language met. |
| Critical requirement gap | German-speaking Client Associate (Frankfurt) | 35 (raw 65) | Critical gap | Requires professional German; the profile lists none. Critical flag raised, score capped at 35. Also flagged: work authorisation needs verification. |
| Critical requirement gap (2nd) | Business Analyst Intern (Berlin) | 35 | Critical gap | Open only to enrolled students; the profile states not enrolled. Local work eligibility required and unknown, so it is flagged for verification. |

Unit tests: `strong match: Programme Assistant NGO`, `partial match: Junior Data Analyst`,
`critical gap: German-speaking Client Associate`, `critical gap: Business Analyst Intern`
(`src/lib/matching/engine.test.ts`).

## 2. Full ranking for the sample profile (`npm run report`)

| Rank | Opportunity | Score | Band | Flags |
|---|---|---|---|---|
| 1 | programme-assistant-ngo | 100 | Strong | verify |
| 2 | operations-coordinator-singapore | 88 | Strong | verify |
| 3 | project-coordinator-toronto | 88 | Strong | verify |
| 4 | research-assistant-remote | 79 | Strong | — |
| 5 | operations-specialist-munich | 72 | Partial | verify |
| 6 | marketing-coordinator-vancouver | 68 | Partial | verify |
| 7 | junior-data-analyst-amsterdam | 57 | Partial | verify |
| 8 | programme-officer-berlin | 53 | Partial | verify |
| 9 | business-analyst-intern-berlin | 35 | Critical gap | critical, verify |
| 10 | german-client-associate-frankfurt | 35 | Critical gap | critical, verify |
| 11 | sales-executive-dubai | 35 | Critical gap | critical, verify |
| 12 | software-engineer-london | 19 | Weak | verify |

The remote research role has no `verify` flag because it does not require local work authorisation.

## 3. Unit tests (Vitest) — 73 passed

| Area | Tests |
|---|---|
| Data (8) | at least 10 valid opportunities; unique ids; at least two hard constraints; lookup by id and unknown id; sample profile passes schema; every role has salary, visa support and relocation fields; every role country has a guide with official https sources; unknown country falls back to a generic guide |
| Criteria (9) | skill normalisation and synonyms; experience in range / overqualified / slightly short / far short / unknown; education relevant / unrelated / level not met; location preferred / remote / other; language met / below level; whole-word matching ("IT" does not match "monitoring"; one-letter interests or fields match nothing; multi-word interests still match) |
| Engine (13) | the four required cases above; unknown work authorisation never treated as satisfied ("yes" removes the flag, "no" makes it critical); no flag for roles without the requirement; empty profile fields give finite scores and "missing" flags; unknown enrolment flagged; synonyms; weights sum to 100; points sum to score; deterministic ranking; NGO role ranks first |
| AI summary (9) | template mentions band and top gap; template mentions verification; no key → template; client error → template; non-JSON → template; too short or invented numbers → template; timeout → template; valid output → AI, and no free-text profile data in the prompt; output that drops the verification caveat → template |
| OpenRouter client (6) | no key → mock mode; correct URL, bearer key, model and JSON schema sent; `OPENROUTER_MODEL` override; HTTP error → template; non-JSON content → template; valid response → AI summary |
| Summary API (4) | server recomputes the match from the profile; client-supplied results rejected (400); malformed JSON 400 and unknown opportunity 404; rate limit returns 429 after 20 requests per minute per client, other clients unaffected |
| Engine, research-led outputs (5) | sample ranking unchanged (all 12 scores pinned); eligibility reported separately from fit (verify / clear / blocked); matched and missing required skills; recognition flag never changes the score; next steps point at the profile field to update, at most 4 |
| Storage (11) | profile round-trip; empty storage; corrupt JSON ignored; schema-invalid profile ignored; shortlist toggle; clear all data; v1 shortlist migrates into the tracker at "Saved"; stage and note updates; updates for untracked ids ignored; removing an item drops its stage; corrupt tracker data dropped |
| Profile strength (3) | empty profile 0% with 8 missing sections; sample profile 88% (only work authorisation missing); 100% only when work authorisation is answered yes or no for every preferred country |
| Match filters (5) | default keeps rank order; band, country and visa-support filters combine; eligibility filter; empty result; eligibility-first sort |

## 4. End-to-end tests (Playwright) — 18 passed

Each journey runs on Desktop Chrome and on a Pixel 7 viewport against the production build in mock mode.

1. **Profile to shortlist:** load the sample profile → save → 12 ranked cards, Programme Assistant first
   with "Strong match", the "Eligibility to verify" badge and the verification notice → German Client Associate shows "Critical gap" and the
   German requirement → detail page shows the 6-row breakdown and summary → shortlist → persists after
   reload → remove → empty state.
2. **Filter by band:** "Critical gap" filter shows 3 cards.
3. **Validation:** submitting an empty form shows "Please correct 5 fields" with field messages and does not navigate.
4. **No profile:** /matches prompts the user to create a profile.
5. **Unknown opportunity:** /opportunities/does-not-exist returns 404 with a not-found page.
6. **API validation:** POST /api/summary with an invalid body returns 400.
7. **Landing:** "Try with a sample profile" saves the sample candidate and opens 12 ranked matches.
8. **Filters, steps to verify and tracking:** Germany filter shows 4 roles; adding "confirmed right to work" shows the empty state; "Reset filters" restores 12. The detail page shows "Steps to verify before applying in Canada" with a canada.ca link and "Improve your match". Shortlisting, then setting the stage to "Applied", persists after reload.
9. **How matching works:** the page lists the six weights.

## 5. Manual checks

- Visual review of every page (home, profile, matches, two detail pages, all roles, shortlist, how matching works, not found) at 360, 390, 768 and 1280 px (`node scripts/screenshots.mjs <dir>`). The script also checks that no page is wider than the viewport: no horizontal overflow at any width.
- Keyboard: visible focus ring on every control; error summary receives focus on failed submit.
- Live OpenRouter call: see the README for the current status. All failure paths are unit-tested with a fake `fetch`.
