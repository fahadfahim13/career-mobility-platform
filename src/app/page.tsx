import { ArrowRight, Briefcase, Building2, Check, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { BandBadge, EligibilityTag, ScoreFigure } from "../components/badges";
import { opportunityMeta } from "../components/MatchCard";
import { SampleProfileButton } from "../components/SampleProfileButton";
import { ScoreStrip } from "../components/ScoreStrip";
import { btnOnField, btnOnFieldOutline, btnPrimary, btnSecondary } from "../components/ui";
import { getCountryGuide } from "../data/countryGuides";
import { sampleProfile } from "../data/sampleProfile";
import { getOpportunities, getOpportunity } from "../lib/data";
import { refCode } from "../lib/format";
import { CRITICAL_CAP, matchOne } from "../lib/matching/engine";
import { WEIGHTS, LABELS } from "../lib/matching/criteria";

const STEPS = [
  { title: "Build a profile", body: "Skills, experience, languages and target countries. About five minutes." },
  { title: "Get scored matches", body: "Every role is scored 0–100 on six weighted criteria, with the working shown." },
  { title: "Verify and apply", body: "Check the right to work with official sources, then track each application." },
];

const AUDIENCES = [
  {
    Icon: Briefcase,
    title: "For job seekers",
    points: ["See which roles abroad you qualify for", "Know why you fit, and what to improve", "Get official steps to verify your right to work"],
    cta: "Find roles",
    href: "/signup?role=seeker",
    primary: true,
  },
  {
    Icon: Building2,
    title: "For employers",
    points: ["See candidates ranked by fit for each role", "See who has stated the right to work", "Review the score behind every candidate"],
    cta: "Find candidates",
    href: "/signup?role=employer",
    primary: false,
  },
];

const COMPARE = [
  ["Match score", "A number with no reasons", "Every point explained"],
  ["Right to work", "A “visa sponsorship” badge", "Shown per person, per country"],
  ["Gaps", "Missing keywords", "Each gap with a next step"],
  ["Employers", "Applicants sorted by keywords", "Candidates ranked by fit, eligibility shown"],
];

const FAQ = [
  { q: "Is the score a hiring decision?", a: "No. It shows how a profile compares with a role’s stated requirements. People make the decision." },
  {
    q: "Does Pathway decide who can work in a country?",
    a: "No. Right to work is self-stated. When it is unknown, the match is marked “to verify” with links to the official authority.",
  },
  { q: "What does the AI do?", a: "It writes a two-sentence summary of the result. It cannot change a score. If it is unavailable, a rules-based summary is shown." },
  { q: "Where is my data stored?", a: "In this prototype, only in your browser. Nothing is sent to a server or shared with employers." },
  { q: "Are these real jobs and candidates?", a: "No. All organisations, roles, salaries and candidates are fictional." },
];

export default function Home() {
  const demoOpp = getOpportunity("operations-coordinator-singapore")!;
  const demo = matchOne(sampleProfile, demoOpp);
  const countries = [...new Set(getOpportunities().map((o) => o.country))];

  return (
    <div className="-mt-8 space-y-20 sm:-mt-12 sm:space-y-28">
      {/* Hero: the navy field and a live score strip computed by the engine. */}
      <section className="-mx-4 grid grid-cols-1 lg:mx-0 lg:grid-cols-12" aria-labelledby="hero-h">
        <div className="on-field bg-field px-5 py-12 text-on-field sm:px-10 sm:py-16 lg:col-span-7">
          <h1 id="hero-h" className="text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-7xl">
            Find work abroad.
            <br />
            Hire from abroad.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-on-field-muted">
            Every match gets a clear score. Right to work is shown separately, never assumed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup?role=seeker" className={btnOnField}>
              I’m looking for work <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/signup?role=employer" className={btnOnFieldOutline}>I’m hiring</Link>
          </div>
          <div className="mt-6 text-sm">
            <SampleProfileButton className="inline-flex min-h-10 items-center gap-1.5 font-semibold text-on-field underline underline-offset-4 hover:no-underline" />
          </div>
        </div>

        <div className="border-x-2 border-b-2 border-ink bg-white px-5 py-8 sm:px-8 lg:col-span-5 lg:border-l-0 lg:border-t-2 lg:py-10">
          <div className="border-t-2 border-ink pt-4">
            <h2 className="text-xl font-bold leading-snug tracking-tight">{demoOpp.title}</h2>
            <p className="text-sm text-muted">{opportunityMeta(demoOpp)}</p>
            <p className="mt-2 inline-block border-t border-ink pt-0.5 text-xs font-bold tracking-wider">Ref. {refCode(demoOpp)}</p>
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <ScoreFigure score={demo.score} size="lg" />
            <div className="flex flex-col items-end gap-1">
              <BandBadge band={demo.band} />
              <EligibilityTag eligibility={demo.eligibility} />
            </div>
          </div>
          <div className="mt-6">
            <ScoreStrip result={demo} variant="full" animate />
          </div>
          <ul className="mt-5 space-y-1.5 text-sm">
            {demo.strengths.slice(0, 2).map((s) => (
              <li key={s} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-met" aria-hidden />{s}</li>
            ))}
            {demo.gaps.slice(0, 1).map((g) => (
              <li key={g} className="flex gap-2"><Minus className="mt-0.5 size-4 shrink-0 text-blocked" aria-hidden />{g}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted">Live example, calculated by the matching engine.</p>
        </div>
      </section>

      <section aria-labelledby="problem-h" className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="problem-h" className="text-3xl font-extrabold tracking-tight sm:text-5xl">The right people for the right roles, across borders.</h2>
          <p className="mt-4 text-muted">
            Candidates can’t tell which roles abroad they qualify for. Employers can’t tell which applicants can work there.
            Pathway shows both.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-px bg-ink sm:grid-cols-2 lg:col-span-7">
          {AUDIENCES.map((a) => (
            <div key={a.title} className="flex flex-col bg-paper p-6">
              <a.Icon className="size-6 text-field" aria-hidden />
              <h3 className="mt-3 text-xl font-bold">{a.title}</h3>
              <ul className="mt-3 flex-1 space-y-2 text-sm">
                {a.points.map((p) => (
                  <li key={p} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-field" aria-hidden />{p}</li>
                ))}
              </ul>
              <Link href={a.href} className={`${a.primary ? btnPrimary : btnSecondary} mt-6 self-start`}>
                {a.cta} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="steps-h">
        <h2 id="steps-h" className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">How it works</h2>
        <ol className="mt-10 border-t-2 border-ink">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid gap-4 border-b border-line py-8 md:grid-cols-12 md:items-center">
              <span className="text-7xl font-extrabold leading-none tracking-tighter md:col-span-1" aria-hidden>{i + 1}</span>
              <div className="md:col-span-5">
                <h3 className="text-2xl font-bold tracking-tight">{s.title}</h3>
                <p className="mt-2 max-w-lg text-muted">{s.body}</p>
              </div>
              <div className="md:col-span-5 md:col-start-8" aria-hidden>
                {i === 0 && (
                  <div className="space-y-2 text-sm">
                    {[["Germany", "Not sure"], ["Canada", "Not sure"], ["Singapore", "Not sure"]].map(([c, a]) => (
                      <div key={c} className="flex items-center justify-between border border-line bg-white px-3 py-2 font-semibold">
                        {c}
                        <span className="border border-slate-300 px-2 py-0.5 font-normal">{a}</span>
                      </div>
                    ))}
                  </div>
                )}
                {i === 1 && <ScoreStrip result={demo} variant="full" />}
                {i === 2 && (
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold">
                    <span className="bg-ink px-2.5 py-1 text-paper">Saved</span>
                    <ArrowRight className="size-4" />
                    <span className="border border-ink px-2.5 py-1">Applied</span>
                    <ArrowRight className="size-4" />
                    <span className="border border-ink px-2.5 py-1">Interviewing</span>
                    <ArrowRight className="size-4" />
                    <span className="border border-ink px-2.5 py-1">Offer</span>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="signals-h" className="on-field -mx-4 grid gap-10 bg-field px-5 py-12 text-on-field sm:mx-0 sm:px-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="signals-h" className="text-3xl font-extrabold tracking-tight sm:text-5xl">Two signals, never blended</h2>
          <p className="mt-4 text-on-field-muted">A great fit you can’t legally take is not a great match. So we show both.</p>
        </div>
        <div className="grid gap-px bg-on-field-muted/40 sm:grid-cols-2 lg:col-span-8">
          <div className="bg-field p-6 sm:pl-0">
            <h3 className="text-xl font-bold">Fit score, 0 to 100</h3>
            <p className="mt-2 text-sm text-on-field-muted">Six weighted criteria.</p>
            <dl className="mt-5 divide-y divide-on-field-muted/40 text-sm">
              {Object.entries(WEIGHTS).map(([k, w]) => (
                <div key={k} className="flex justify-between py-1.5">
                  <dt>{LABELS[k as keyof typeof LABELS]}</dt>
                  <dd className="font-bold tabular-nums">{w}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm">An unmet hard requirement caps the score at <strong>{CRITICAL_CAP}</strong>.</p>
          </div>
          <div className="bg-field p-6">
            <h3 className="text-xl font-bold">Right to work</h3>
            <p className="mt-2 text-sm text-on-field-muted">Self-stated, per country.</p>
            <ul className="mt-5 space-y-4 text-sm">
              <li><EligibilityTag eligibility="clear" /><p className="mt-1">Stated by the candidate.</p></li>
              <li><EligibilityTag eligibility="verify" /><p className="mt-1">Unknown. Official steps provided.</p></li>
              <li><EligibilityTag eligibility="blocked" /><p className="mt-1">Not held. Score capped.</p></li>
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="compare-h">
        <h2 id="compare-h" className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">Why Pathway</h2>
        <p className="mt-4 max-w-2xl text-muted">
          Based on a review of 23 job boards, match tools and visa checkers.{" "}
          <a href="https://github.com/fahadfahim13/career-mobility-platform/blob/main/docs/COMPETITOR_RESEARCH.md" className="font-semibold text-field underline">
            Read the research
          </a>
        </p>
        <dl className="mt-8 space-y-6 sm:hidden">
          {COMPARE.map(([topic, them, us]) => (
            <div key={topic} className="border-t-2 border-ink pt-3">
              <dt className="font-bold">{topic}</dt>
              <dd className="mt-1 text-sm text-muted">Typical: {them}</dd>
              <dd className="mt-2 bg-field-tint px-3 py-2 text-sm font-semibold">Pathway: {us}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 hidden sm:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-ink">
              <tr>
                <th scope="col" className="w-1/5 py-3 pr-4 font-bold"><span className="sr-only">Topic</span></th>
                <th scope="col" className="py-3 pr-4 font-bold text-muted">Typical tools</th>
                <th scope="col" className="bg-field px-4 py-3 font-bold text-on-field">Pathway</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([topic, them, us]) => (
                <tr key={topic} className="border-b border-line align-top">
                  <th scope="row" className="py-4 pr-4 font-bold">{topic}</th>
                  <td className="py-4 pr-4 text-muted">{them}</td>
                  <td className="bg-field-tint px-4 py-4 font-semibold">{us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="sources-h" className="grid gap-8 border-t-2 border-ink pt-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="sources-h" className="text-3xl font-extrabold tracking-tight">Official sources on every role</h2>
          <p className="mt-3 text-muted">Links to each country’s government authority. Reference only, not legal advice.</p>
        </div>
        <ul className="grid gap-px bg-line sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
          {countries.map((c) => {
            const g = getCountryGuide(c);
            return (
              <li key={c} className="bg-paper p-4">
                <p className="font-bold">{c}</p>
                {g.sources.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm text-field underline">
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="faq-h" className="grid gap-8 lg:grid-cols-12">
        <h2 id="faq-h" className="text-3xl font-extrabold tracking-tight lg:col-span-4">Questions</h2>
        <div className="divide-y divide-line border-y-2 border-ink lg:col-span-8">
          {FAQ.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-14 items-center justify-between gap-4 py-3 text-lg font-bold">
                {f.q}
                <Plus className="size-5 shrink-0 text-field transition-transform duration-200 group-open:rotate-45" aria-hidden />
              </summary>
              <p className="pb-5 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="on-field -mx-4 bg-field px-5 py-12 text-on-field sm:mx-0 sm:px-10" aria-labelledby="cta-h">
        <h2 id="cta-h" className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">Start matching in minutes.</h2>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/signup?role=seeker" className={btnOnField}>
            I’m looking for work <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/signup?role=employer" className={btnOnFieldOutline}>I’m hiring</Link>
        </div>
      </section>
    </div>
  );
}
