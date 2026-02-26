import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CvUploadComponent } from '../cv-upload/cv-upload.component';

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
  email: string;
  role: string;
  location: string;
  imageUrl: string;
}

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, CvUploadComponent, RouterLink, RouterLinkActive],
  templateUrl: './employee-dashboard.html',
  styleUrl: './employee-dashboard.css',
})
export class EmployeeDashboard implements OnInit {
  user: UserProfile = {
    name: '',
    email: '',
    role: 'Job Seeker',
    location: '',
    imageUrl: ''
  };

  constructor(private router: Router) { }

  ngOnInit(): void {
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (storedUser) {
      const googleUser = JSON.parse(storedUser);
      this.user = {
        name: googleUser.name || 'User',
        email: googleUser.email || '',
        role: 'Job Seeker',
        location: googleUser.locale || '',
        imageUrl: googleUser.picture || 'https://i.pravatar.cc/150?img=1'
      };
    } else {
      this.router.navigate(['employee-login']);
    }
  }

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

  logout(): void {
    sessionStorage.removeItem('loggedInUser');
    this.router.navigate(['employee-login']);
  }
}
