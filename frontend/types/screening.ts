export type RiskLabel = "no_match" | "clear" | "medium" | "high";

export interface ArticleMetadataDetails {
  title?: string | null;
  published_date?: string | null;
  section?: string | null;
  source_domain?: string | null;
  is_recent?: boolean | null;
  reasoning?: string;
}

export interface PeopleDetails {
  main_person?: string | null;
  other_people?: string[];
  author_names?: string[];
  reasoning?: string;
}

export interface ContextDetails {
  locations?: string[];
  organisations?: string[];
  roles_or_occupations?: string[];
  subject_context_consistent?: boolean | null;
  confidence?: number;
  reasoning?: string;
}

export interface NameMatchDetails {
  subject_name_normalized: string;
  article_primary_names: string[];
  is_name_potential_match: boolean;
  confidence: number;
  reasoning: string;
}

export interface DobAgeDetails {
  dob_in_article?: string | null;
  age_in_article?: number | null;
  age_phrase?: string | null;
  is_dob_or_age_consistent?: boolean | null;
  confidence: number;
  reasoning: string;
}

export interface SentimentDetails {
  overall_sentiment: string;
  is_adverse_media: boolean;
  adverse_categories: string[];
  key_positives: string[];
  key_negatives: string[];
  reasoning: string;
}

export interface ScreeningDetails {
  metadata: ArticleMetadataDetails;
  people: PeopleDetails;
  context: ContextDetails;
  name_match: NameMatchDetails;
  dob_age: DobAgeDetails;
  sentiment: SentimentDetails;
  article_text?: string;
}

export interface ScreeningResult {
  is_subject_match: boolean;
  match_confidence: number;
  overall_risk_label: RiskLabel;
  decision: string;
  human_readable_summary: string;
  audit_notes: string;
  details: ScreeningDetails;
}

export interface TestCaseInput {
  title: string;
  summary: string;
  subject_names: string[];
  contains_dob?: boolean;
  dob_value?: string | null;
  contains_age_phrase?: boolean;
  sentiment?: string;
  adverse_media_classification?: string;
  edge_case_reason?: string;
  article_link: string;
}

export interface TestCaseRecord {
  title: string;
  input: TestCaseInput;
  output: ScreeningResult;
  subject_slug: string;
  source_file: string;
  record_index: number;
}
