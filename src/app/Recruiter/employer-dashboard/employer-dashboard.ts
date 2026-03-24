import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthSessionService } from '../../auth/auth-session.service';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';
import { VacancyService } from '../../services/vacancy.service';
import { ApplicationService } from '../../services/application.service';
import { InterviewService } from '../../services/interview.service';
import { CompanyStoreService } from '../../services/company-store.service';
import { forkJoin, of, EMPTY } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Application } from '../../models/application.model';

interface DashboardStats {
  totalVacancies: number;
  activeApplications: number;
  interviewsScheduled: number;
  hiredThisMonth: number;
}

interface Vacancy {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  postedDate: string;
  applicants: number;
  status: 'active' | 'closed' | 'draft' | 'Active' | 'Closed' | 'Draft' | 'Archived' | 'OPEN' | 'open';
}

interface Applicant {
  id: number;
  name: string;
  position: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'hired' | 'New' | 'Reviewed' | 'Shortlisted' | 'Interviewed' | 'Hired' | 'Rejected';
  avatar: string;
}

interface RecruiterProfile {
  name: string;
  email: string;
  role: string;
  imageUrl: string;
}

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RecruiterAccount],
  templateUrl: './employer-dashboard.html',
  styleUrl: './employer-dashboard.css',
})
export class EmployerDashboard implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private companyId: number | null = null;
  private recruiterId: number | null = null;

  isLoading = false;
  loadError: string | null = null;
  
  user: RecruiterProfile = {
    name: '',
    email: '',
    role: 'Recruiter',
    imageUrl: ''
  };

  stats: DashboardStats = {
    totalVacancies: 0,
    activeApplications: 0,
    interviewsScheduled: 0,
    hiredThisMonth: 0
  };

  recentVacancies: Vacancy[] = [];
  recentApplications: Applicant[] = [];
  companyApplications: Application[] = [];
  companyVacancies: Vacancy[] = [];
  selectedVacancyId: number | null = null;
  selectedVacancyTitle = '';
  vacancyApplicants: Applicant[] = [];
  closeError: string | null = null;
  closeSuccess: string | null = null;
  closingVacancyIds = new Set<number>();

  constructor(
    private router: Router,
    private authSession: AuthSessionService,
    private vacancyService: VacancyService,
    private applicationService: ApplicationService,
    private interviewService: InterviewService,
    private companyStore: CompanyStoreService,
  ) { }

  ngOnInit(): void {
    const loggedInUser = this.authSession.getLoggedInUser();
    if (!loggedInUser) {
      this.router.navigate(['employee-login']);
      return;
    }

    const role = loggedInUser?.role;
    if (role && role !== 'recruiter') {
      this.router.navigate(['employee-dashboard']);
      return;
    }

    const profile = this.authSession.getAccountProfile(loggedInUser);
    if (profile) {
      this.user = {
        name: profile.name,
        email: profile.email,
        role: 'Recruiter',
        imageUrl: profile.imageUrl,
      };
    }

    const userId = this.authSession.getUserId(loggedInUser);
    if (!userId) return;

    const recruiterId =
      typeof (loggedInUser as any).recruiterId === 'number' ? ((loggedInUser as any).recruiterId as number) : null;
    this.recruiterId = recruiterId;

    this.companyStore
      .getCompanyForUser(userId)
      .pipe(
        switchMap((company) => {
          if (!company?.id) return EMPTY;
          this.companyId = company.id;
          return this.loadDashboard(company.id, recruiterId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
      const companyVacancyIds = new Set(data.vacancies.map(v => v.id));
      const companyApplications = data.applications.filter(app => companyVacancyIds.has(app.vacancyId));
      this.companyApplications = companyApplications;
      
      this.stats = {
        totalVacancies: data.vacancies.length,
        activeApplications: companyApplications.filter(app => app.status !== 'Rejected' && app.status !== 'Hired').length,
        interviewsScheduled: data.interviews.filter(i => i.status === 'Upcoming').length,
        hiredThisMonth: companyApplications.filter(app => {
          if (app.status !== 'Hired') return false;
          const appliedDate = new Date(app.appliedDate);
          const now = new Date();
          return appliedDate.getMonth() === now.getMonth() && appliedDate.getFullYear() === now.getFullYear();
        }).length
      };

      this.companyVacancies = (data.vacancies ?? []).map((v) => ({
        id: v.id ?? 0,
        title: v.title,
        department: v.category,
        location: v.location,
        type: v.employmentType,
        postedDate: v.postedDate,
        applicants: v.applicantCount,
        status: v.status,
      }));

      this.recentVacancies = data.vacancies
        .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
        .slice(0, 3)
        .map(v => ({
          id: v.id ?? 0,
          title: v.title,
          department: v.category,
          location: v.location,
          type: v.employmentType,
          postedDate: this.formatRelativeTime(new Date(v.postedDate)),
          applicants: v.applicantCount,
          status: v.status
        }));

      this.recentApplications = companyApplications
        .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
        .slice(0, 5)
        .map(app => ({
          id: app.id ?? 0,
          name: app.candidateName,
          position: app.position,
          appliedDate: this.formatRelativeTime(new Date(app.appliedDate)),
          status: app.status as any,
          avatar: app.candidateAvatar || 'https://i.pravatar.cc/150?img=5'
        }));

      this.syncSelectedVacancy(this.companyVacancies);
      this.cdr.markForCheck();
    });

    this.vacancyService.vacancyChanges$
      .pipe(
        filter(() => this.companyId != null),
        filter((event) => {
          const id = this.companyId;
          if (id == null) return false;
          return event.companyId == null || event.companyId === id;
        }),
        tap(() => this.cdr.markForCheck()),
        switchMap(() => {
          const id = this.companyId;
          if (id == null) return EMPTY;
          return this.loadDashboard(id, this.recruiterId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        const companyVacancyIds = new Set(data.vacancies.map((v) => v.id));
        const companyApplications = data.applications.filter((app) => companyVacancyIds.has(app.vacancyId));
        this.companyApplications = companyApplications;

        this.stats = {
          totalVacancies: data.vacancies.length,
          activeApplications: companyApplications.filter((app) => app.status !== 'Rejected' && app.status !== 'Hired')
            .length,
          interviewsScheduled: data.interviews.filter((i) => i.status === 'Upcoming').length,
          hiredThisMonth: companyApplications.filter((app) => {
            if (app.status !== 'Hired') return false;
            const appliedDate = new Date(app.appliedDate);
            const now = new Date();
            return appliedDate.getMonth() === now.getMonth() && appliedDate.getFullYear() === now.getFullYear();
          }).length,
        };

        this.companyVacancies = (data.vacancies ?? []).map((v) => ({
          id: v.id ?? 0,
          title: v.title,
          department: v.category,
          location: v.location,
          type: v.employmentType,
          postedDate: v.postedDate,
          applicants: v.applicantCount,
          status: v.status,
        }));

        this.recentVacancies = data.vacancies
          .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
          .slice(0, 3)
          .map((v) => ({
            id: v.id ?? 0,
            title: v.title,
            department: v.category,
            location: v.location,
            type: v.employmentType,
            postedDate: this.formatRelativeTime(new Date(v.postedDate)),
            applicants: v.applicantCount,
            status: v.status,
          }));

        this.recentApplications = companyApplications
          .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
          .slice(0, 5)
          .map((app) => ({
            id: app.id ?? 0,
            name: app.candidateName,
            position: app.position,
            appliedDate: this.formatRelativeTime(new Date(app.appliedDate)),
            status: app.status as any,
            avatar: app.candidateAvatar || 'https://i.pravatar.cc/150?img=5',
          }));

        this.syncSelectedVacancy(this.companyVacancies);
        this.cdr.markForCheck();
      });

    this.applicationService.applicationChanges$
      .pipe(
        filter(() => this.companyId != null),
        tap(() => this.cdr.markForCheck()),
        switchMap(() => {
          const id = this.companyId;
          if (id == null) return EMPTY;
          return this.loadDashboard(id, this.recruiterId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        const companyVacancyIds = new Set(data.vacancies.map((v) => v.id));
        const companyApplications = data.applications.filter((app) => companyVacancyIds.has(app.vacancyId));
        this.companyApplications = companyApplications;

        this.stats = {
          totalVacancies: data.vacancies.length,
          activeApplications: companyApplications.filter((app) => app.status !== 'Rejected' && app.status !== 'Hired')
            .length,
          interviewsScheduled: data.interviews.filter((i) => i.status === 'Upcoming').length,
          hiredThisMonth: companyApplications.filter((app) => {
            if (app.status !== 'Hired') return false;
            const appliedDate = new Date(app.appliedDate);
            const now = new Date();
            return appliedDate.getMonth() === now.getMonth() && appliedDate.getFullYear() === now.getFullYear();
          }).length,
        };

        this.companyVacancies = (data.vacancies ?? []).map((v) => ({
          id: v.id ?? 0,
          title: v.title,
          department: v.category,
          location: v.location,
          type: v.employmentType,
          postedDate: v.postedDate,
          applicants: v.applicantCount,
          status: v.status,
        }));

        this.recentVacancies = data.vacancies
          .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
          .slice(0, 3)
          .map((v) => ({
            id: v.id ?? 0,
            title: v.title,
            department: v.category,
            location: v.location,
            type: v.employmentType,
            postedDate: this.formatRelativeTime(new Date(v.postedDate)),
            applicants: v.applicantCount,
            status: v.status,
          }));

        this.recentApplications = companyApplications
          .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
          .slice(0, 5)
          .map((app) => ({
            id: app.id ?? 0,
            name: app.candidateName,
            position: app.position,
            appliedDate: this.formatRelativeTime(new Date(app.appliedDate)),
            status: app.status as any,
            avatar: app.candidateAvatar || 'https://i.pravatar.cc/150?img=5',
          }));

        this.syncSelectedVacancy(this.companyVacancies);
        this.cdr.markForCheck();
      });
  }

  selectVacancyForApplicants(vacancy: Vacancy): void {
    this.selectedVacancyId = vacancy.id;
    this.selectedVacancyTitle = vacancy.title;
    this.refreshVacancyApplicants();
  }

  onVacancySelectionChange(): void {
    const vacancy =
      this.selectedVacancyId != null
        ? this.companyVacancies.find((v) => v.id === this.selectedVacancyId)
        : null;
    this.selectedVacancyTitle = vacancy?.title ?? 'All Vacancies';
    this.refreshVacancyApplicants();
  }

  closeVacancy(vacancy: Vacancy): void {
    if (!vacancy?.id || this.closingVacancyIds.has(vacancy.id)) return;
    if (!confirm(`Close vacancy "${vacancy.title}"?`)) return;

    this.closeError = null;
    this.closeSuccess = null;
    this.closingVacancyIds.add(vacancy.id);
    this.vacancyService.closeVacancy(vacancy.id).pipe(
      tap(() => this.cdr.markForCheck()),
      catchError(() => {
        this.closeError = 'Failed to close vacancy. Please try again.';
        return of(null);
      }),
      tap(() => {
        this.closingVacancyIds.delete(vacancy.id);
        if (!this.closeError) {
          this.closeSuccess = `Vacancy "${vacancy.title}" has been closed.`;
          this.openModal('vacancyCloseSuccessModal');
        }
        this.cdr.markForCheck();
      }),
    ).subscribe();
  }

  private syncSelectedVacancy(vacancies: Array<{ id?: number; title: string }>): void {
    if (!vacancies.length) {
      this.selectedVacancyId = null;
      this.selectedVacancyTitle = '';
      this.vacancyApplicants = [];
      return;
    }

    if (this.selectedVacancyId != null) {
      const match = vacancies.find((v) => v.id === this.selectedVacancyId);
      if (!match) {
        this.selectedVacancyId = null;
        this.selectedVacancyTitle = 'All Vacancies';
      } else {
        this.selectedVacancyTitle = match.title;
      }
    } else {
      this.selectedVacancyTitle = 'All Vacancies';
    }

    this.refreshVacancyApplicants();
  }

  private refreshVacancyApplicants(): void {
    const vacancyIds = this.selectedVacancyId != null
      ? [this.selectedVacancyId]
      : this.companyVacancies.map((v) => v.id).filter((id): id is number => typeof id === 'number');

    if (!vacancyIds.length) {
      this.vacancyApplicants = [];
      return;
    }

    forkJoin(
      vacancyIds.map((id) =>
        this.applicationService.getApplicationsForVacancy(id).pipe(catchError(() => of([] as Application[]))),
      ),
    ).subscribe((results) => {
      const apps = results.flat();
      this.vacancyApplicants = apps
        .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
        .map((app) => ({
          id: app.id ?? 0,
          name: app.candidateName,
          position: app.position,
          appliedDate: this.formatRelativeTime(new Date(app.appliedDate)),
          status: app.status as any,
          avatar: app.candidateAvatar || 'https://i.pravatar.cc/150?img=5',
        }));
      this.cdr.markForCheck();
    });
  }

  private openModal(id: string): void {
    const modalEl = document.getElementById(id);
    if (!modalEl) return;
    const bootstrap = (window as any)?.bootstrap;
    if (!bootstrap?.Modal) return;
    const instance = bootstrap.Modal.getOrCreateInstance(modalEl);
    instance.show();
  }

  private loadDashboard(companyId: number, recruiterId: number | null) {
    this.isLoading = true;
    this.loadError = null;
    this.cdr.markForCheck();

    return forkJoin({
      vacancies: this.vacancyService.getVacanciesForCompany(companyId, { refresh: true }).pipe(catchError(() => of([]))),
      applications: this.applicationService.getApplications().pipe(catchError(() => of([]))),
      interviews: recruiterId != null
        ? this.interviewService.getInterviews({ recruiterId }).pipe(catchError(() => of([])))
        : of([]),
    }).pipe(
      map((data) => ({ ...data, companyId })),
      catchError(() => {
        this.loadError = 'Failed to load dashboard data.';
        return of({ vacancies: [], applications: [], interviews: [], companyId });
      }),
      tap(() => {
        this.isLoading = false;
        this.cdr.markForCheck();
      }),
    );
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    if (isNaN(diffMs)) return 'Recently';
    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    return date.toLocaleDateString();
  }

  getStatusClass(status: string): string {
    const s = status.toLowerCase();
    const statusClasses: { [key: string]: string } = {
      'pending': 'bg-warning',
      'reviewed': 'bg-info',
      'interview': 'bg-primary',
      'interviewed': 'bg-primary',
      'rejected': 'bg-danger',
      'hired': 'bg-success',
      'active': 'bg-success',
      'closed': 'bg-secondary',
      'draft': 'bg-secondary',
      'shortlisted': 'bg-info',
      'new': 'bg-warning'
    };
    return statusClasses[s] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
