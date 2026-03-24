import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CvUploadComponent } from '../cv-upload/cv-upload.component';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { VacancyService } from '../../services/vacancy.service';
import { CompanyService } from '../../services/company.service';
import { ApplicationService } from '../../services/application.service';
import { InterviewService } from '../../services/interview.service';
import { ProfileService } from '../../services/profile.service';
import { CandidateProfile } from '../../models/profile.model';
import { Vacancy } from '../../models/vacancy.model';
import { Company } from '../../models/company.model';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  logo: string;
  timePosted: string;
  postedAt: Date | null;
  type: string;
  applicants: number;
  isVerified: boolean;
  isSaved: boolean;
  isNew: boolean;
  description: string;
  requirements: string[];
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  location: string;
  imageUrl: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CvUploadComponent, RouterLink, RouterLinkActive],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly lastSeenVacanciesKey = 'employeeDashboardLastSeenVacanciesAt';

  user: UserProfile = {
    name: '',
    email: '',
    role: 'Job Seeker',
    location: '',
    imageUrl: ''
  };

  isLoadingVacancies = false;
  vacanciesLoadError: string | null = null;
  
  applicationsCount = 0;
  interviewsCount = 0;
  profileViewsCount = 48; // Dummy for now

  applyingJobIds = new Set<number>();
  appliedJobIds = new Set<number>();

  candidateId: number | null = null;
  profile: CandidateProfile | null = null;

  constructor(
    private router: Router,
    private vacancyService: VacancyService,
    private companyService: CompanyService,
    private applicationService: ApplicationService,
    private interviewService: InterviewService,
    private profileService: ProfileService,
  ) { }

  ngOnInit(): void {
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (storedUser) {
      const googleUser = JSON.parse(storedUser);
      this.user = {
        name: googleUser.name || 'User',
        email: googleUser.email || '',
        role: 'Job Seeker',
        location: googleUser.locale || '',
        imageUrl: googleUser.picture || 'https://i.pravatar.cc/150?img=1'
      };

      const parsedCandidateId = Number(googleUser.profileId);
      this.candidateId = Number.isNaN(parsedCandidateId) ? null : parsedCandidateId;
      if (this.candidateId) {
        this.loadCounts(this.candidateId);
        this.loadApplications(this.candidateId);
        this.loadProfile(this.candidateId);
      }
    } else {
      this.router.navigate(['employee-login']);
      return;
    }

    this.loadVacancies();
  }

  private loadProfile(candidateId: number): void {
    this.profileService.getProfileById(candidateId).subscribe({
      next: (profile) => {
        this.profile = profile;
        this.user.name = profile.name || this.user.name;
        this.user.email = profile.email || this.user.email;
        this.user.location = profile.address || profile.preferredLocation || this.user.location;
        this.user.role = profile.desiredJobTitle || this.user.role;
        this.cdr.markForCheck();
      },
      error: () => {
        // Keep session-based defaults if profile load fails.
      },
    });
  }

  private loadCounts(candidateId: number): void {
    forkJoin({
      applications: this.applicationService.getApplicationsForCandidate(candidateId),
      interviews: this.interviewService.getInterviews({ candidateId })
    }).subscribe({
      next: (data) => {
        this.applicationsCount = data.applications.length;
        this.interviewsCount = data.interviews.filter(i => i.status === 'Upcoming').length;
        this.cdr.markForCheck();
      }
    });
  }

  private loadApplications(candidateId: number): void {
    this.applicationService.getApplicationsForCandidate(candidateId).subscribe(apps => {
      this.appliedJobIds = new Set(apps.map(a => a.vacancyId));
      this.cdr.markForCheck();
    });
  }

  applyForVacancy(job: Job): void {
    this.openApplyModal(job);
  }

  isApplied(jobId: number): boolean {
    return this.appliedJobIds.has(jobId);
  }

  isApplying(jobId: number): boolean {
    return this.applyingJobIds.has(jobId);
  }

  filters = {
    jobTitle: '',
    keywords: '',
    company: '',
    location: '',
    jobType: '',
  };

  activeTags: string[] = [];

  availableLocations: string[] = [];
  availableJobTypes: string[] = [];

  jobs: Job[] = [];
  filteredJobs: Job[] = [];
  recommendedJobs: Job[] = [];
  allJobs: Job[] = [];
  showRecommended = false;
  allJobsTitle = 'All Jobs';
  selectedJob: Job | null = null;
  applyCoverLetter = '';
  applyError: string | null = null;
  applySuccess: string | null = null;
  isSubmittingApplication = false;
  recommendedVisibleCount = 2;
  allJobsVisibleCount = 5;

  selectJob(job: Job) {
    this.selectedJob = job;
  }

  openApplyModal(job: Job): void {
    this.selectedJob = job;
    this.applyCoverLetter = '';
    this.applyError = null;
    this.applySuccess = null;
  }

  submitApplication(): void {
    if (!this.selectedJob || !this.candidateId) {
      this.applyError = 'Missing job or candidate information.';
      return;
    }

    if (this.appliedJobIds.has(this.selectedJob.id)) {
      this.applyError = 'You have already applied for this job.';
      return;
    }

    const coverLetter = this.applyCoverLetter.trim();
    if (!coverLetter) {
      this.applyError = 'Cover letter is required.';
      return;
    }

    this.isSubmittingApplication = true;
    this.applyError = null;
    this.applySuccess = null;
    this.applyingJobIds.add(this.selectedJob.id);

    this.applicationService.applyToVacancy(this.selectedJob.id, this.candidateId, coverLetter)
      .pipe(finalize(() => {
        this.isSubmittingApplication = false;
        this.applyingJobIds.delete(this.selectedJob!.id);
        this.cdr.markForCheck();
      }))
      .subscribe({
        next: () => {
          this.appliedJobIds.add(this.selectedJob!.id);
          this.applicationsCount++;
          this.applySuccess = 'Application submitted successfully.';
          this.applyCoverLetter = '';
          this.closeApplyModal();
          this.openSuccessModal();
          this.cdr.markForCheck();
        },
        error: () => {
          this.applyError = 'Failed to submit application. Please try again.';
        },
      });
  }

  toggleSave(job: Job) {
    job.isSaved = !job.isSaved;
  }

  applyFilters(): void {
    const jobTitle = this.normalize(this.filters.jobTitle);
    const company = this.normalize(this.filters.company);
    const location = this.normalize(this.filters.location);
    const jobType = this.normalize(this.filters.jobType);
    const keywordTokens = this.tokenize(this.filters.keywords);

    this.filteredJobs = this.jobs.filter((job) => {
      const titleText = this.normalize(job.title);
      const companyText = this.normalize(job.company);
      const locationText = this.normalize(job.location);
      const typeText = this.normalize(job.type);

      if (jobTitle && !titleText.includes(jobTitle)) return false;
      if (company && !companyText.includes(company)) return false;
      if (location && !locationText.includes(location)) return false;
      if (jobType && typeText !== jobType) return false;

      if (keywordTokens.length) {
        const haystack = this.normalize(
          `${job.title} ${job.company} ${job.location} ${job.type} ${job.description} ${(job.requirements ?? []).join(' ')}`,
        );
        if (!keywordTokens.every((t) => haystack.includes(t))) return false;
      }

      return true;
    });

    this.activeTags = [
      this.filters.jobTitle,
      this.filters.keywords,
      this.filters.company,
      this.filters.location,
      this.filters.jobType,
    ].map((v) => v.trim()).filter(Boolean);

    if (this.activeTags.length > 0) {
      this.showRecommended = false;
      this.allJobsTitle = 'Matching Jobs';
      this.recommendedVisibleCount = 0;
      this.allJobsVisibleCount = this.filteredJobs.length;
      this.selectedJob = this.filteredJobs.length ? this.filteredJobs[0] : null;
      this.cdr.markForCheck();
      return;
    }

    const sorted = [...this.jobs].sort((a, b) => {
      const aTime = a.postedAt ? a.postedAt.getTime() : 0;
      const bTime = b.postedAt ? b.postedAt.getTime() : 0;
      return bTime - aTime;
    });

    this.showRecommended = true;
    this.allJobsTitle = 'All Jobs';

    const remaining = sorted;
    const minAllJobs = 2;
    const totalTarget = Math.max(5, this.recommendedJobs.length + minAllJobs);
    const allJobsCount = Math.min(remaining.length, Math.max(minAllJobs, totalTarget - this.recommendedJobs.length));
    this.allJobs = remaining;

    if (this.recommendedJobs.length === 0) {
      // No recommended jobs; show all jobs ranked by posted date.
      this.allJobs = sorted;
    }

    this.recommendedVisibleCount = Math.min(2, this.recommendedJobs.length);
    this.allJobsVisibleCount = Math.min(
      this.allJobs.length,
      Math.max(5, Math.min(this.allJobs.length, allJobsCount))
    );

    this.selectedJob = this.recommendedJobs.length
      ? this.recommendedJobs[0]
      : (this.allJobs.length ? this.allJobs[0] : null);
    this.cdr.markForCheck();
  }

  showMoreRecommended(): void {
    this.recommendedVisibleCount = Math.min(this.recommendedJobs.length, this.recommendedVisibleCount + 2);
  }

  showLessRecommended(): void {
    this.recommendedVisibleCount = Math.min(2, this.recommendedJobs.length);
  }

  showMoreAllJobs(): void {
    this.allJobsVisibleCount = Math.min(this.allJobs.length, this.allJobsVisibleCount + 5);
  }

  showLessAllJobs(): void {
    this.allJobsVisibleCount = Math.min(5, this.allJobs.length);
  }

  private closeApplyModal(): void {
    const modalEl = document.getElementById('applyModal');
    if (!modalEl) return;
    const bootstrap = (window as any)?.bootstrap;
    const instance = bootstrap?.Modal?.getInstance(modalEl);
    if (instance) {
      instance.hide();
    }
  }

  private openSuccessModal(): void {
    const modalEl = document.getElementById('applySuccessModal');
    if (!modalEl) return;
    const bootstrap = (window as any)?.bootstrap;
    if (!bootstrap?.Modal) return;
    const instance = bootstrap.Modal.getOrCreateInstance(modalEl);
    instance.show();
  }

  clearFilters(): void {
    this.filters = { jobTitle: '', keywords: '', company: '', location: '', jobType: '' };
    this.applyFilters();
  }

  removeTag(tag: string): void {
    if (this.filters.jobTitle.trim() === tag) this.filters.jobTitle = '';
    if (this.filters.keywords.trim() === tag) this.filters.keywords = '';
    if (this.filters.company.trim() === tag) this.filters.company = '';
    if (this.filters.location.trim() === tag) this.filters.location = '';
    if (this.filters.jobType.trim() === tag) this.filters.jobType = '';
    this.applyFilters();
  }

  get savedJobsCount(): number {
    return this.jobs.filter(job => job.isSaved).length;
  }

  get newVacanciesCount(): number {
    return this.jobs.filter((job) => job.isNew).length;
  }

  logout(): void {
    sessionStorage.removeItem('loggedInUser');
    this.router.navigate(['employee-login']);
  }

  private loadVacancies(): void {
    const lastSeen = this.getLastSeenVacanciesAt();
    const now = new Date();

    this.isLoadingVacancies = true;
    this.vacanciesLoadError = null;
    const candidateId = this.candidateId;

    forkJoin({
      vacancies: this.vacancyService.getVacancies(),
      recommended: candidateId ? this.vacancyService.getRecommendedVacancies(candidateId).pipe(catchError(() => of([] as Vacancy[]))) : of([] as Vacancy[]),
      companies: this.companyService.getCompanies().pipe(catchError(() => of([] as Company[]))),
    })
      .pipe(
        map(({ vacancies, companies, recommended }) => {
          const companyNames = new Map<number, string>(
            companies
              .filter((c) => typeof c.id === 'number')
              .map((c) => [c.id as number, c.name]),
          );

          const jobsFromVacancies = (vacancies ?? [])
            .filter((v) => this.isVacancyActive(v.status))
            .map((vacancy) => this.mapVacancyToJob(vacancy, companyNames, lastSeen, now));

          const recommendedJobs = (recommended ?? [])
            .filter((v) => this.isVacancyActive(v.status))
            .map((vacancy) => this.mapVacancyToJob(vacancy, companyNames, lastSeen, now))
            .sort((a, b) => {
              const aTime = a.postedAt ? a.postedAt.getTime() : 0;
              const bTime = b.postedAt ? b.postedAt.getTime() : 0;
              return bTime - aTime;
            })
            .slice(0, 3);

          jobsFromVacancies.sort((a, b) => {
            if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
            return 0;
          });

          return { jobsFromVacancies, recommendedJobs };
        }),
        catchError(() => {
          this.vacanciesLoadError = 'Unable to load vacancies right now.';
          return of({ jobsFromVacancies: [] as Job[], recommendedJobs: [] as Job[] });
        }),
        finalize(() => {
          this.isLoadingVacancies = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe(({ jobsFromVacancies, recommendedJobs }) => {
        this.jobs = jobsFromVacancies;
        this.recommendedJobs = recommendedJobs;
        this.availableLocations = this.buildUniqueSorted(jobsFromVacancies.map((j) => j.location));
        this.availableJobTypes = this.buildUniqueSorted(jobsFromVacancies.map((j) => j.type));
        this.applyFilters();
        if (!this.vacanciesLoadError) {
          this.setLastSeenVacanciesAt(now);
        }
        this.cdr.markForCheck();
      });
  }

  private mapVacancyToJob(
    vacancy: Vacancy,
    companyNames: Map<number, string>,
    lastSeen: Date | null,
    now: Date,
  ): Job {
    const postedAt = this.parsePostedDate(vacancy.postedDate);
    const isNew = postedAt != null ? this.isVacancyNew(postedAt, lastSeen, now) : false;

    return {
      id: vacancy.id ?? 0,
      title: vacancy.title,
      company: companyNames.get(vacancy.companyId) ?? `Company #${vacancy.companyId}`,
      location: vacancy.location,
      logo: '',
      timePosted: postedAt ? this.formatRelativeTime(postedAt, now) : 'Recently',
      postedAt,
      type: vacancy.employmentType,
      applicants: vacancy.applicantCount ?? 0,
      isVerified: true,
      isSaved: false,
      isNew,
      description: vacancy.description ?? '',
      requirements: vacancy.requirements ?? [],
    };
  }

  private getLastSeenVacanciesAt(): Date | null {
    const raw = localStorage.getItem(this.lastSeenVacanciesKey);
    if (!raw) return null;
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private setLastSeenVacanciesAt(date: Date): void {
    localStorage.setItem(this.lastSeenVacanciesKey, date.toISOString());
  }

  private parsePostedDate(value: unknown): Date | null {
    if (typeof value !== 'string') return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private isVacancyActive(status: unknown): boolean {
    if (status == null) return true;
    const normalized = String(status).trim().toUpperCase();
    return normalized === 'ACTIVE' || normalized === 'OPEN';
  }

  private isVacancyNew(postedAt: Date, lastSeen: Date | null, now: Date): boolean {
    if (lastSeen) return postedAt.getTime() > lastSeen.getTime();
    const hours48 = 48 * 60 * 60 * 1000;
    return now.getTime() - postedAt.getTime() <= hours48;
  }

  private formatRelativeTime(postedAt: Date, now: Date): string {
    const diffMs = now.getTime() - postedAt.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  private normalize(value: unknown): string {
    return typeof value === 'string' ? value.toLowerCase().trim() : '';
  }

  private tokenize(value: string): string[] {
    return this.normalize(value).split(/[\s,]+/).filter(Boolean);
  }

  private buildUniqueSorted(values: Array<string | null | undefined>): string[] {
    const set = new Set<string>();
    for (const value of values) {
      const normalized = typeof value === 'string' ? value.trim() : '';
      if (normalized) set.add(normalized);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }
}
