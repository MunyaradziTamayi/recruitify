import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CvUploadComponent } from '../cv-upload/cv-upload.component';
import { ApplicationService } from '../../services/application.service';
import { InterviewService } from '../../services/interview.service';
import { forkJoin } from 'rxjs';
import { CandidateProfile, CandidateProfileEducation, CandidateProfileExperience, CandidateProfileRequest } from '../../models/profile.model';
import { ProfileService } from '../../services/profile.service';

interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  year: string;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  location: string;
  imageUrl: string;
  bio: string;
  phone: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, CvUploadComponent],
  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.css',
})
export class EmployeeProfile implements OnInit {
  user: UserProfile = {
    name: '',
    email: '',
    role: 'Senior Product Designer',
    location: 'San Francisco, CA',
    imageUrl: '',
    bio: 'Passionate Product Designer with 5+ years of experience in creating user-centered designs for web and mobile applications. Expertise in UX research, wireframing, and visual design.',
    phone: '+1 (555) 123-4567',
    skills: ['UI DESIGN', 'UX RESEARCH', 'FIGMA', 'ADOBE XD', 'HTML/CSS', 'PROTOTYPING', 'USER TESTING'],
    experience: [
      {
        company: 'Creative Solutions',
        role: 'Senior Product Designer',
        duration: '2020 - Present',
        description: 'Led the design of multiple B2B and B2C products, improving user engagement by 40%.'
      },
      {
        company: 'Design Hub',
        role: 'UX Designer',
        duration: '2017 - 2020',
        description: 'Collaborated with cross-functional teams to deliver high-quality design solutions.'
      }
    ],
    education: [
      {
        school: 'University of Arts',
        degree: 'Bachelor of Design',
        year: '2013 - 2017'
      }
    ]
  };

  profileStrength: number = 0;
  applicationsCount = 0;
  interviewsCount = 0;
  candidateId: number | null = null;
  profile: CandidateProfile | null = null;

