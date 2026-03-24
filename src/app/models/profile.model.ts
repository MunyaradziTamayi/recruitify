export interface CandidateProfileExperience {
  jobTitle: string;
  company: string;
  startDate: string | null;
  endDate: string | null;
  description: string;
}

export interface CandidateProfileEducation {
  degree: string;
  institution: string;
  graduationYear: string | null;
  description: string;
}

export interface CandidateProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  profilePic?: string | null;
  objectives: string | null;
  lookingForJob: boolean | null;
  desiredJobTitle: string | null;
  desiredCategory: string | null;
  preferredWorkMode: string | null;
  preferredLocation: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  skills: string[];
  experiences: CandidateProfileExperience[];
  educations: CandidateProfileEducation[];
  cvFilePath?: string | null;
  createdAt: string;
}

export interface CandidateProfileRequest {
  name: string;
  email: string;
  phone: string;
  address: string;
  profilePic?: string | null;
  objectives?: string | null;
  lookingForJob?: boolean | null;
  desiredJobTitle?: string | null;
  desiredCategory?: string | null;
  preferredWorkMode?: string | null;
  preferredLocation?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  skills?: string[];
  experiences?: CandidateProfileExperience[];
  educations?: CandidateProfileEducation[];
}
