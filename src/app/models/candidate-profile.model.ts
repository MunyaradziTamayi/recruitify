export interface ExperienceDto {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface EducationDto {
  degree: string;
  institution: string;
  graduationYear: string;
  description: string;
}

export interface CandidateProfileDto {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  experiences: ExperienceDto[];
  educations: EducationDto[];
  skills: string[];
  objectives: string | null;
  createdAt: string;
}
