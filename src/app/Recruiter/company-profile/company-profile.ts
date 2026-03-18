import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';
import { Company } from '../../models/company.model';
import { AuthSessionService } from '../../auth/auth-session.service';
import { CompanyStoreService } from '../../services/company-store.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RecruiterAccount],
  templateUrl: './company-profile.html',
  styleUrl: './company-profile.css',
})
export class CompanyProfile implements OnInit {
  company: Company | null = null;
  benefitsRaw = '';
  private userId: string | null = null;

  isEditing = false;

  constructor(
    private authSession: AuthSessionService,
    private companyStore: CompanyStoreService,
    private router: Router,
  ) { }

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

    this.companyStore.getCompanyForUser(this.userId).subscribe({
      next: (company) => {
        if (!company) {
          this.router.navigate(['company-setup'], { queryParams: { returnUrl: '/company-profile' } });
          return;
        }

        this.company = company;
        this.benefitsRaw = company.benefits?.join('\n') ?? '';
      },
      error: () => {
        this.router.navigate(['company-setup'], { queryParams: { returnUrl: '/company-profile' } });
      },
    });
  }

  toggleEdit() {
    if (!this.company) return;

    if (this.isEditing) {
      const benefits = this.benefitsRaw
        .split(/[\n,]+/g)
        .map((value) => value.trim())
        .filter((value) => Boolean(value));

      const name = this.company.name.trim();
      const updated: Company = {
        ...this.company,
        name,
        logoUrl: this.company.logoUrl?.trim()
          ? this.company.logoUrl.trim()
          : this.companyStore.buildDefaultLogoUrl(name),
        benefits,
      };

      this.companyStore.saveCompanyForUser(this.userId ?? 'unknown', updated).subscribe({
        next: (saved) => {
          this.company = saved;
          alert('Profile updated successfully!');
        },
        error: () => {
          alert('Failed to update company profile. Please try again.');
        },
      });
    } else {
      this.benefitsRaw = this.company.benefits?.join('\n') ?? '';
    }

    this.isEditing = !this.isEditing;
  }

  getWebsiteHref(website: string): string {
    const trimmed = website.trim();
    if (!trimmed) return '#';
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  }
}
