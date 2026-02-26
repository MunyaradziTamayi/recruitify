import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface Application {
  id: number;
  jobTitle: string;
  company: string;
  logo: string;
  appliedDate: string;
  status: 'Pending' | 'Interview' | 'Rejected' | 'Offered';
  location: string;
  type: string;
}

interface UserProfile {
  name: string;
  email: string;
  imageUrl: string;
}

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './my-applications.html',
  styleUrl: './my-applications.css',
})
export class MyApplications implements OnInit {
  user: UserProfile = {
    name: '',
    email: '',
    imageUrl: ''
  };

  applications: Application[] = [
    {
      id: 1,
      jobTitle: 'Senior UX Designer',
      company: 'TechFlow',
      logo: 'https://cdn-icons-png.flaticon.com/512/281/281764.png',
      appliedDate: 'Oct 12, 2023',
      status: 'Interview',
      location: 'Remote',
      type: 'Full-time'
    },
    {
      id: 2,
      jobTitle: 'Full Stack Developer',
      company: 'InnovateIO',
      logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968322.png',
      appliedDate: 'Oct 10, 2023',
      status: 'Pending',
      location: 'San Francisco, CA',
      type: 'Full-time'
    },
    {
      id: 3,
      jobTitle: 'Product Manager',
      company: 'SkyNet',
      logo: 'https://cdn-icons-png.flaticon.com/512/732/732190.png',
      appliedDate: 'Oct 05, 2023',
      status: 'Rejected',
      location: 'Austin, TX',
      type: 'Contract'
    },
    {
      id: 4,
      jobTitle: 'UI/UX Designer',
      company: 'CreativeCo',
      logo: 'https://cdn-icons-png.flaticon.com/512/732/732221.png',
      appliedDate: 'Sep 28, 2023',
      status: 'Offered',
      location: 'New York, NY',
      type: 'Part-time'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (storedUser) {
      const googleUser = JSON.parse(storedUser);
      this.user = {
        name: googleUser.name || 'User',
        email: googleUser.email || '',
        imageUrl: googleUser.picture || 'https://i.pravatar.cc/150?img=1'
      };
    } else {
      this.router.navigate(['employee-login']);
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Interview': return 'status-interview';
      case 'Pending': return 'status-pending';
      case 'Rejected': return 'status-rejected';
      case 'Offered': return 'status-offered';
      default: return '';
    }
  }

  logout(): void {
    sessionStorage.removeItem('loggedInUser');
    this.router.navigate(['employee-login']);
  }
}
