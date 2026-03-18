import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';
import { Application } from '../../models/application.model';
import { ApplicationService } from '../../services/application.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs';

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

  private readonly applicationService = inject(ApplicationService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => {
          const vacancyId = params.get('vacancyId');
          return vacancyId != null && vacancyId !== '' ? Number(vacancyId) : undefined;
        }),
        distinctUntilChanged(),
        tap(() => {
          this.loading = true;
          this.error = null;
        }),
        switchMap((vacancyId) => this.applicationService.getApplications({ vacancyId })),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (applications) => {
          this.applications = applications;
          this.loading = false;
        },
        error: (err) => {
          this.applications = [];
          this.loading = false;
          this.error = 'Failed to load applications. Make sure the backend is running on port 8080.';
          console.error(err);
        },
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
