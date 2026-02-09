import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface DashboardStats {
  totalVacancies: number;
  activeApplications: number;
  interviewsScheduled: number;
  hiredThisMonth: number;
}

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

interface Applicant {
  id: number;
  name: string;
  position: string;
  appliedDate: string;
  status: 'pending' | 'reviewed' | 'interview' | 'rejected' | 'hired';
  avatar: string;
}

@Component({
  selector: 'app-employer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './employer-dashboard.html',
  styleUrl: './employer-dashboard.css',
})
export class EmployerDashboard {
  stats: DashboardStats = {
    totalVacancies: 12,
    activeApplications: 48,
    interviewsScheduled: 8,
    hiredThisMonth: 3
  };

  recentVacancies: Vacancy[] = [
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
    }
  ];

  recentApplications: Applicant[] = [
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
    }
  ];

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'bg-warning',
      'reviewed': 'bg-info',
      'interview': 'bg-primary',
      'rejected': 'bg-danger',
      'hired': 'bg-success',
      'active': 'bg-success',
      'closed': 'bg-secondary',
      'draft': 'bg-secondary'
    };
    return statusClasses[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }
}
