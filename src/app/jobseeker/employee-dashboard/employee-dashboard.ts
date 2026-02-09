import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  logo: string;
  timePosted: string;
  type: string;
  applicants: number;
  isVerified: boolean;
  isSaved: boolean;
}

interface UserProfile {
  name: string;
  role: string;
  location: string;
  imageUrl: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard {
  user: UserProfile = {
    name: 'Anna Wilson',
    role: 'UX/UI Designer',
    location: 'Atlanta, GA',
    imageUrl: 'https://i.pravatar.cc/150?img=1' // Placeholder
  };

  filters = {
    experienceLevel: [
      { name: 'Entry level', count: 23, checked: false },
      { name: 'Intermediate', count: 49, checked: false },
      { name: 'Expert', count: 31, checked: true }
    ],
    jobLocation: 'Remotely',
    jobType: [
      { name: 'Full time', count: 72, checked: false },
      { name: 'Part time', count: 24, checked: false }
    ]
  };

  activeTags = ['Design', 'Expert', 'Remotely'];

  jobs: Job[] = [
    {
      id: 1,
      title: 'UX Design Co-op',
      company: 'MOTOROLA SOLUTIONS',
      location: 'CHICAGO, IL',
      logo: 'assets/motorola-logo.png', // Placeholder
      timePosted: '3 days ago',
      type: 'full time',
      applicants: 21,
      isVerified: true,
      isSaved: true
    },
    {
      id: 2,
      title: 'Digital Product Designer UI/UX',
      company: 'PHOENIX',
      location: 'SAN FRANCISCO, CA',
      logo: 'assets/phoenix-logo.png', // Placeholder
      timePosted: '3 days ago',
      type: 'part time',
      applicants: 19,
      isVerified: true,
      isSaved: true
    },
    {
      id: 3,
      title: 'UI/UX Designer (Web Designer)',
      company: 'AYA HEALTHCARE',
      location: 'SAN DIEGO, CA',
      logo: 'assets/aya-logo.png', // Placeholder
      timePosted: '2 days ago',
      type: 'part time',
      applicants: 12,
      isVerified: true,
      isSaved: false
    }
  ];

  selectedJob: Job | null = this.jobs[1]; // Default selection

  selectJob(job: Job) {
    this.selectedJob = job;
  }

  toggleSave(job: Job) {
    job.isSaved = !job.isSaved;
  }

  removeTag(tag: string) {
    this.activeTags = this.activeTags.filter(t => t !== tag);
  }

  get savedJobsCount(): number {
    return this.jobs.filter(job => job.isSaved).length;
  }
}
