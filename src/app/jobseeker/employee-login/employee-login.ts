declare var google: any;

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employee-login.html',
  styleUrl: './employee-login.css',
})
export class EmployeeLogin implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: '146794311153-fok9cje9nm7c8q1m3aie85i8s2u3rp5b.apps.googleusercontent.com',
      callback: (resp: any) => {
        this.handleLogin(resp);
      }
    });

    google.accounts.id.renderButton(document.getElementById('login_button'), {
      color: 'filled_blue',
      size: 'large',
      shape: 'rectangular',
      width: 330
    });
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

      const userId = user_object?.sub ?? user_object?.email;
      const storedRole = userId ? (localStorage.getItem(`recruitify:userRole:${userId}`) as any) : null;

      if (storedRole === 'recruiter' || storedRole === 'employee') {
        sessionStorage.setItem('loggedInUser', JSON.stringify({ ...user_object, role: storedRole }));
        this.router.navigate([storedRole === 'recruiter' ? 'employer-dashboard' : 'employee-dashboard']);
        return;
      }

      sessionStorage.setItem('pendingGoogleUser', JSON.stringify(user_object));
      this.router.navigate(['complete-registration']);
    } else {
      console.log('Failed to authenticate');
    }
  }
}
