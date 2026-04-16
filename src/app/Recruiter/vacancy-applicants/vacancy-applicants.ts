import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';
import { Application } from '../../models/application.model';
import { ApplicationService } from '../../services/application.service';
import { VacancyService } from '../../services/vacancy.service';
import { CompanyStoreService } from '../../services/company-store.service';
import { AuthSessionService } from '../../auth/auth-session.service';
import { Vacancy } from '../../models/vacancy.model';
import { CvExtractionService } from '../../services/cv-extraction.service';
import { InterviewService } from '../../services/interview.service';
import { InterviewUpsert } from '../../services/interview.service';
import { RecommendedCandidate } from '../../services/application.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, forkJoin, map, of, switchMap, tap, EMPTY } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

interface EmailResult {
  emailSent: boolean;
  warning?: string;
}

@Component({
  selector: 'app-vacancy-applicants',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RecruiterAccount],
  templateUrl: './vacancy-applicants.html',
  styleUrl: './vacancy-applicants.css',
})
export class VacancyApplicants implements OnInit {
  applications: Application[] = [];
  vacancies: Vacancy[] = [];
  selectedVacancyId: number | null = null;
  recommendedCandidates: RecommendedCandidate[] = [];
  recommendedLoading = false;
  recommendedError: string | null = null;
  recommendedInfo: string | null = null;
  expandedCandidateIndex: number | null = null;
  selectedApplicant: Application | null = null;
  interviewForm: InterviewUpsert = {
    applicationId: 0,
    candidateId: 0,
    candidateName: '',
    candidateAvatar: '',
    position: '',
    date: '',
    time: '',
    type: 'Virtual',
    status: 'Upcoming',
    meetingLink: '',
    location: '',
    notes: '',
  };
  interviewError: string | null = null;
  interviewSuccess: string | null = null;
  scheduling = false;
  loading = false;
  error: string | null = null;
  infoMessage: string | null = null;

