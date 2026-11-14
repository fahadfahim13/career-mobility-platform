import type { z } from "zod";
import type {
  educationLevelSchema,
  languageLevelSchema,
  languageSchema,
  opportunitySchema,
  profileSchema,
  workAuthSchema,
} from "./schemas";

export type EducationLevel = z.infer<typeof educationLevelSchema>;
export type LanguageLevel = z.infer<typeof languageLevelSchema>;
export type WorkAuth = z.infer<typeof workAuthSchema>;
export type Language = z.infer<typeof languageSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type Opportunity = z.infer<typeof opportunitySchema>;
