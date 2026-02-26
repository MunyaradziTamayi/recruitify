import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  logo: string;
  timePosted: string;
  type: string;
  salary: string;
  description: string;
  tags: string[];
  isSaved: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  imageUrl: string;
}

@Component({
  selector: 'app-browse-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './browse-jobs.html',
  styleUrl: './browse-jobs.css',
})
export class BrowseJobs implements OnInit {
  user: UserProfile = {
    name: '',
    email: '',
    imageUrl: ''
  };

  searchQuery: string = '';
  selectedCategory: string = 'All';
  categories: string[] = ['All', 'Design', 'Development', 'Marketing', 'Sales', 'Management'];

  jobs: Job[] = [
    {
      id: 1,
      title: 'Senior UX Designer',
      company: 'TechFlow',
      location: 'Remote',
      logo: 'https://cdn-icons-png.flaticon.com/512/281/281764.png',
      timePosted: '2 hours ago',
      type: 'Full-time',
      salary: '$120k - $150k',
      description: 'We are looking for a Senior UX Designer to lead our product design team...',
      tags: ['Design', 'Remote', 'Senior'],
      isSaved: false
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      company: 'InnovateIO',
      location: 'San Francisco, CA',
      logo: 'https://cdn-icons-png.flaticon.com/512/5968/5968322.png',
      timePosted: '5 hours ago',
      type: 'Full-time',
      salary: '$140k - $180k',
      description: 'Join our core engineering team to build the next generation of SaaS tools...',
      tags: ['Development', 'SaaS', 'Node.js'],
      isSaved: true
    },
    {
      id: 3,
      title: 'Product Manager',
      company: 'SkyNet',
      location: 'Austin, TX',
      logo: 'https://cdn-icons-png.flaticon.com/512/732/732190.png',
      timePosted: '1 day ago',
      type: 'Contract',
      salary: '$80 - $100 /hr',
      description: 'Deliver high-quality product features from conception to launch...',
      tags: ['Management', 'Agile', 'Product'],
      isSaved: false
    },
    {
      id: 4,
      title: 'Brand Designer',
      company: 'CreativeCo',
      location: 'New York, NY',
      logo: 'https://cdn-icons-png.flaticon.com/512/732/732221.png',
      timePosted: '2 days ago',
      type: 'Part-time',
      salary: '$50k - $70k',
      description: 'Help us define the visual identity of our brand and marketing materials...',
      tags: ['Design', 'Branding', 'Junior'],
      isSaved: false
    }
  ];

  filteredJobs: Job[] = [];

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
    this.filterJobs();
  }

  filterJobs() {
    this.filteredJobs = this.jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.selectedCategory === 'All' || job.tags.includes(this.selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }

  toggleSave(job: Job) {
    job.isSaved = !job.isSaved;
  }

  logout(): void {
    sessionStorage.removeItem('loggedInUser');
    this.router.navigate(['employee-login']);
  }
}
