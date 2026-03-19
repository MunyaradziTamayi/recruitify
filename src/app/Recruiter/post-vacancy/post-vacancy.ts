import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';
import { AuthSessionService } from '../../auth/auth-session.service';
import { CompanyStoreService } from '../../services/company-store.service';
import { Company } from '../../models/company.model';
import { VacancyService } from '../../services/vacancy.service';
import { VacancyUpsert } from '../../services/vacancy.service';

@Component({
  selector: 'app-post-vacancy',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, RecruiterAccount],
  templateUrl: './post-vacancy.html',
  styleUrl: './post-vacancy.css',
})
export class PostVacancy implements OnInit {
  company: Company | null = null;
  isSubmitting = false;

  constructor(
    private authSession: AuthSessionService,
    private companyStore: CompanyStoreService,
    private vacancyService: VacancyService,
    private router: Router,
  ) {}

  vacancyForm = new FormGroup({
    jobTitle: new FormControl('', [Validators.required]),
    category: new FormControl('', [Validators.required]),
    location: new FormControl('', [Validators.required]),
    employmentType: new FormControl('Full-time', [Validators.required]),
    salaryRange: new FormControl(''),
    description: new FormControl('', [Validators.required]),
    requirements: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    const user = this.authSession.getLoggedInUser();
    const userId = this.authSession.getUserId(user);
    if (!userId) return;

    this.companyStore.getCompanyForUser(userId).subscribe({
      next: (company) => {
        this.company = company;
        if (!this.company) {
          this.router.navigate(['company-setup'], { queryParams: { returnUrl: '/post-vacancy' } });
        }
      },
      error: () => {
        this.router.navigate(['company-setup'], { queryParams: { returnUrl: '/post-vacancy' } });
      },
    });
  }

  onSubmit() {
    if (!this.vacancyForm.valid) {
      Object.keys(this.vacancyForm.controls).forEach((key) => {
        const control = this.vacancyForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    if (!this.company?.id) {
      this.router.navigate(['company-setup'], { queryParams: { returnUrl: '/post-vacancy' } });
      return;
    }

    const request: VacancyUpsert = {
      title: this.vacancyForm.value.jobTitle ?? '',
      category: this.vacancyForm.value.category ?? '',
      location: this.vacancyForm.value.location ?? '',
      employmentType: (this.vacancyForm.value.employmentType ?? 'Full-time') as VacancyUpsert['employmentType'],
      salaryRange: this.parseSalaryRange(this.vacancyForm.value.salaryRange),
      description: this.vacancyForm.value.description ?? '',
      requirements: this.parseRequirements(this.vacancyForm.value.requirements),
      status: 'Active',
      postedDate: new Date().toISOString(),
      companyId: this.company.id,
      applicantCount: 0,
    };

    this.isSubmitting = true;
    this.vacancyService.createVacancy(request).subscribe({
      next: () => {
        alert(`Vacancy posted successfully${this.company?.name ? ` for ${this.company.name}` : ''}!`);
        this.vacancyForm.reset({ employmentType: 'Full-time' });
        this.router.navigate(['employer-dashboard']);
      },
      error: () => {
        this.isSubmitting = false;
        alert('Failed to post vacancy. Please try again.');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  private parseRequirements(value: unknown): string[] {
    const text = typeof value === 'string' ? value : '';
    return text
      .split(/\r?\n|,/g)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  private parseSalaryRange(value: unknown): { min: number; max: number; currency: string } {
    const text = typeof value === 'string' ? value.trim() : '';
    const currencyMatch = text.match(/\b([A-Z]{3})\b/);
    const currency = currencyMatch?.[1] ?? 'USD';

    const numbers = (text.match(/(\d+(?:[.,]\d+)*)/g) ?? [])
      .map((x) => Number(x.replace(/,/g, '')))
      .filter((n) => Number.isFinite(n));

    if (numbers.length === 0) return { min: 0, max: 0, currency };
    if (numbers.length === 1) return { min: numbers[0], max: numbers[0], currency };

    const min = Math.min(numbers[0], numbers[1]);
    const max = Math.max(numbers[0], numbers[1]);
    return { min, max, currency };
  }
}
