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

/** Right-to-work status only. Kept apart from the fit score so a high score never implies eligibility. */
export type Eligibility = "clear" | "verify" | "blocked";

/** Profile fields a next step can send the user back to (anchor ids on the profile form). */
export type ProfileField =
  | "skills"
  | "yearsExperience"
  | "education"
  | "preferredCountries"
  | "languages"
  | "interests"
  | "enrolledStudent"
  | "workAuthorisation";

export interface NextStep {
  text: string;
  field: ProfileField;
}

export interface MatchResult {
  opportunityId: string;
  /** Integer 0..100. */
  score: number;
  band: Band;
  criteria: CriterionResult[];
  strengths: string[];
  gaps: string[];
  flags: Flag[];
  eligibility: Eligibility;
  skillCoverage: { matched: string[]; missing: string[] };
  nextSteps: NextStep[];
}
