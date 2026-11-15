import Link from "next/link";
import { pageTitle, textLink } from "../../components/ui";

export const metadata = { title: "Privacy and terms — Pathway" };

const PRIVACY = [
  ["What is stored", "Your account, profile, shortlist, stages and notes."],
  ["Where", "Only in this browser’s local storage. There is no server database."],
  ["Passwords", "Stored only as a salted SHA-256 hash, never in plain text."],
  ["What leaves your browser", "Only the structured profile sent for the optional AI summary. Your free-text summary is removed first."],
  ["Sharing", "Nothing is shared with employers or third parties."],
  ["Deleting", "Use “Clear my data” on the profile page, or clear this site’s data in your browser."],
];

const TERMS = [
  "Pathway is a prototype built for a technical assessment. It is not a live service.",
  "All organisations, roles, salaries and candidates are fictional.",
  "Match scores are guidance. They are not a hiring decision.",
  "Eligibility information is for reference only. It is not legal or immigration advice. Always confirm with the official authority.",
];

export default function LegalPage() {
  return (
    <div className="space-y-14">
      <header className="border-b-2 border-ink pb-8">
        <h1 className={pageTitle}>Privacy and terms</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">Short version: your data stays in your browser.</p>
      </header>

      <section id="privacy" aria-labelledby="pv-h" className="grid scroll-mt-24 gap-8 lg:grid-cols-12">
        <h2 id="pv-h" className="text-2xl font-extrabold tracking-tight lg:col-span-4">Privacy</h2>
        <dl className="divide-y divide-line border-y-2 border-ink text-sm lg:col-span-8">
          {PRIVACY.map(([k, v]) => (
            <div key={k} className="grid gap-1 py-3 sm:grid-cols-[12rem_1fr]">
              <dt className="font-bold">{k}</dt>
              <dd className="text-muted">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="terms" aria-labelledby="tm-h" className="grid scroll-mt-24 gap-8 lg:grid-cols-12">
        <h2 id="tm-h" className="text-2xl font-extrabold tracking-tight lg:col-span-4">Terms</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm lg:col-span-8">
          {TERMS.map((t) => <li key={t}>{t}</li>)}
        </ol>
      </section>

      <p className="text-sm text-muted">
        Photos are public domain (CC0). <Link href="/how-it-works" className={textLink}>How matching works</Link>
      </p>
    </div>
  );
}
