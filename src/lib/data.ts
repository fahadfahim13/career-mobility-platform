import raw from "../data/opportunities.json";
import { opportunitiesSchema } from "./schemas";
import type { Opportunity } from "./types";

// Validated once at module load: bad sample data fails loudly at build/test time, not in the UI.
const opportunities: Opportunity[] = opportunitiesSchema.parse(raw);
const byId = new Map(opportunities.map((o) => [o.id, o]));

export function getOpportunities(): Opportunity[] {
  return opportunities;
}

export function getOpportunity(id: string): Opportunity | undefined {
  return byId.get(id);
}
