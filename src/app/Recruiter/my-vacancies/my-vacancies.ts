import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';
import { Router } from '@angular/router';
import { VacancyService } from '../../services/vacancy.service';
import { Vacancy } from '../../models/vacancy.model';
import { AuthSessionService } from '../../auth/auth-session.service';
import { CompanyStoreService } from '../../services/company-store.service';
import { Company } from '../../models/company.model';
import { EMPTY, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, map, switchMap, tap } from 'rxjs/operators';

type VacancyRow = Vacancy & { type: Vacancy['employmentType'] };

@Component({
  selector: 'app-my-vacancies',
  standalone: true,
  imports: [CommonModule, RouterModule, RecruiterAccount],
  templateUrl: './my-vacancies.html',
  styleUrl: './my-vacancies.css',
})
export class MyVacancies implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  company: Company | null = null;
  vacancies: VacancyRow[] = [];
  isLoading = false;
  loadError: string | null = null;

  constructor(
    private authSession: AuthSessionService,
    private companyStore: CompanyStoreService,
    private vacancyService: VacancyService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.authSession.getLoggedInUser();
    const userId = this.authSession.getUserId(user);
    if (!userId) return;

    this.isLoading = true;
    this.loadError = null;
    this.cdr.markForCheck();

    this.companyStore
      .getCompanyForUser(userId)
      .pipe(
        tap((company) => {
          this.company = company;
          this.cdr.markForCheck();
        }),
        switchMap((company) => {
          if (!company?.id) {
            this.router.navigate(['company-setup'], { queryParams: { returnUrl: '/my-vacancies' } });
            return EMPTY;
          }

          return this.vacancyService.getVacanciesForCompany(company.id);
        }),
        map((vacancies) =>
          (vacancies ?? [])
            .map((v) => ({ ...v, type: v.employmentType }))
            .sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()),
        ),
        catchError(() => {
          this.loadError = 'Unable to load your vacancies right now.';
          this.cdr.markForCheck();
          return of([] as VacancyRow[]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((vacancies) => {
        this.vacancies = vacancies;
        this.cdr.markForCheck();
      });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Active': 'bg-success',
      'Closed': 'bg-secondary',
      'Draft': 'bg-warning text-dark',
      'Archived': 'bg-dark'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    return status;
  }

  trackByVacancyId(_index: number, vacancy: VacancyRow): number | string {
    return vacancy.id ?? `${vacancy.companyId}-${vacancy.title}`;
  }
}
