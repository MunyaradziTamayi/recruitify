declare var google: any;

import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecruiterService } from '../../services/recruiter.service';
import { ProfileService } from '../../services/profile.service';

type UserRole = 'recruiter' | 'employee';

@Component({
  selector: 'app-complete-registration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './complete-registration.html',
  styleUrl: './complete-registration.css',
})
export class CompleteRegistration implements OnInit, AfterViewInit {
  userName = '';
  selectedRole: UserRole | null = null;
  error = '';

  constructor(
    private router: Router,
    private recruiters: RecruiterService,
    private profiles: ProfileService,
  ) {}

  ngOnInit(): void {
    this.cleanupOneTap();

    const pendingUser = sessionStorage.getItem('pendingGoogleUser');
    if (!pendingUser) {
      this.router.navigate(['employee-login']);
      return;
    }

    const user = JSON.parse(pendingUser);
    this.userName = user?.name ?? 'there';
  }

  ngAfterViewInit(): void {
    // Run again after view init to catch late-mounted One Tap iframes.
    setTimeout(() => this.cleanupOneTap(), 0);
  }

  private cleanupOneTap(): void {
    try {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        google.accounts.id.cancel();
      }
    } catch {
      // ignore
    }

    const selectors = [
      'div.g_id_prompt',
      '#credential_picker_container',
      '#g_id_onload',
      'iframe[src*="accounts.google.com/gsi"]',
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => el.remove());
    });
  }

  chooseRole(role: UserRole) {
    this.selectedRole = role;
    this.error = '';
  }

  continue() {
    if (!this.selectedRole) {
      this.error = 'Please select a role to continue.';
      return;
    }

    const pendingUserRaw = sessionStorage.getItem('pendingGoogleUser');
    if (!pendingUserRaw) {
      this.router.navigate(['employee-login']);
      return;
    }

    const user = JSON.parse(pendingUserRaw);
    const email = user?.email;
    const userId = email ?? user?.sub;

    if (!userId) {
      this.error = 'Unable to identify your account. Please sign in again.';
      sessionStorage.removeItem('pendingGoogleUser');
      this.router.navigate(['employee-login']);
      return;
    }

    const name = typeof user?.name === 'string' ? user.name.trim() : '';
    const parts = name.split(/\s+/g).filter(Boolean);
    const firstName = parts[0] ?? 'Recruiter';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'User';

    if (this.selectedRole === 'recruiter') {
      if (typeof email !== 'string' || !email.trim()) {
        this.error = 'A valid email is required to create your recruiter account.';
        return;
      }

      this.recruiters.findRecruiterByEmail(email).subscribe({
        next: (existing) => {
          if (existing?.id) {
            sessionStorage.removeItem('pendingGoogleUser');
            sessionStorage.setItem('loggedInUser', JSON.stringify({ ...user, role: 'recruiter', recruiterId: existing.id }));
            this.router.navigate(['company-setup']);
            return;
          }

          this.recruiters
            .createRecruiter({
              firstName,
              lastName,
              email: email.trim(),
              phone: '',
              role: 'recruiter',
              avatarUrl: typeof user?.picture === 'string' ? user.picture : '',
              companyId: null,
              createdAt: new Date().toISOString(),
              notificationPreferences: {
                newApplications: true,
                interviewReminders: true,
                weeklyDigest: true,
                marketingEmails: false,
              },
            })
            .subscribe({
              next: (created) => {
                sessionStorage.removeItem('pendingGoogleUser');
                sessionStorage.setItem(
                  'loggedInUser',
                  JSON.stringify({ ...user, role: 'recruiter', recruiterId: created.id ?? null }),
                );
                this.router.navigate(['company-setup']);
              },
              error: () => {
                this.error = 'Failed to create recruiter account. Please try again.';
              },
            });
        },
        error: () => {
          this.error = 'Failed to complete registration. Please try again.';
        },
      });
      return;
    }

    if (typeof email !== 'string' || !email.trim()) {
      this.error = 'A valid email is required to create your employee profile.';
      return;
    }

    this.profiles.findProfileByEmail(email).subscribe({
      next: (existing) => {
        if (existing?.id) {
          sessionStorage.removeItem('pendingGoogleUser');
          sessionStorage.setItem('loggedInUser', JSON.stringify({ ...user, role: 'employee', profileId: existing.id }));
          this.router.navigate(['employee-dashboard']);
          return;
        }

        this.profiles
          .createProfile({
            name: name || 'User',
            email: email.trim(),
            phone: '',
            address: '',
            objectives: null,
            lookingForJob: null,
            desiredJobTitle: null,
            desiredCategory: null,
            preferredWorkMode: null,
            preferredLocation: null,
            salaryMin: null,
            salaryMax: null,
            salaryCurrency: null,
            skills: [],
            experiences: [],
            educations: [],
          })
          .subscribe({
            next: (created) => {
              sessionStorage.removeItem('pendingGoogleUser');
              sessionStorage.setItem('loggedInUser', JSON.stringify({ ...user, role: 'employee', profileId: created.id }));
              this.router.navigate(['employee-dashboard']);
            },
            error: () => {
              this.error = 'Failed to create employee profile. Please try again.';
            },
          });
      },
      error: () => {
        this.error = 'Failed to complete registration. Please try again.';
      },
    });
  }
}