  private readonly applicationService = inject(ApplicationService);
  private readonly vacancyService = inject(VacancyService);
  private readonly companyStore = inject(CompanyStoreService);
  private readonly authSession = inject(AuthSessionService);
  private readonly cvService = inject(CvExtractionService);
  private readonly interviewService = inject(InterviewService);
  private readonly profileService = inject(ProfileService);
  private readonly emailService = inject(EmailService);
  private readonly recruiterService = inject(RecruiterService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  private triggerViewUpdate(): void {
    // In some setups (e.g., Zone-less or fetch-based async), async callbacks may not
    // automatically trigger change detection. Force a local view refresh.
    try {
      this.cdr.detectChanges();
    } catch {
      // Ignore errors when the view is already destroyed/navigated away.
    }
  }

  ngOnInit(): void {
    const loggedInUser = this.authSession.getLoggedInUser();
    if (!loggedInUser) {
      this.infoMessage = 'Please log in to view applicants.';
      return;
    }

    const userId = this.authSession.getUserId(loggedInUser);
    if (!userId) {
      this.infoMessage = 'Unable to load recruiter profile.';
      return;
    }

    this.companyStore
      .getCompanyForUser(userId)
      .pipe(
        switchMap((company) => {
          if (!company?.id) return EMPTY;
          return this.vacancyService.getVacanciesForCompany(company.id, { refresh: true });
        }),
        catchError(() => {
          this.error = 'Failed to load vacancies.';
          return of([] as Vacancy[]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((vacancies) => {
        this.vacancies = vacancies ?? [];
        if (this.selectedVacancyId == null) {
          this.onVacancySelectionChange();
        }
        this.cdr.markForCheck();
      });

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
          this.selectedVacancyId = vacancyId;
          this.infoMessage = vacancyId == null ? 'Showing applicants for all vacancies.' : null;
          this.loading = true;
          this.cdr.markForCheck();
        }),
        switchMap((vacancyId) => {
          const vacancyIds =
            vacancyId != null
              ? [vacancyId]
              : this.vacancies.map((v) => v.id).filter((id): id is number => typeof id === 'number');

          if (!vacancyIds.length) return of([] as Application[]);

          return forkJoin(
            vacancyIds.map((id) =>
              this.applicationService.getApplicationsForVacancy(id).pipe(catchError(() => of([] as Application[]))),
            ),
          ).pipe(
            map((results) => results.flat()),
            catchError((err) => {
              this.error = 'Failed to load applications. Make sure the backend is running on port 8080.';
              console.error(err);
              this.triggerViewUpdate();
              return of([] as Application[]);
            }),
            finalize(() => {
              this.loading = false;
              this.triggerViewUpdate();
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((applications) => {
        this.applications = applications;
        this.loading = false;
        this.triggerViewUpdate();
      });
  }

  onVacancySelectionChange(): void {
    this.loading = true;
    this.error = null;
    this.infoMessage = this.selectedVacancyId == null ? 'Showing applicants for all vacancies.' : null;
    this.cdr.markForCheck();

    const vacancyIds =
      this.selectedVacancyId != null
        ? [this.selectedVacancyId]
        : this.vacancies.map((v) => v.id).filter((id): id is number => typeof id === 'number');

    if (!vacancyIds.length) {
      this.applications = [];
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    forkJoin(
      vacancyIds.map((id) =>
        this.applicationService.getApplicationsForVacancy(id).pipe(catchError(() => of([] as Application[]))),
      ),
    )
      .pipe(
        map((results) => results.flat()),
        catchError((err) => {
          this.error = 'Failed to load applications. Make sure the backend is running on port 8080.';
          console.error(err);
          return of([] as Application[]);
        }),
        finalize(() => {
          this.loading = false;
          this.triggerViewUpdate();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((applications) => {
        this.applications = applications;
        this.triggerViewUpdate();
      });
  }

  viewCv(app: Application): void {
    if (!app.candidateId) return;
    this.cvService.viewCvPdf(app.candidateId).subscribe({
      next: (blob) => {
        const fileUrl = URL.createObjectURL(blob);
        window.open(fileUrl, '_blank');
      },
      error: () => {
        this.error = 'Unable to load CV. Please try again.';
        this.triggerViewUpdate();
      },
    });
  }

  openInterviewModal(app: Application): void {
    this.selectedApplicant = app;
    this.interviewError = null;
    this.interviewSuccess = null;
    this.interviewForm = {
      applicationId: app.id ?? 0,
      candidateId: app.candidateId,
      candidateName: app.candidateName,
      candidateAvatar: app.candidateAvatar ?? '',
      position: app.position,
      date: '',
      time: '',
      type: 'Virtual',
      status: 'Upcoming',
      meetingLink: '',
      location: '',
      notes: '',
    };
  }

  submitInterview(): void {
    if (!this.selectedApplicant) return;
    if (!this.interviewForm.date || !this.interviewForm.time) {
      this.interviewError = 'Date and time are required.';
      return;
    }
    if (this.interviewForm.type === 'Virtual' && !this.interviewForm.meetingLink) {
      this.interviewError = 'Meeting link is required for online interviews.';
      return;
    }
    if (this.interviewForm.type === 'In-person' && !this.interviewForm.location) {
      this.interviewError = 'Location is required for physical interviews.';
      return;
    }

    this.scheduling = true;
    this.interviewError = null;

    this.interviewService.createInterview(this.interviewForm).pipe(
      switchMap(() => {
        const loggedInUser = this.authSession.getLoggedInUser();
        const userId = this.authSession.getUserId(loggedInUser);
        if (!userId) {
          return of({ emailSent: false, warning: 'Could not identify recruiter.' });
        }

        return this.companyStore.getCompanyForUser(userId).pipe(
          switchMap((company) => {
            return this.recruiterService.findRecruiterByEmail(userId).pipe(
              switchMap((recruiter) => {
                const recruiterProfile = this.authSession.getAccountProfile(loggedInUser);
                const recruiterName = recruiterProfile?.name || 'Recruiter';
                const recruiterRole = recruiter?.role || '';

                return this.profileService.getProfileById(this.selectedApplicant!.candidateId).pipe(
                  switchMap((profile) =>
                    this.emailService.sendEmail({
                      email: profile.email,
                      subject: `Interview Scheduled: ${this.interviewForm.position}${company ? ` at ${company.name}` : ''}`,
                      body: this.buildInterviewNotificationBody(this.interviewForm, company?.name, recruiterName, recruiterRole),
                    }).pipe(
                      map(() => ({ emailSent: true })),
                      catchError(() => of({ emailSent: false, warning: 'Failed to send notification email.' })),
                    ),
                  ),
                  catchError(() => of({ emailSent: false, warning: 'Could not load candidate email address.' })),
                );
              }),
              catchError(() => of({ emailSent: false, warning: 'Could not load recruiter information.' })),
            );
          }),
          catchError(() => of({ emailSent: false, warning: 'Could not load company information.' })),
        );
      }),
      finalize(() => {
        this.scheduling = false;
        this.triggerViewUpdate();
      }),
    ).subscribe({
      next: (result: EmailResult) => {
        this.interviewSuccess = 'Interview scheduled successfully.';
        if (!result.emailSent) {
          this.interviewSuccess += ' ' + (result.warning ?? 'Notification email was not sent.');
        }
        this.openModal('interviewSuccessModal');
        this.closeModal('scheduleInterviewModal');
      },
      error: () => {
        this.interviewError = 'Failed to schedule interview.';
      },
    });
  }

  private buildInterviewNotificationBody(interview: InterviewUpsert, companyName?: string, recruiterName?: string, recruiterRole?: string): string {
    const lines: string[] = [
      `Hello ${interview.candidateName},`,
      '',
      `Your interview for the position of ${interview.position}${companyName ? ` at ${companyName}` : ''} has been scheduled.`,
      `Date: ${interview.date}`,
      `Time: ${interview.time}`,
      `Type: ${interview.type}`,
    ];

    if (interview.type === 'Virtual' && interview.meetingLink) {
      lines.push(`Meeting Link: ${interview.meetingLink}`);
    }

    if (interview.type === 'In-person' && interview.location) {
      lines.push(`Location: ${interview.location}`);
    }

    if (interview.notes) {
      lines.push(`Notes: ${interview.notes}`);
    }

    lines.push('', 'Please make sure to join on time and contact us if you need to reschedule.');
    if (recruiterName) {
      lines.push('', `Regards,`);
      if (recruiterRole) {
        lines.push(`${recruiterName} (${recruiterRole})`);
      } else {
        lines.push(recruiterName);
      }
    }

    return lines.join('\n');
  }

  private openModal(id: string): void {
    const modalEl = document.getElementById(id);
    if (!modalEl) return;
    const bootstrap = (window as any)?.bootstrap;
    if (!bootstrap?.Modal) return;
    const instance = bootstrap.Modal.getOrCreateInstance(modalEl);
    instance.show();
  }

  private closeModal(id: string): void {
    const modalEl = document.getElementById(id);
    if (!modalEl) return;
    const bootstrap = (window as any)?.bootstrap;
    const instance = bootstrap?.Modal?.getInstance(modalEl);
    if (instance) instance.hide();
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

  getRecommendedCandidates(): void {
    this.recommendedError = null;
    this.recommendedInfo = null;
    this.recommendedCandidates = [];
    this.expandedCandidateIndex = null;

    if (this.selectedVacancyId == null) {
      this.recommendedInfo = 'Select a vacancy first to get recommendations.';
      this.openModal('recommendedCandidatesModal');
      this.triggerViewUpdate();
      return;
    }

    this.recommendedLoading = true;
    this.openModal('recommendedCandidatesModal');
    this.triggerViewUpdate();

    this.applicationService
      .getRecommendedCandidatesForVacancy(this.selectedVacancyId, { maxResults: 10, requireAllRequiredSkills: false })
      .pipe(
        finalize(() => {
          this.recommendedLoading = false;
          this.triggerViewUpdate();
        }),
      )
      .subscribe({
        next: (candidates) => {
          this.recommendedCandidates = candidates ?? [];
          if (!this.recommendedCandidates.length) {
            this.recommendedInfo = 'No recommended candidates found.';
          }
          this.triggerViewUpdate();
        },
        error: (err) => {
          console.error(err);
          this.recommendedError =
            'Failed to fetch recommended candidates. Make sure the backend is running and SERPAPI_API_KEY is configured.';
          this.triggerViewUpdate();
        },
      });
  }

  toggleCandidateDetails(index: number): void {
    this.expandedCandidateIndex = this.expandedCandidateIndex === index ? null : index;
  }

  getCandidateDisplayName(candidate: RecommendedCandidate): string {
    return candidate.fullName?.trim() || candidate.title?.trim() || 'Candidate';
  }

  formatMatchScore(score: number | null | undefined): string {
    if (score == null || !Number.isFinite(score)) return '—';
    const pct = Math.max(0, Math.min(100, Math.round(score * 100)));
    return `${pct}%`;
  }
}
