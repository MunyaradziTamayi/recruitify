import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { AuthSessionService } from '../../auth/auth-session.service';
import { ApplicationService } from '../../services/application.service';
import { VacancyService } from '../../services/vacancy.service';
import { CompanyService } from '../../services/company.service';
import { Application } from '../../models/application.model';
import { Vacancy } from '../../models/vacancy.model';
import { Company } from '../../models/company.model';

interface ApplicationRow {
  id: number;
  jobTitle: string;
  company: string;
  logo: string;
  appliedDate: string;
  status: Application['status'];
  location: string;
  type: string;
  vacancyId: number;
}

interface UserProfile {
  name: string;
  email: string;
  imageUrl: string;
}

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './my-applications.html',
  styleUrl: './my-applications.css',
})
export class MyApplications implements OnInit {
  user: UserProfile = {
    name: '',
    email: '',
    imageUrl: ''
  };

  applications: ApplicationRow[] = [];
  isLoadingApplications = false;
  applicationsLoadError: string | null = null;

  constructor(
    private router: Router,
    private authSession: AuthSessionService,
    private applicationService: ApplicationService,
    private vacancyService: VacancyService,
    private companyService: CompanyService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const loggedInUser = this.authSession.getLoggedInUser();
    const profile = this.authSession.getAccountProfile(loggedInUser);
    if (!loggedInUser || !profile) {
      this.router.navigate(['employee-login']);
      return;
    }

    this.user = { name: profile.name, email: profile.email, imageUrl: profile.imageUrl };

    const candidateId = loggedInUser['profileId'];
    if (typeof candidateId !== 'number') {
      this.applications = [];
      this.applicationsLoadError = 'No candidate profile found for this user.';
      return;
    }

    this.loadApplications(candidateId);
  }

  private triggerViewUpdate(): void {
    // In some setups (e.g., Zone-less async), the UI may not refresh after async work
    // until the next user event. Force a local change-detection pass.
    try {
      this.cdr.detectChanges();
    } catch {
      // Ignore errors when navigating away / view destroyed.
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Rejected': return 'status-rejected';
      case 'Interviewed': return 'status-interview';
      case 'Hired': return 'status-offered';
      case 'New': return 'status-pending';
      case 'Reviewed': return 'status-pending';
      case 'Shortlisted': return 'status-pending';
      default: return '';
    }
  }

  logout(): void {
    sessionStorage.removeItem('loggedInUser');
    this.router.navigate(['employee-login']);
  }

  get activeInterviewsCount(): number {
    return this.applications.filter((a) => a.status === 'Interviewed').length;
  }

  get offersCount(): number {
    return this.applications.filter((a) => a.status === 'Hired').length;
  }

  get rejectedCount(): number {
    return this.applications.filter((a) => a.status === 'Rejected').length;
  }

  private loadApplications(candidateId: number): void {
    this.isLoadingApplications = true;
    this.applicationsLoadError = null;
    this.triggerViewUpdate();

    forkJoin({
      applications: this.applicationService.getApplicationsForCandidate(candidateId),
      vacancies: this.vacancyService.getVacancies().pipe(catchError(() => of([] as Vacancy[]))),
      companies: this.companyService.getCompanies().pipe(catchError(() => of([] as Company[]))),
    })
      .pipe(
        map(({ applications, vacancies, companies }) => {
          const vacancyById = new Map<number, Vacancy>(
            (vacancies ?? []).filter((v) => typeof v.id === 'number').map((v) => [v.id as number, v]),
          );
          const companyById = new Map<number, Company>(
            (companies ?? []).filter((c) => typeof c.id === 'number').map((c) => [c.id as number, c]),
          );

          return (applications ?? []).map((app): ApplicationRow => {
            const vacancy = vacancyById.get(app.vacancyId);
            const companyId = vacancy?.companyId;
            const company = typeof companyId === 'number' ? companyById.get(companyId) : undefined;
            const companyName =
              company?.name ?? (companyId != null ? `Company #${companyId}` : 'Company');

            const jobTitle = app.position || vacancy?.title || 'Vacancy';
            const location = vacancy?.location || company?.location || '-';
            const type = vacancy?.employmentType || '-';

            return {
              id: app.id ?? 0,
              vacancyId: app.vacancyId,
              jobTitle,
              company: companyName,
              logo: company?.logoUrl || this.buildDefaultLogoUrl(companyName),
              appliedDate: app.appliedDate,
              status: app.status,
              location,
              type,
            };
          });
        }),
        catchError(() => {
          this.applicationsLoadError = 'Unable to load applications right now.';
          this.triggerViewUpdate();
          return of([] as ApplicationRow[]);
        }),
        finalize(() => {
          this.isLoadingApplications = false;
          this.triggerViewUpdate();
        }),
      )
      .subscribe((rows) => {
        this.applications = rows;
        this.triggerViewUpdate();
      });
  }

  private buildDefaultLogoUrl(companyName: string): string {
    const encoded = encodeURIComponent(companyName.trim() || 'Company');
    return `https://ui-avatars.com/api/?name=${encoded}&background=0D6EFD&color=fff&size=128`;
  }
}
