import Link from "next/link";
import { OpportunityRow } from "../../components/OpportunityRow";
import { getOpportunities } from "../../lib/data";

export const metadata = { title: "All opportunities — Pathway" };

export default function OpportunitiesPage() {
  const opps = getOpportunities();
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">All opportunities</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          {opps.length} fictional opportunities, listed in no particular order. See{" "}
          <Link href="/matches" className="font-medium text-brand-700 underline">Matches</Link> for a ranking based on your profile.
        </p>
      </header>
      <ul className="space-y-3">
        {opps.map((o) => <OpportunityRow key={o.id} opp={o} />)}
      </ul>
    </div>
  );
}
