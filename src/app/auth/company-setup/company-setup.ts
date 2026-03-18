import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthSessionService } from '../auth-session.service';
import { CompanyStoreService } from '../../services/company-store.service';
import { Company } from '../../models/company.model';

type CompanySetupForm = {
  name: FormControl<string>;
  logoUrl: FormControl<string>;
  industry: FormControl<string>;
  size: FormControl<string>;
  website: FormControl<string>;
  location: FormControl<string>;
  description: FormControl<string>;
  culture: FormControl<string>;
  benefitsRaw: FormControl<string>;
  linkedin: FormControl<string>;
  twitter: FormControl<string>;
  facebook: FormControl<string>;
};

@Component({
  selector: 'app-company-setup',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './company-setup.html',
  styleUrl: './company-setup.css',
})
export class CompanySetup implements OnInit {
  error = '';
  private userId: string | null = null;
  private returnUrl = '/employer-dashboard';
  existingCompany: Company | null = null;

  form = new FormGroup<CompanySetupForm>({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    logoUrl: new FormControl('', { nonNullable: true }),
    industry: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    size: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    website: new FormControl('', { nonNullable: true }),
    location: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    culture: new FormControl('', { nonNullable: true }),
    benefitsRaw: new FormControl('', { nonNullable: true }),
    linkedin: new FormControl('', { nonNullable: true }),
    twitter: new FormControl('', { nonNullable: true }),
    facebook: new FormControl('', { nonNullable: true }),
  });

  constructor(
    private authSession: AuthSessionService,
    private companyStore: CompanyStoreService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const user = this.authSession.getLoggedInUser();
    if (!user) {
      this.router.navigate(['employee-login']);
      return;
    }

    if (user.role && user.role !== 'recruiter') {
      this.router.navigate(['employee-dashboard']);
      return;
    }

    this.userId = this.authSession.getUserId(user);
    if (!this.userId) {
      this.authSession.logout();
      this.router.navigate(['employee-login']);
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) this.returnUrl = returnUrl;

    this.companyStore.getCompanyForUser(this.userId).subscribe({
      next: (existing) => {
        this.existingCompany = existing;

        if (existing) {
          this.form.patchValue({
            name: existing.name,
            logoUrl: existing.logoUrl,
            industry: existing.industry,
            size: existing.size,
            website: existing.website,
            location: existing.location,
            description: existing.description,
            culture: existing.culture,
            benefitsRaw: existing.benefits?.join('\n') ?? '',
            linkedin: existing.socialLinks?.linkedin ?? '',
            twitter: existing.socialLinks?.twitter ?? '',
            facebook: existing.socialLinks?.facebook ?? '',
          });
        }
      },
      error: () => {
        this.error = 'Failed to load company details. Please try again.';
      },
    });
  }

  logout(): void {
    this.authSession.logout();
    this.router.navigate(['employee-login']);
  }

  saveAndContinue(): void {
    this.error = '';

    if (!this.userId) {
      this.error = 'Please sign in again.';
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error = 'Please fill in the required company details.';
      return;
    }

    const name = this.form.controls.name.value.trim();
    const logoUrlInput = this.form.controls.logoUrl.value.trim();
    const industry = this.form.controls.industry.value.trim();
    const size = this.form.controls.size.value.trim();
    const website = this.form.controls.website.value.trim();
    const location = this.form.controls.location.value.trim();
    const description = this.form.controls.description.value.trim();
    const culture = this.form.controls.culture.value.trim();
    const benefitsRaw = this.form.controls.benefitsRaw.value;

    const linkedin = this.form.controls.linkedin.value.trim();
    const twitter = this.form.controls.twitter.value.trim();
    const facebook = this.form.controls.facebook.value.trim();

    const benefits = benefitsRaw
      .split(/[\n,]+/g)
      .map((value) => value.trim())
      .filter((value) => Boolean(value));

    const socialLinks =
      linkedin || twitter || facebook
        ? {
            linkedin: linkedin || undefined,
            twitter: twitter || undefined,
            facebook: facebook || undefined,
          }
        : undefined;

    const company: Company = {
      ...(this.existingCompany?.id ? { id: this.existingCompany.id } : {}),
      name,
      logoUrl: logoUrlInput || this.companyStore.buildDefaultLogoUrl(name),
      industry,
      size,
      website,
      location,
      description,
      culture,
      benefits,
      socialLinks,
    };

    this.companyStore.saveCompanyForUser(this.userId, company).subscribe({
      next: () => this.router.navigateByUrl(this.returnUrl),
      error: () => {
        this.error = 'Failed to save company details. Please try again.';
      },
    });
  }
}
