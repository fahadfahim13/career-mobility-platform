// Prints the ranked matches for the brief's sample profile. Used to produce docs/TEST_EVIDENCE.md.
import { getOpportunities } from "../src/lib/data";
import { rankOpportunities } from "../src/lib/matching/engine";
import { sampleProfile } from "../src/data/sampleProfile";

const rows = rankOpportunities(sampleProfile, getOpportunities());
console.log("| Rank | Opportunity | Score | Band | Flags |");
console.log("|---|---|---|---|---|");
rows.forEach((r, i) => {
  const flags = r.flags.map((f) => f.kind).join(", ") || "—";
  console.log(`| ${i + 1} | ${r.opportunityId} | ${r.score} | ${r.band} | ${flags} |`);
});
