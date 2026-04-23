declare var google: any;

import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RecruiterService } from '../../services/recruiter.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-employee-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-login.html',
  styleUrl: './employee-login.css',
})
export class EmployeeLogin implements OnInit, OnDestroy {
  isProcessing = false;
  authError = '';
  processingMessage = 'Checking your account...';
  private readonly authRetryDelayMs = 3000;
  private readonly authRetryTimeoutMs = 70000;

  constructor(
    private router: Router,
    private recruiters: RecruiterService,
    private profiles: ProfileService,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.tryInitGoogle();
  }

  ngOnDestroy(): void {
    try {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        // Ensure any One Tap/overlay is removed when leaving the login page.
        google.accounts.id.cancel();
        google.accounts.id.disableAutoSelect();
      }
    } catch {
      // ignore
    }
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
        this.ngZone.run(() => this.handleLogin(resp));
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
    if (response == null) {
      console.log('Failed to authenticate');
      return;
    }

    void this.completeGoogleLogin(response);
  }

  private async completeGoogleLogin(response: any): Promise<void> {
    const user_object = JSON.parse(this.decodeToken(response.credential));

    this.isProcessing = true;
    this.authError = '';
    this.processingMessage = 'Checking your account...';

    try {
      if (typeof google !== 'undefined' && google?.accounts?.id) {
        google.accounts.id.cancel();
      }
    } catch {
      // ignore
    }

    const email = typeof user_object?.email === 'string' ? user_object.email.trim() : '';
    if (!email) {
      sessionStorage.setItem('pendingGoogleUser', JSON.stringify(user_object));
      await this.router.navigate(['complete-registration']);
      return;
    }

    try {
      const recruiter = await this.retryUntilAvailable(
        () => firstValueFrom(this.recruiters.findRecruiterByEmail(email)),
        'Checking whether this is a recruiter account...',
      );

      if (recruiter?.id) {
        sessionStorage.setItem('loggedInUser', JSON.stringify({ ...user_object, role: 'recruiter', recruiterId: recruiter.id }));
        await this.router.navigate(['employer-dashboard']);
        return;
      }

      const profile = await this.retryUntilAvailable(
        () => firstValueFrom(this.profiles.findProfileByEmail(email, false)),
        'Checking your employee profile...',
      );

      if (profile?.id) {
        sessionStorage.setItem('loggedInUser', JSON.stringify({ ...user_object, role: 'employee', profileId: profile.id }));
        await this.router.navigate(['employee-dashboard']);
        return;
      }

      sessionStorage.setItem('pendingGoogleUser', JSON.stringify(user_object));
      await this.router.navigate(['complete-registration']);
    } catch {
      this.authError = 'The server is still waking up. Please wait a moment and try again.';
      this.isProcessing = false;
    }
  }

  private async retryUntilAvailable<T>(
    requestFactory: () => Promise<T>,
    message: string,
  ): Promise<T> {
    this.processingMessage = message;
    const startedAt = Date.now();
    let lastError: unknown;

    while (Date.now() - startedAt < this.authRetryTimeoutMs) {
      try {
        return await requestFactory();
      } catch (error) {
        lastError = error;
        this.processingMessage = 'Waking up the server. This can take up to a minute...';
        await this.delay(this.authRetryDelayMs);
      }
    }

    throw lastError ?? new Error('Authentication timed out');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
