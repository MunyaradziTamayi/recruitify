import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthSessionService, AccountProfile } from '../../../auth/auth-session.service';

@Component({
  selector: 'app-recruiter-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recruiter-account.html',
  styleUrl: './recruiter-account.css',
})
export class RecruiterAccount implements OnInit {
  profile: AccountProfile | null = null;

  constructor(
    private authSession: AuthSessionService,
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

    this.profile = this.authSession.getAccountProfile(user);
  }

  logout() {
    this.authSession.logout();
    this.router.navigate(['employee-login']);
  }
}

