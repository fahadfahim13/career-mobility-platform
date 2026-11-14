import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { btnPrimary, btnSecondary } from "../components/ui";

const STEPS = [
  {
    title: "Build your profile",
    body: "Record your education, experience, skills, languages, preferred countries and work authorisation.",
  },
  {
    title: "Review ranked opportunities",
    body: "Each role is scored against six weighted criteria, and the points for every criterion are shown.",
  },
  {
    title: "Understand strengths and gaps",
    body: "Missing skills, language requirements and eligibility questions are stated clearly, never hidden.",
  },
  {
    title: "Shortlist the right roles",
    body: "Save the opportunities worth pursuing and return to them at any time.",
  },
];

export default function Home() {
  return (
    <div className="space-y-14 py-4 sm:py-10">
      <section className="max-w-3xl space-y-5">
        <h1 className="text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
          International career opportunities, matched to your profile and explained.
        </h1>
        <p className="max-w-2xl text-lg text-slate-600">
          Pathway compares your profile with roles across countries, ranks them using transparent rules and explains
          every result. Work authorisation is never assumed: where your status is unknown, the role is marked for
          verification.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/profile" className={btnPrimary}>
            Create your profile
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link href="/opportunities" className={btnSecondary}>Browse opportunities</Link>
        </div>
      </section>

      <section aria-labelledby="how-h" className="border-t border-line pt-10">
        <h2 id="how-h" className="text-xl font-semibold text-ink">How it works</h2>
        <ol className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold tabular-nums text-brand-700 ring-1 ring-inset ring-brand-100">
                {i + 1}
              </span>
              <div>
                <h3 className="font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