  editMode = false;
  saveInFlight = false;
  saveError: string | null = null;
  editModel: CandidateProfileRequest = {
    name: '',
    email: '',
    phone: '',
    address: '',
    profilePic: null,
    lookingForJob: null,
    skills: [],
    experiences: [],
    educations: [],
  };
  skillsText = '';
  autoEditRequested = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private interviewService: InterviewService,
    private profileService: ProfileService,
  ) { }

  ngOnInit(): void {
    this.autoEditRequested = this.route.snapshot.queryParamMap.get('edit') === 'true';
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (storedUser) {
      const googleUser = JSON.parse(storedUser);
      this.user.name = googleUser.name || 'User';
      this.user.email = googleUser.email || '';
      this.user.imageUrl = googleUser.picture || 'https://i.pravatar.cc/150?img=1';

      const parsedCandidateId = Number(googleUser.profileId);
      this.candidateId = Number.isNaN(parsedCandidateId) ? null : parsedCandidateId;
      if (this.candidateId) {
        this.loadCounts(this.candidateId);
        this.loadProfile(this.candidateId);
      }

      this.loadExtractedProfile();
      this.calculateProfileStrength();
    } else {
      this.router.navigate(['employee-login']);
    }
  }

  private loadCounts(candidateId: number): void {
    forkJoin({
      applications: this.applicationService.getApplications({ candidateId }),
      interviews: this.interviewService.getInterviews({ candidateId })
    }).subscribe({
      next: (data) => {
        this.applicationsCount = data.applications.length;
        this.interviewsCount = data.interviews.filter(i => i.status === 'Upcoming').length;
      }
    });
  }

  loadExtractedProfile() {
    const extractedData = sessionStorage.getItem('extractedProfile');
    if (extractedData) {
      const profile = JSON.parse(extractedData);

      if (profile.phone) this.user.phone = profile.phone;
      if (profile.address) this.user.location = profile.address;
      if (profile.objectives) this.user.bio = profile.objectives;

      if (profile.skills && profile.skills.length > 0) {
        this.user.skills = profile.skills.map((s: string) => s.toUpperCase());
      }

      if (profile.experiences && profile.experiences.length > 0) {
        this.user.experience = profile.experiences.map((exp: any) => ({
          company: exp.company,
          role: exp.jobTitle,
          duration: this.formatExperienceDuration(exp.startDate ?? null, exp.endDate ?? null),
          description: exp.description
        }));

        if (this.user.experience.length > 0) {
          this.user.role = this.user.experience[0].role;
        }
      }

      if (profile.educations && profile.educations.length > 0) {
        this.user.education = profile.educations.map((edu: any) => ({
          school: edu.institution,
          degree: edu.degree,
          year: this.formatEducationYear(edu.graduationYear ?? null)
        }));
      }
    }
  }

  refreshProfile() {
    this.loadExtractedProfile();
    this.calculateProfileStrength();
  }

  private loadProfile(candidateId: number): void {
    this.profileService.getProfileById(candidateId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.applyProfileToView(profile);
        this.calculateProfileStrength();
        if (this.autoEditRequested) {
          this.enterEditMode();
          this.autoEditRequested = false;
        }
      },
      error: () => {
        // Keep existing view if backend fetch fails.
      },
    });
  }

  private applyProfileToView(profile: CandidateProfile): void {
    this.user.name = profile.name || this.user.name;
    this.user.email = profile.email || this.user.email;
    this.user.phone = profile.phone || this.user.phone;
    this.user.location = profile.address || profile.preferredLocation || this.user.location;
    this.user.bio = profile.objectives || this.user.bio;
    this.user.role = profile.desiredJobTitle || this.user.role;
    if (profile.profilePic) {
      this.user.imageUrl = profile.profilePic;
    }
    this.user.skills = (profile.skills && profile.skills.length)
      ? profile.skills.map((s) => s.toUpperCase())
      : this.user.skills;

    if (profile.experiences?.length) {
      this.user.experience = profile.experiences.map((exp) => ({
        company: exp.company,
        role: exp.jobTitle,
        duration: this.formatExperienceDuration(exp.startDate, exp.endDate),
        description: exp.description,
      }));
    }

    if (profile.educations?.length) {
      this.user.education = profile.educations.map((edu) => ({
        school: edu.institution,
        degree: edu.degree,
        year: this.formatEducationYear(edu.graduationYear),
      }));
    }
  }

  enterEditMode(): void {
    if (!this.profile) return;
    this.editMode = true;
    this.saveError = null;
    this.editModel = this.buildEditModel(this.profile);
    this.skillsText = (this.editModel.skills ?? []).join(', ');
  }

  cancelEdit(): void {
    this.editMode = false;
    this.saveError = null;
  }

  saveProfile(): void {
    if (!this.candidateId) {
      this.saveError = 'Missing profile ID.';
      return;
    }

    this.saveInFlight = true;
    this.saveError = null;

    const skills = this.parseSkills(this.skillsText);
    const payload = this.normalizeProfilePayload({
      ...this.editModel,
      skills,
    });

    this.profileService.updateProfile(this.candidateId, payload).subscribe({
      next: (updated) => {
        this.profile = updated;
        this.applyProfileToView(updated);
        this.editMode = false;
        this.saveInFlight = false;
        this.calculateProfileStrength();
      },
      error: () => {
        this.saveError = 'Failed to save profile changes.';
        this.saveInFlight = false;
      },
    });
  }

  addExperience(): void {
    this.editModel.experiences ??= [];
    this.editModel.experiences.push({
      jobTitle: '',
      company: '',
      startDate: null,
      endDate: null,
      description: '',
    });
  }

  removeExperience(index: number): void {
    this.editModel.experiences?.splice(index, 1);
  }

  addEducation(): void {
    this.editModel.educations ??= [];
    this.editModel.educations.push({
      degree: '',
      institution: '',
      graduationYear: null,
      description: '',
    });
  }

  removeEducation(index: number): void {
    this.editModel.educations?.splice(index, 1);
  }

  private buildEditModel(profile: CandidateProfile): CandidateProfileRequest {
    return {
      name: profile.name ?? '',
      email: profile.email ?? '',
      phone: profile.phone ?? '',
      address: profile.address ?? '',
      profilePic: profile.profilePic ?? null,
      objectives: profile.objectives ?? '',
      lookingForJob: profile.lookingForJob ?? null,
      desiredJobTitle: profile.desiredJobTitle ?? '',
      desiredCategory: profile.desiredCategory ?? '',
      preferredWorkMode: profile.preferredWorkMode ?? '',
      preferredLocation: profile.preferredLocation ?? '',
      salaryMin: profile.salaryMin ?? null,
      salaryMax: profile.salaryMax ?? null,
      salaryCurrency: profile.salaryCurrency ?? null,
      skills: Array.isArray(profile.skills) ? [...profile.skills] : [],
      experiences: Array.isArray(profile.experiences)
        ? profile.experiences.map((exp: CandidateProfileExperience) => ({
          ...exp,
          startDate: this.formatDateOnly(exp.startDate) ?? null,
          endDate: this.formatDateOnly(exp.endDate) ?? null,
        }))
        : [],
      educations: Array.isArray(profile.educations)
        ? profile.educations.map((edu: CandidateProfileEducation) => ({
          ...edu,
          graduationYear: this.formatEducationYear(edu.graduationYear) || null,
        }))
        : [],
    };
  }

  private parseSkills(value: string): string[] {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }

  private formatExperienceDuration(start: string | null, end: string | null): string {
    const startDate = this.formatDateOnly(start);
    const endDate = this.formatDateOnly(end);
    if (startDate && endDate) return `${startDate} - ${endDate}`;
    if (startDate && !endDate) return `${startDate} - Present`;
    if (!startDate && endDate) return endDate;
    return 'Present';
  }

  private formatDateOnly(value: string | null): string | null {
    if (!value) return null;
    const dateOnlyMatch = value.match(/^\d{4}-\d{2}-\d{2}/);
    if (dateOnlyMatch) return dateOnlyMatch[0];
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString().slice(0, 10);
  }

  private formatEducationYear(value: string | null): string {
    if (!value) return '';
    const yearMatch = value.match(/^\d{4}/);
    if (yearMatch) return yearMatch[0];
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.getUTCFullYear().toString();
  }

  private normalizeProfilePayload(payload: CandidateProfileRequest): CandidateProfileRequest {
    const normalizeText = (value?: string | null) => {
      if (value == null) return null;
      const trimmed = value.trim();
      return trimmed.length ? trimmed : null;
    };

    const toIsoDateTime = (value: string | null | undefined): string | null => {
      if (!value) return null;
      const trimmed = value.trim();
      if (!trimmed) return null;

      // If already ISO-like, keep as-is
      if (/\d{4}-\d{2}-\d{2}T/.test(trimmed)) return trimmed;

      // If only a date (YYYY-MM-DD), convert to ISO midnight
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return new Date(`${trimmed}T00:00:00.000Z`).toISOString();
      }

      // If only a year, convert to Jan 1st of that year
      if (/^\d{4}$/.test(trimmed)) {
        return new Date(`${trimmed}-01-01T00:00:00.000Z`).toISOString();
      }

      // Fallback: try Date parse
      const parsed = new Date(trimmed);
      return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
    };

    const address = normalizeText(payload.address) ?? normalizeText(payload.preferredLocation);

    return {
      name: normalizeText(payload.name) ?? '',
      email: normalizeText(payload.email) ?? '',
      phone: normalizeText(payload.phone) ?? '',
      address: address ?? '',
      profilePic: normalizeText(payload.profilePic),
      objectives: normalizeText(payload.objectives),
      lookingForJob: payload.lookingForJob ?? null,
      desiredJobTitle: normalizeText(payload.desiredJobTitle),
      desiredCategory: normalizeText(payload.desiredCategory),
      preferredWorkMode: normalizeText(payload.preferredWorkMode),
      preferredLocation: normalizeText(payload.preferredLocation),
      salaryMin: payload.salaryMin ?? null,
      salaryMax: payload.salaryMax ?? null,
      salaryCurrency: normalizeText(payload.salaryCurrency),
      skills: Array.isArray(payload.skills) ? payload.skills : [],
      experiences: Array.isArray(payload.experiences)
        ? payload.experiences.map((exp) => ({
          jobTitle: normalizeText(exp.jobTitle) ?? '',
          company: normalizeText(exp.company) ?? '',
          startDate: toIsoDateTime(exp.startDate),
          endDate: toIsoDateTime(exp.endDate),
          description: normalizeText(exp.description) ?? '',
        }))
        : [],
      educations: Array.isArray(payload.educations)
        ? payload.educations.map((edu) => ({
          degree: normalizeText(edu.degree) ?? '',
          institution: normalizeText(edu.institution) ?? '',
          graduationYear: toIsoDateTime(edu.graduationYear),
          description: normalizeText(edu.description) ?? '',
        }))
        : [],
    };
  }

  calculateProfileStrength() {
    let strength = 0;
    if (this.user.name) strength += 10;
    if (this.user.email) strength += 10;
    if (this.user.imageUrl) strength += 10;
    if (this.user.bio) strength += 20;
    if (this.user.skills.length > 0) strength += 20;
    if (this.user.experience.length > 0) strength += 20;
    if (this.user.education.length > 0) strength += 10;
    this.profileStrength = strength;
  }

  logout(): void {
    sessionStorage.removeItem('loggedInUser');
    this.router.navigate(['employee-login']);
  }
}
