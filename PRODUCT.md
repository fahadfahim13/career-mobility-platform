# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **International job seekers** (primary end user). Early- to mid-career professionals who are considering a move abroad. Each one is weighing roles in several countries and needs to know two things: which roles fit them, and what could stop them taking the role (language level, enrolment rules, work authorisation). They use the product on a laptop or phone, often while comparing roles across tabs.
- **Hiring assessors** (confirmed audience for this build). A technical panel at a career-mobility company is reviewing a Full-Stack Developer assessment. Within a few minutes they need to see three things: transparent matching, responsible use of AI, and product-grade UX.

## Product Purpose
Pathway is an AI-assisted international career mobility platform. The user records a career profile and sees 12 fictional opportunities in six countries, ranked by a deterministic 0–100 fit score. Every score comes with its arithmetic, the strengths and gaps behind it, and any eligibility points that need verification. The user can open each role, shortlist it and track it. Success means the user leaves knowing which roles are worth pursuing and exactly what to check before applying.

## Positioning
Competitor research (2026-11-15, see docs/COMPETITOR_RESEARCH.md) found the following:
- **Job boards** (Relocate.me, Landing.jobs, Arc) show visa perks, but they never compare them with the user's own status.
- **Visa checkers** (gov.uk, the Make it in Germany Quick-Check, Canada) have no jobs.
- **AI match tools** (Jobright, Jobscan, Huntr, LinkedIn) give black-box percentages and blend fit with eligibility.

Pathway combines the three with two separate signals: an explainable fit score that shows its full rule trace, and an eligibility status that never claims to be a legal determination.

## Operating Context
The user creates a profile with a sample-profile shortcut, reviews the ranked matches, opens a detail page, shortlists roles and tracks them through stages. Data stays in browser localStorage, and there is no account. An optional AI summary runs through OpenRouter and falls back to a template when it is unavailable. The app is deployed on Vercel.

## Capabilities and Constraints
- Six weighted criteria: skills 30, experience 20, education 15, location 15, language 10, interests 10.
- Score bands: Strong 75 or above, Partial 50–74, Weak below 50.
- Critical gaps cap the score at 35. These are an unmet language requirement, a role for enrolled students only, and work authorisation "no".
- When work authorisation is unknown, the role carries "needs verification". It is never a legal determination.
- The AI never changes a score.
- All data is fictional, with no real employers.

## Brand Commitments
- Name: Pathway.
- Voice: professional, plain and calm. British spelling (authorisation, programme).
- No hype and no legal claims.

## Evidence on Hand
- 12 fictional opportunities in src/data/opportunities.json.
- The brief's sample candidate.
- 52 unit tests and 12 end-to-end runs.
- No real testimonials, customers, usage numbers or employer logos. **Never invent them.**

## Product Principles
1. Show the arithmetic. Every number can be traced to a rule.
2. Keep fit separate from eligibility. A high fit score never implies a right to work.
3. Hedge legal matters. Use "may", "needs verification" and links to official sources.
4. The user stays in control. Their data stays in the browser, they can correct it in place, and they make the final decision.

## Accessibility & Inclusion
- WCAG 2.2 AA.
- Usable on phones from 360px wide.
- Keyboard and screen-reader friendly.
- Status is never shown by colour alone.
