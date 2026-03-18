import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';
import { AuthSessionService } from '../../auth/auth-session.service';
import { CompanyStoreService } from '../../services/company-store.service';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-post-vacancy',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, RecruiterAccount],
  templateUrl: './post-vacancy.html',
  styleUrl: './post-vacancy.css',
})
export class PostVacancy implements OnInit {
  company: Company | null = null;

  constructor(
    private authSession: AuthSessionService,
    private companyStore: CompanyStoreService,
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
    if (this.vacancyForm.valid) {
      const vacancyPayload = {
        ...this.vacancyForm.value,
        companyId: this.company?.id ?? null,
      };

      console.log('Vacancy Posted:', vacancyPayload);
      alert(`Vacancy posted successfully${this.company?.name ? ` for ${this.company.name}` : ''}!`);
      this.vacancyForm.reset({
        employmentType: 'Full-time'
      });
    } else {
      Object.keys(this.vacancyForm.controls).forEach(key => {
        const control = this.vacancyForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
