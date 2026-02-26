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
    return atob(token.split('.')[1]);
  }

  handleLogin(response: any) {
    if (response != null && response != undefined) {
      const user_object = JSON.parse(this.decodeToken(response.credential));
      sessionStorage.setItem('loggedInUser', JSON.stringify(user_object));
      this.router.navigate(['employee-dashboard']);
    } else {
      console.log('Failed to authenticate');
    }
  }
}
