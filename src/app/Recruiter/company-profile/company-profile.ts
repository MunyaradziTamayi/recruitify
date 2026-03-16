import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';

@Component({
  selector: 'app-company-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RecruiterAccount],
  templateUrl: './company-profile.html',
  styleUrl: './company-profile.css',
})
export class CompanyProfile {
  company = {
    name: 'TechFlow Solutions',
    logo: 'https://ui-avatars.com/api/?name=TechFlow&background=0D6EFD&color=fff&size=128',
    industry: 'Technology & Software',
    size: '100-500 Employees',
    website: 'www.techflow.io',
    location: 'San Francisco, CA',
    description: 'TechFlow Solutions is a leading provider of innovative software solutions for the modern enterprise. We specialize in cloud infrastructure, AI-driven analytics, and seamless user experiences.',
    culture: 'We foster a culture of innovation, collaboration, and continuous learning. Our team is passionate about building products that make a difference.',
    benefits: [
      'Flexible working hours',
      'Remote-first approach',
      'Health & Wellness programs',
      'Professional development budget',
      'Competitive equity packages'
    ]
  };

  isEditing = false;

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      alert('Profile updated successfully!');
    }
  }
}
