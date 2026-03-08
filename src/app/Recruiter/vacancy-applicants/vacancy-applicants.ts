import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Applicant {
  id: number;
  name: string;
  position: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'hired';
  avatar: string;
}

@Component({
  selector: 'app-vacancy-applicants',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vacancy-applicants.html',
  styleUrl: './vacancy-applicants.css',
})
export class VacancyApplicants {
  applicants: Applicant[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      position: 'Senior Frontend Developer',
      appliedDate: '2 hours ago',
      status: 'pending',
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    {
      id: 2,
      name: 'Michael Chen',
      position: 'UX/UI Designer',
      appliedDate: '5 hours ago',
      status: 'reviewed',
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      position: 'Product Manager',
      appliedDate: '1 day ago',
      status: 'interview',
      avatar: 'https://i.pravatar.cc/150?img=9'
    },
    {
      id: 4,
      name: 'David Kim',
      position: 'Senior Frontend Developer',
      appliedDate: '1 day ago',
      status: 'reviewed',
      avatar: 'https://i.pravatar.cc/150?img=14'
    },
    {
      id: 5,
      name: 'Jessica Taylor',
      position: 'UX/UI Designer',
      appliedDate: '2 days ago',
      status: 'pending',
      avatar: 'https://i.pravatar.cc/150?img=20'
    },
    {
      id: 6,
      name: 'Robert Wilson',
      position: 'Senior Frontend Developer',
      appliedDate: '3 days ago',
      status: 'rejected',
      avatar: 'https://i.pravatar.cc/150?img=11'
    },
    {
      id: 7,
      name: 'Alice Brown',
      position: 'Product Manager',
      appliedDate: '4 days ago',
      status: 'hired',
      avatar: 'https://i.pravatar.cc/150?img=16'
    }
  ];

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'bg-warning',
      'reviewed': 'bg-info',
      'interview': 'bg-primary',
      'rejected': 'bg-danger',
      'hired': 'bg-success'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
