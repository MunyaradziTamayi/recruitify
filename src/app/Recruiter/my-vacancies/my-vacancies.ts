import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Vacancy {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  postedDate: string;
  applicants: number;
  status: 'active' | 'closed' | 'draft';
}

@Component({
  selector: 'app-my-vacancies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-vacancies.html',
  styleUrl: './my-vacancies.css',
})
export class MyVacancies {
  vacancies: Vacancy[] = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      postedDate: '2 days ago',
      applicants: 24,
      status: 'active'
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'San Francisco, CA',
      type: 'Full-time',
      postedDate: '5 days ago',
      applicants: 18,
      status: 'active'
    },
    {
      id: 3,
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      type: 'Full-time',
      postedDate: '1 week ago',
      applicants: 31,
      status: 'active'
    },
    {
      id: 4,
      title: 'Backend Engineer (Node.js)',
      department: 'Engineering',
      location: 'Cape Town, SA',
      type: 'Contract',
      postedDate: '2 weeks ago',
      applicants: 12,
      status: 'closed'
    },
    {
      id: 5,
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Remote',
      type: 'Part-time',
      postedDate: '3 weeks ago',
      applicants: 0,
      status: 'draft'
    }
  ];

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'active': 'bg-success',
      'closed': 'bg-secondary',
      'draft': 'bg-warning text-dark'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
