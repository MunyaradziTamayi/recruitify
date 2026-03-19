import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';
import { Application } from '../../models/application.model';
import { ApplicationService } from '../../services/application.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, of, switchMap, tap } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-vacancy-applicants',
  standalone: true,
  imports: [CommonModule, RouterModule, RecruiterAccount],
  templateUrl: './vacancy-applicants.html',
  styleUrl: './vacancy-applicants.css',
})
export class VacancyApplicants implements OnInit {
  applications: Application[] = [];
  loading = false;
  error: string | null = null;
  infoMessage: string | null = null;

  private readonly applicationService = inject(ApplicationService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => {
          const vacancyId = params.get('vacancyId');
          if (vacancyId == null || vacancyId === '') return null;
          const parsed = Number(vacancyId);
          return Number.isFinite(parsed) ? parsed : null;
        }),
        distinctUntilChanged(),
        tap((vacancyId) => {
          this.error = null;
          this.infoMessage = vacancyId == null ? 'Select a vacancy to view its applicants.' : null;
          this.applications = vacancyId == null ? [] : this.applications;
          this.loading = vacancyId != null;
          this.cdr.markForCheck();
        }),
        switchMap((vacancyId) => {
          if (vacancyId == null) return of([] as Application[]);

          return this.applicationService.getApplications({ vacancyId }).pipe(
            catchError((err) => {
              this.error = 'Failed to load applications. Make sure the backend is running on port 8080.';
              console.error(err);
              return of([] as Application[]);
            }),
            finalize(() => {
              this.loading = false;
              this.cdr.markForCheck();
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((applications) => {
        this.applications = applications;
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'New': 'bg-warning text-dark',
      'Reviewed': 'bg-info',
      'Interviewed': 'bg-primary',
      'Shortlisted': 'bg-secondary',
      'Rejected': 'bg-danger',
      'Hired': 'bg-success',
    };
    return statusClasses[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    return status;
  }
}
