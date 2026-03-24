declare var google: any;

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RecruiterService } from '../../services/recruiter.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-employee-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-login.html',
  styleUrl: './employee-login.css',
})
export class EmployeeLogin implements OnInit {

  constructor(
    private router: Router,
    private recruiters: RecruiterService,
    private profiles: ProfileService,
  ) {}

  ngOnInit(): void {
    this.tryInitGoogle();
  }

  private tryInitGoogle(retries = 20): void {
    if (typeof google === 'undefined' || !google?.accounts?.id) {
      if (retries > 0) {
        setTimeout(() => this.tryInitGoogle(retries - 1), 250);
      }
      return;
    }

    google.accounts.id.initialize({
      client_id: '146794311153-fok9cje9nm7c8q1m3aie85i8s2u3rp5b.apps.googleusercontent.com',
      callback: (resp: any) => {
        this.handleLogin(resp);
      }
    });

    const buttonEl = document.getElementById('login_button');
    if (buttonEl) {
      google.accounts.id.renderButton(buttonEl, {
        color: 'filled_blue',
        size: 'large',
        shape: 'rectangular',
        width: 330
      });
    }
  }

  private decodeToken(token: string) {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    return atob(padded);
  }

  handleLogin(response: any) {
    if (response != null && response != undefined) {
      const user_object = JSON.parse(this.decodeToken(response.credential));

      const email = typeof user_object?.email === 'string' ? user_object.email.trim() : '';
      if (!email) {
        sessionStorage.setItem('pendingGoogleUser', JSON.stringify(user_object));
        this.router.navigate(['complete-registration']);
        return;
      }

      this.recruiters.findRecruiterByEmail(email).subscribe({
        next: (recruiter) => {
          if (recruiter?.id) {
            sessionStorage.setItem('loggedInUser', JSON.stringify({ ...user_object, role: 'recruiter', recruiterId: recruiter.id }));
            this.router.navigate(['employer-dashboard']);
            return;
          }

          this.profiles.findProfileByEmail(email).subscribe({
            next: (profile) => {
              if (profile?.id) {
                sessionStorage.setItem('loggedInUser', JSON.stringify({ ...user_object, role: 'employee', profileId: profile.id }));
                this.router.navigate(['employee-dashboard']);
                return;
              }

              sessionStorage.setItem('pendingGoogleUser', JSON.stringify(user_object));
              this.router.navigate(['complete-registration']);
            },
            error: () => {
              sessionStorage.setItem('pendingGoogleUser', JSON.stringify(user_object));
              this.router.navigate(['complete-registration']);
            },
          });
        },
        error: () => {
          sessionStorage.setItem('pendingGoogleUser', JSON.stringify(user_object));
          this.router.navigate(['complete-registration']);
        },
      });
    } else {
      console.log('Failed to authenticate');
    }
  }
}
