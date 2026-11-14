export type CriterionKey = "skills" | "experience" | "education" | "location" | "language" | "interests";

export type CriterionStatus = "met" | "partial" | "unmet" | "unknown";

export interface CriterionResult {
  key: CriterionKey;
  label: string;
  weight: number;
  /** 0..1, or null when either side is missing the data needed to judge. */
  score: number | null;
  points: number;
  status: CriterionStatus;
  detail: string;
}

export type FlagKind = "critical" | "verify" | "missing";

export interface Flag {
  kind: FlagKind;
  message: string;
}

export type Band = "Strong" | "Partial" | "Weak" | "Critical gap";

export interface MatchResult {
  opportunityId: string;
  /** Integer 0..100. */
  score: number;
  band: Band;
  criteria: CriterionResult[];
  strengths: string[];
  gaps: string[];
  flags: Flag[];
}
