import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';
import { Router } from '@angular/router';
import { VacancyService } from '../../services/vacancy.service';
import { VacancyUpsert } from '../../services/vacancy.service';
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
  imports: [CommonModule, FormsModule, RouterModule, RecruiterAccount],
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
  editVacancy: VacancyRow | null = null;
  editModel: VacancyUpsert | null = null;
  editRequirementsText = '';
  editError: string | null = null;
  editSuccess: string | null = null;
  saving = false;
  closeSuccess: string | null = null;
  closingVacancyIds = new Set<number>();
  deleteSuccess: string | null = null;
  deletingVacancyIds = new Set<number>();

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

  openEditModal(vacancy: VacancyRow): void {
    this.editVacancy = vacancy;
    this.editError = null;
    this.editSuccess = null;
    this.closeSuccess = null;
    this.deleteSuccess = null;
    const salaryRange = vacancy.salaryRange ?? { min: 0, max: 0, currency: '' };
    this.editModel = {
      title: vacancy.title,
      category: vacancy.category,
      location: vacancy.location,
      employmentType: vacancy.employmentType,
      salaryRange,
      description: vacancy.description,
      requirements: vacancy.requirements ?? [],
      status: vacancy.status,
      postedDate: vacancy.postedDate,
      closingDate: vacancy.closingDate ?? null,
      companyId: vacancy.companyId,
      applicantCount: vacancy.applicantCount ?? 0,
    };
    this.editRequirementsText = (vacancy.requirements ?? []).join(', ');
  }

  saveEdit(): void {
    if (!this.editVacancy || !this.editModel) return;
    if (!this.editVacancy.id) {
      this.editError = 'Missing vacancy ID.';
      return;
    }

    const requirements = this.editRequirementsText
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    const payload: VacancyUpsert = {
      ...this.editModel,
      requirements,
      postedDate: this.toIsoDateTime(this.editModel.postedDate),
      closingDate: this.editModel.closingDate ? this.toIsoDateTime(this.editModel.closingDate) : null,
      companyId: this.editModel.companyId,
    };

    this.saving = true;
    this.editError = null;

    this.vacancyService.updateVacancy(this.editVacancy.id, payload).pipe(
      finalize(() => {
        this.saving = false;
        this.cdr.markForCheck();
      }),
    ).subscribe({
      next: (updated) => {
        this.editSuccess = 'Vacancy updated successfully.';
        const idx = this.vacancies.findIndex((v) => v.id === updated.id);
        if (idx >= 0) {
          this.vacancies[idx] = { ...updated, type: updated.employmentType } as VacancyRow;
        }
        this.openModal('editVacancySuccessModal');
        this.cdr.markForCheck();
      },
      error: () => {
        this.editError = 'Failed to update vacancy.';
      },
    });
  }

  closeVacancy(vacancy: VacancyRow): void {
    if (!vacancy.id || this.closingVacancyIds.has(vacancy.id)) return;
    if (!confirm(`Close vacancy "${vacancy.title}"?`)) return;
    const vacancyId = vacancy.id;
    this.closingVacancyIds.add(vacancyId);
    this.closeSuccess = null;
    this.vacancyService.closeVacancy(vacancy.id).pipe(
      finalize(() => {
        if (vacancyId != null) {
          this.closingVacancyIds.delete(vacancyId);
        }
        this.cdr.markForCheck();
      }),
    ).subscribe({
      next: () => {
        vacancy.status = 'Closed';
        this.closeSuccess = `Vacancy "${vacancy.title}" has been closed.`;
        this.openModal('closeVacancySuccessModal');
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadError = 'Failed to close vacancy.';
      },
    });
  }

  deleteVacancy(vacancy: VacancyRow): void {
    if (!vacancy.id || this.deletingVacancyIds.has(vacancy.id)) return;
    if (!confirm(`Delete vacancy "${vacancy.title}"? This cannot be undone.`)) return;
    const vacancyId = vacancy.id;
    this.deletingVacancyIds.add(vacancyId);
    this.deleteSuccess = null;
    this.vacancyService.deleteVacancy(vacancyId).pipe(
      finalize(() => {
        if (vacancyId != null) {
          this.deletingVacancyIds.delete(vacancyId);
        }
        this.cdr.markForCheck();
      }),
    ).subscribe({
      next: () => {
        this.vacancies = this.vacancies.filter((v) => v.id !== vacancyId);
        this.deleteSuccess = `Vacancy "${vacancy.title}" has been deleted.`;
        this.openModal('deleteVacancySuccessModal');
        this.cdr.markForCheck();
      },
      error: () => {
        this.loadError = 'Failed to delete vacancy.';
      },
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

  private toIsoDateTime(value: string): string {
    if (!value) return new Date().toISOString();
    if (value.includes('T')) return value;
    return new Date(`${value}T00:00:00.000Z`).toISOString();
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
