import Link from "next/link";
import { OpportunityRow } from "../../components/OpportunityRow";
import { pageTitle, textLink } from "../../components/ui";
import { getOpportunities } from "../../lib/data";

export const metadata = { title: "All roles — Pathway" };

export default function OpportunitiesPage() {
  const opps = getOpportunities();
  const countries = new Set(opps.map((o) => o.country)).size;
  return (
    <div className="space-y-8">
      <header className="pb-2">
        <h1 className={pageTitle}>All roles</h1>
        <p className="mt-3 max-w-2xl text-muted">
          {opps.length} fictional roles across {countries} countries, with salary, visa support and relocation facts. For a
          ranking against your background, see <Link href="/matches" className={textLink}>your matches</Link>.
        </p>
      </header>
      <ul className="border-b-2 border-ink">
        {opps.map((o) => <OpportunityRow key={o.id} opp={o} />)}
      </ul>
    </div>
  );
}
