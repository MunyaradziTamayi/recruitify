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
import { Vacancy } from '../../models/vacancy.model';
import { Company } from '../../models/company.model';
import { ApplicationUpsert } from '../../services/application.service';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  logo: string;
  timePosted: string;
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

  private candidateId: number | null = null;

  constructor(
    private router: Router,
    private vacancyService: VacancyService,
    private companyService: CompanyService,
    private applicationService: ApplicationService,
    private interviewService: InterviewService,
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

      this.candidateId = googleUser.profileId;
      if (this.candidateId) {
        this.loadCounts(this.candidateId);
        this.loadApplications(this.candidateId);
      }
    } else {
      this.router.navigate(['employee-login']);
      return;
    }

    this.loadVacancies();
  }

  private loadCounts(candidateId: number): void {
    forkJoin({
      applications: this.applicationService.getApplications({ candidateId }),
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
    this.applicationService.getApplications({ candidateId }).subscribe(apps => {
      this.appliedJobIds = new Set(apps.map(a => a.vacancyId));
      this.cdr.markForCheck();
    });
  }

  applyForVacancy(job: Job): void {
    if (!this.candidateId || this.appliedJobIds.has(job.id) || this.applyingJobIds.has(job.id)) return;

    this.applyingJobIds.add(job.id);
    this.cdr.markForCheck();

    const application: ApplicationUpsert = {
      vacancyId: job.id,
      candidateId: this.candidateId,
      candidateName: this.user.name,
      candidateAvatar: this.user.imageUrl,
      appliedDate: new Date().toISOString(),
      status: 'New',
      position: job.title
    };

    this.applicationService.createApplication(application).pipe(
      finalize(() => {
        this.applyingJobIds.delete(job.id);
        this.cdr.markForCheck();
      })
    ).subscribe({
      next: () => {
        this.appliedJobIds.add(job.id);
        this.applicationsCount++;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to apply:', err);
        alert('Failed to apply for this vacancy. Please try again.');
      }
    });
  }

  isApplied(jobId: number): boolean {
    return this.appliedJobIds.has(jobId);
  }

  isApplying(jobId: number): boolean {
    return this.applyingJobIds.has(jobId);
  }

  filters = {
    experienceLevel: [
      { name: 'Entry level', count: 23, checked: false },
      { name: 'Intermediate', count: 49, checked: false },
      { name: 'Expert', count: 31, checked: true }
    ],
    jobLocation: 'Remotely',
    jobType: [
      { name: 'Full time', count: 72, checked: false },
      { name: 'Part time', count: 24, checked: false }
    ]
  };

  activeTags = ['Design', 'Expert', 'Remotely'];

  jobs: Job[] = [];
  selectedJob: Job | null = null;

  selectJob(job: Job) {
    this.selectedJob = job;
  }

  toggleSave(job: Job) {
    job.isSaved = !job.isSaved;
  }

  removeTag(tag: string) {
    this.activeTags = this.activeTags.filter(t => t !== tag);
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

    forkJoin({
      vacancies: this.vacancyService.getVacancies(),
      companies: this.companyService.getCompanies().pipe(catchError(() => of([] as Company[]))),
    })
      .pipe(
        map(({ vacancies, companies }) => {
          const companyNames = new Map<number, string>(
            companies
              .filter((c) => typeof c.id === 'number')
              .map((c) => [c.id as number, c.name]),
          );

          const jobsFromVacancies = (vacancies ?? [])
            .filter((v) => (v.status ?? 'Active') === 'Active')
            .map((vacancy) => this.mapVacancyToJob(vacancy, companyNames, lastSeen, now));

          jobsFromVacancies.sort((a, b) => {
            if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
            return 0;
          });

          return jobsFromVacancies;
        }),
        catchError(() => {
          this.vacanciesLoadError = 'Unable to load vacancies right now.';
          return of([] as Job[]);
        }),
        finalize(() => {
          this.isLoadingVacancies = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe((jobs) => {
        this.jobs = jobs;
        this.selectedJob = this.jobs.length ? this.jobs[0] : null;
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
}
