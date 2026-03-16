import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

type UserRole = 'recruiter' | 'employee';

@Component({
  selector: 'app-complete-registration',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './complete-registration.html',
  styleUrl: './complete-registration.css',
})
export class CompleteRegistration implements OnInit {
  userName = '';
  selectedRole: UserRole | null = null;
  error = '';

  constructor(private router: Router) { }

  ngOnInit(): void {
    const pendingUser = sessionStorage.getItem('pendingGoogleUser');
    if (!pendingUser) {
      this.router.navigate(['employee-login']);
      return;
    }

    const user = JSON.parse(pendingUser);
    this.userName = user?.name ?? 'there';
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
    const userId = user?.sub ?? user?.email;

    if (!userId) {
      this.error = 'Unable to identify your account. Please sign in again.';
      sessionStorage.removeItem('pendingGoogleUser');
      this.router.navigate(['employee-login']);
      return;
    }

    localStorage.setItem(`recruitify:userRole:${userId}`, this.selectedRole);

    sessionStorage.removeItem('pendingGoogleUser');
    sessionStorage.setItem('loggedInUser', JSON.stringify({ ...user, role: this.selectedRole }));

    this.router.navigate([this.selectedRole === 'recruiter' ? 'employer-dashboard' : 'employee-dashboard']);
  }
}

