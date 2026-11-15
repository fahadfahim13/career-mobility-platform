import { ArrowRight, Check, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BandBadge, EligibilityTag, ScoreFigure } from "../components/badges";
import { CompareMatrix, EligibilityFlow, TwoSidedFlow, WeightsDonut } from "../components/diagrams";
import { SampleProfileButton } from "../components/SampleProfileButton";
import { ScoreStrip } from "../components/ScoreStrip";
import { CtaBand } from "../components/PageHero";
import { btnOnField, btnOnFieldOutline, btnPrimary, btnSecondary, wrap } from "../components/ui";
import { sampleProfile } from "../data/sampleProfile";
import { getOpportunities, getOpportunity } from "../lib/data";
import { matchOne } from "../lib/matching/engine";
import dubai from "../../public/images/dubai.webp";
import hero from "../../public/images/hero.webp";
import frankfurt from "../../public/images/frankfurt.webp";
import london from "../../public/images/london.webp";
import rotterdam from "../../public/images/rotterdam.webp";
import seeker from "../../public/images/seeker.webp";
import singapore from "../../public/images/singapore.webp";
import team from "../../public/images/team.webp";
import toronto from "../../public/images/toronto.webp";

const AUDIENCES = [
  {
    photo: seeker,
    alt: "A person applying for jobs on a laptop",
    title: "For job seekers",
    points: ["Roles abroad you qualify for", "Why you fit, and what to improve", "Official steps to verify right to work"],
    cta: "Find roles",
    href: "/signup?role=seeker",
    primary: true,
  },
  {
    photo: team,
    alt: "A hiring team reviewing candidates around a table",
    title: "For employers",
    points: ["Candidates ranked by fit for each role", "Right to work shown for every candidate", "The score behind every ranking"],
    cta: "Find candidates",
    href: "/signup?role=employer",
    primary: false,
  },
];

const COMPARE: [string, string, string][] = [
  ["Explained score", "A number with no reasons", "Every point explained"],
  ["Right to work", "A “visa sponsorship” badge", "Per person, per country"],
  ["Gaps with next steps", "Missing keywords", "Each gap has a next step"],
  ["Two-sided", "Applicants sorted by keywords", "Candidates ranked by fit"],
];

const CITIES = [
  { img: frankfurt, country: "Germany", city: "Frankfurt" },
  { img: toronto, country: "Canada", city: "Toronto" },
  { img: london, country: "United Kingdom", city: "London" },
  { img: singapore, country: "Singapore", city: "Singapore" },
  { img: dubai, country: "United Arab Emirates", city: "Dubai" },
  { img: rotterdam, country: "Netherlands", city: "Rotterdam" },
];

/** Mosaic: a two-by-three grid on desktop, two columns on phones. */
const TILE = Array(6).fill("aspect-[4/3] md:col-span-2");

const FAQ = [
  { q: "Is the score a hiring decision?", a: "No. It compares a profile with a role’s stated requirements. People make the decision." },
  { q: "Does Pathway decide who can work in a country?", a: "No. Right to work is self-stated. Unknown answers are marked “to verify”, with official links." },
  { q: "What does the AI do?", a: "It writes a two-sentence summary. It cannot change a score. Without it, a rules-based summary is shown." },
  { q: "Where is my data stored?", a: "In this prototype, only in your browser. Nothing is sent to a server or shared with employers." },
  { q: "Are these real jobs and candidates?", a: "No. All organisations, roles, salaries and candidates are fictional." },
];

