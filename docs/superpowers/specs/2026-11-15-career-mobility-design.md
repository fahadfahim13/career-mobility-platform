# Career Mobility MVP — Design

Source brief: `C:\Users\Lenovo\Downloads\Career_Mobility_Platform_Technical_Assessment.pdf`
Deadline: Mon 2026-11-16 ~23:43 (72 h from email received Fri 2026-11-13 23:43).

## Decisions (locked with Fahim 2026-11-15)
- Stack: Next.js (App Router, TypeScript) + Tailwind, deployed on Vercel.
- Matching: deterministic weighted rules decide score, gaps and flags. AI (Claude) only rewrites
  a short natural-language summary from the rule output. No key / timeout / bad output → template summary.
- No auth, no DB. Opportunities = versioned JSON file validated by zod at load. Profile + shortlist =
  browser localStorage (personal data never leaves the device except the optional AI call).

## User journey
1. `/profile` — form (education level + field, years experience + domain, skills, languages + level,
   preferred countries, interests, work authorisation per country: yes / no / unknown, currently enrolled
   student: yes/no). "Load sample profile" button fills the brief's sample candidate.
2. `/matches` — ranked list: score 0–100, band, top strengths, top gaps, flags, shortlist toggle.
3. `/opportunities/[id]` — full requirements + per-criterion breakdown table + flags + AI/template summary.
4. `/shortlist` — saved opportunities, remove action. `/opportunities` — all roles, unranked.

## Matching model (pure function, no I/O)
Criterion weights (sum 100): skills 30, experience 20, education 15, location 15, language 10, interests 10.
Each criterion returns `{ score 0..1 | null, status: met|partial|unmet|unknown, detail: string }`.
`null` = data missing on either side → scores 0.5 of weight and adds a "missing info" note (never silently 1).

- Skills: normalized + synonym map; score = matched required / required count.
- Experience: within [min,max] → 1; above max → 0.8 (overqualified note); short by ≤1 yr → 0.5; else 0.
- Education: level rank none<secondary<diploma<bachelor<master<phd. Level met + field relevant → 1;
  level met, field not listed → 0.6; level not met → 0.
- Location: opportunity country in preferred → 1; remote-eligible → 0.7; else 0.
- Language: levels basic<conversational<professional<native; score = fraction of required languages met.
- Interests: any interest keyword overlaps role category/tags → 1, else 0.

Flags (separate from score):
- `critical` (hard constraint unmet as stated): required language below level; enrolled-student-only role
  and user not enrolled; work authorisation explicitly "no" where `localWorkAuthRequired`. Critical caps
  score at 35 and band = "Critical gap".
- `verify` (never a legal determination): work authorisation "unknown" for a role needing local
  authorisation → "Work authorisation not confirmed — needs verification". No score penalty.
Bands: ≥75 Strong, 50–74 Partial, <50 Weak; critical overrides. Sort: score desc, then id.

## AI summary
POST `/api/summary` with `{ opportunityId, result }` (rule output + profile skills/interests only — no
name/contact). Server calls Claude Haiku (`claude-haiku-5-5`) if `ANTHROPIC_API_KEY` set, 6 s timeout,
JSON output validated by zod; summary must not mention any score or eligibility claim not in the input.
Any failure → template summary built from the rule result; response includes `source: "ai"|"template"`.

## Sample data
12 opportunities across Germany, Canada, Singapore, UK, Netherlands, UAE, remote. Must include the brief's
three examples. Expected outcomes for the sample profile:
- Programme Assistant – International NGO (Canada) → Strong.
- Operations Coordinator (Singapore) → Strong/Partial.
- Junior Data Analyst (Netherlands, needs SQL/Python) → Partial/Weak.
- Business Analyst Intern (Germany, enrolled student + local work eligibility) → Critical gap.
- German-speaking Client Associate (Germany, professional German) → Critical gap.
- Software Engineer (UK, 4+ yrs, CS degree) → Weak.
