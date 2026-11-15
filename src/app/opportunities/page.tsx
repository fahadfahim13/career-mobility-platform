import Link from "next/link";
import { OpportunityRow } from "../../components/OpportunityRow";
import { HeroStats, PageHero } from "../../components/PageHero";
import { wrap } from "../../components/ui";
import london from "../../../public/images/london.webp";
import { getOpportunities } from "../../lib/data";

export const metadata = { title: "All roles — Pathway" };

export default function OpportunitiesPage() {
  const opps = getOpportunities();
  const countries = new Set(opps.map((o) => o.country)).size;
  const visa = opps.filter((o) => o.visaSupport === "offered").length;
  return (
    <>
      <PageHero
        eyebrow="Browse"
        title="All roles"
        intro={
          <>
            Salary, visa support and relocation facts for every role. For a ranking against your background, see{" "}
            <Link href="/matches" className="font-semibold text-on-field underline hover:no-underline">your matches</Link>.
          </>
        }
        photo={london}
        photoAlt="London skyline"
      >
        <HeroStats items={[{ value: opps.length, label: "Roles" }, { value: countries, label: "Countries" }, { value: visa, label: "Visa support" }]} />
      </PageHero>
      <div className={`${wrap} py-12 sm:py-16`}>
        <ul className="border-b-2 border-ink">
          {opps.map((o) => <OpportunityRow key={o.id} opp={o} />)}
        </ul>
      </div>
    </>
  );
}