export default function Home() {
  const demoOpp = getOpportunity("operations-coordinator-singapore")!;
  const demo = matchOne(sampleProfile, demoOpp);
  const roles = getOpportunities();
  const countries = [...new Set(roles.map((o) => o.country))];

  return (
    <>
      {/* Hero: statement on the navy field, a real photo, and a live match card computed by the engine. */}
      <section className="grid grid-cols-1 lg:grid-cols-2" aria-labelledby="hero-h">
        <div className="on-field flex flex-col justify-center bg-field px-5 py-14 text-on-field sm:px-10 sm:py-20 lg:pr-12 lg:pl-[max(1rem,calc((100vw-72rem)/2+1rem))]">
          <h1 id="hero-h" className="text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-7xl">
            Find work abroad.
            <br />
            Hire from abroad.
          </h1>
          <p className="mt-6 max-w-md text-lg text-on-field-muted">
            A clear fit score for every match. Right to work shown separately, never assumed.
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

        <div className="relative min-h-[26rem] overflow-hidden bg-field-deep sm:min-h-[32rem]">
          <Image src={hero} alt="A candidate reviewing roles abroad on a laptop" fill priority placeholder="blur" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-x-4 bottom-4 border border-ink bg-white p-5 shadow-[0_12px_32px_-12px_rgba(17,29,51,0.45)] sm:inset-x-auto sm:right-8 sm:bottom-8 sm:w-[22rem]">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Live example</p>
            <h2 className="mt-1 text-lg font-bold leading-snug tracking-tight">{demoOpp.title}</h2>
            <p className="text-sm text-muted">{demoOpp.organisation} · {demoOpp.city}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <ScoreFigure score={demo.score} size="lg" />
              <div className="flex flex-col items-end gap-1">
                <BandBadge band={demo.band} />
                <EligibilityTag eligibility={demo.eligibility} />
              </div>
            </div>
            <div className="mt-4">
              <ScoreStrip result={demo} animate />
            </div>
          </div>
        </div>
      </section>

      <div className={`${wrap} space-y-20 py-20 sm:space-y-28 sm:py-28`}>
      {/* The problem, drawn as a flow rather than written as a paragraph. */}
      <section aria-labelledby="problem-h">
        <h2 id="problem-h" className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">One match. Both sides see the same facts.</h2>
        <div className="mt-10">
          <TwoSidedFlow />
        </div>
      </section>

      <section aria-labelledby="aud-h">
        <h2 id="aud-h" className="sr-only">Who Pathway is for</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {AUDIENCES.map((a) => (
            <article key={a.title} className="flex flex-col border border-line bg-white">
              <div className="relative aspect-[16/9]">
                <Image src={a.photo} alt={a.alt} fill placeholder="blur" sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl font-bold tracking-tight">{a.title}</h3>
                <ul className="mt-3 flex-1 space-y-2 text-sm">
                  {a.points.map((p) => (
                    <li key={p} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-field" aria-hidden />{p}</li>
                  ))}
                </ul>
                <Link href={a.href} className={`${a.primary ? btnPrimary : btnSecondary} mt-6 self-start`}>
                  {a.cta} <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How it works: three steps, each shown as the screen it produces. */}
      <section aria-labelledby="steps-h">
        <h2 id="steps-h" className="text-3xl font-extrabold tracking-tight sm:text-5xl">How it works</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          <li className="flex flex-col border-t-4 border-field bg-white p-5">
            <p className="text-sm font-bold text-muted">Step 1</p>
            <h3 className="text-xl font-bold">Build a profile</h3>
            <div className="mt-5 flex-1 space-y-2 text-sm" aria-hidden>
              {[["Skills", "Excel, SQL, Logistics"], ["Experience", "4 years"], ["Singapore", "Not sure"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border border-line px-3 py-2">
                  <span className="font-semibold">{k}</span>
                  <span className="text-muted">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">About five minutes.</p>
          </li>
          <li className="flex flex-col border-t-4 border-field bg-white p-5">
            <p className="text-sm font-bold text-muted">Step 2</p>
            <h3 className="text-xl font-bold">Get scored matches</h3>
            <div className="mt-5 flex flex-1 flex-col justify-center gap-3" aria-hidden>
              <div className="flex items-end justify-between">
                <ScoreFigure score={demo.score} size="lg" />
                <BandBadge band={demo.band} />
              </div>
              <ScoreStrip result={demo} variant="full" />
            </div>
            <p className="mt-4 text-sm text-muted">Six weighted criteria, working shown.</p>
          </li>
          <li className="flex flex-col border-t-4 border-field bg-white p-5">
            <p className="text-sm font-bold text-muted">Step 3</p>
            <h3 className="text-xl font-bold">Verify and apply</h3>
            <ol className="mt-5 flex-1 space-y-2 text-sm font-semibold" aria-hidden>
              {["Saved", "Applied", "Interviewing", "Offer"].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className={`grid size-7 shrink-0 place-items-center text-xs ${i === 0 ? "bg-field text-on-field" : "border border-field text-field"}`}>{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-muted">Official links for each country.</p>
          </li>
        </ol>
      </section>

      {/* Two signals: a chart of the real weights and the eligibility decision diagram. */}
      </div>

      <section aria-labelledby="signals-h" className="on-field bg-field text-on-field">
        <div className={`${wrap} py-16 sm:py-24`}>
        <h2 id="signals-h" className="text-3xl font-extrabold tracking-tight sm:text-5xl">Two signals, never blended</h2>
        <p className="mt-3 max-w-xl text-on-field-muted">A great fit you can’t legally take is not a great match.</p>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="mb-5 text-xl font-bold">1. Fit score</h3>
            <WeightsDonut onField />
          </div>
          <div>
            <h3 className="mb-5 text-xl font-bold">2. Right to work</h3>
            <EligibilityFlow onField />
          </div>
        </div>
        </div>
      </section>

      <div className={`${wrap} space-y-20 py-20 sm:space-y-28 sm:py-28`}>

      <section aria-labelledby="compare-h" className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="compare-h" className="text-3xl font-extrabold tracking-tight sm:text-5xl">Why Pathway</h2>
          <p className="mt-4 text-muted">From a review of 23 job boards, match tools and visa checkers.</p>
          <a href="https://github.com/fahadfahim13/career-mobility-platform/blob/main/docs/COMPETITOR_RESEARCH.md" className="mt-3 inline-block font-semibold text-field underline">
            Read the research
          </a>
        </div>
        <div className="lg:col-span-8">
          <CompareMatrix rows={COMPARE} />
        </div>
      </section>

      {/* Countries as a photo mosaic, with official sources underneath. */}
      <section aria-labelledby="sources-h">
        <h2 id="sources-h" className="text-3xl font-extrabold tracking-tight sm:text-5xl">
          {roles.length} roles in {countries.length} countries
        </h2>
        <ul className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-6">
          {CITIES.map((c, i) => {
            const n = roles.filter((r) => r.country === c.country).length;
            return (
              <li key={c.city} className={`relative overflow-hidden bg-field-deep ${TILE[i]}`}>
                <Link href={`/opportunities?country=${encodeURIComponent(c.country)}`} className="group absolute inset-0 block focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-white">
                  <Image src={c.img} alt={`${c.city} skyline`} fill placeholder="blur" sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none" />
                  <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10 text-white">
                    <span>
                      <span className="block font-bold">{c.country}</span>
                      <span className="block text-xs opacity-80">{n} {n === 1 ? "role" : "roles"}</span>
                    </span>
                    <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
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

      </div>

      <CtaBand title="Start matching in minutes." photo={team}>
        <Link href="/signup?role=seeker" className={btnOnField}>
          I’m looking for work <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href="/signup?role=employer" className={btnOnFieldOutline}>I’m hiring</Link>
      </CtaBand>
    </>
  );
}
