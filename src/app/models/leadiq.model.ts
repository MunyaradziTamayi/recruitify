export interface QualifiedCandidate {
  fullName: string;
  title: string;
  company: string;
  location: string;
  email: string | null;
  linkedinUrl: string | null;
  matchScore: number;
  matchedRequiredSkills: string[];
  matchedOptionalSkills: string[];
  source: unknown;
}

export interface LeadIQCandidateSearchResponse {
  candidates: QualifiedCandidate[];
}

export interface LeadIQOverrides {
  skip?: number | null;
  limit?: number | null;
  extraFilters?: Record<string, unknown> | null;
}

export interface LeadIQCandidateSearchRequest {
  keywords?: string | null;
  requiredSkills?: string[];
  optionalSkills?: string[];
  titleKeywords?: string[];
  locations?: string[];
  minYearsExperience?: number | null;
  requireAllRequiredSkills?: boolean | null;
  maxResults?: number | null;
  leadiq?: LeadIQOverrides | null;
}

