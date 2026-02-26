import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CvUploadComponent } from '../cv-upload/cv-upload.component';

interface Experience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  year: string;
}

interface UserProfile {
  name: string;
  email: string;
  role: string;
  location: string;
  imageUrl: string;
  bio: string;
  phone: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}

@Component({
  selector: 'app-employee-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, CvUploadComponent],
  templateUrl: './employee-profile.html',
  styleUrl: './employee-profile.css',
})
export class EmployeeProfile implements OnInit {
  user: UserProfile = {
    name: '',
    email: '',
    role: 'Senior Product Designer',
    location: 'San Francisco, CA',
    imageUrl: '',
    bio: 'Passionate Product Designer with 5+ years of experience in creating user-centered designs for web and mobile applications. Expertise in UX research, wireframing, and visual design.',
    phone: '+1 (555) 123-4567',
    skills: ['UI DESIGN', 'UX RESEARCH', 'FIGMA', 'ADOBE XD', 'HTML/CSS', 'PROTOTYPING', 'USER TESTING'],
    experience: [
      {
        company: 'Creative Solutions',
        role: 'Senior Product Designer',
        duration: '2020 - Present',
        description: 'Led the design of multiple B2B and B2C products, improving user engagement by 40%.'
      },
      {
        company: 'Design Hub',
        role: 'UX Designer',
        duration: '2017 - 2020',
        description: 'Collaborated with cross-functional teams to deliver high-quality design solutions.'
      }
    ],
    education: [
      {
        school: 'University of Arts',
        degree: 'Bachelor of Design',
        year: '2013 - 2017'
      }
    ]
  };

  profileStrength: number = 0;

  constructor(private router: Router) { }

  ngOnInit(): void {
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (storedUser) {
      const googleUser = JSON.parse(storedUser);
      this.user.name = googleUser.name || 'User';
      this.user.email = googleUser.email || '';
      this.user.imageUrl = googleUser.picture || 'https://i.pravatar.cc/150?img=1';

      this.loadExtractedProfile();
      this.calculateProfileStrength();
    } else {
      this.router.navigate(['employee-login']);
    }
  }

  loadExtractedProfile() {
    const extractedData = sessionStorage.getItem('extractedProfile');
    if (extractedData) {
      const profile = JSON.parse(extractedData);

      // Update phone and location if present
      if (profile.phone) this.user.phone = profile.phone;
      if (profile.address) this.user.location = profile.address;

      // Update bio if objectives are present
      if (profile.objectives) this.user.bio = profile.objectives;

      // Update skills
      if (profile.skills && profile.skills.length > 0) {
        this.user.skills = profile.skills.map((s: string) => s.toUpperCase());
      }

      // Update experience
      if (profile.experiences && profile.experiences.length > 0) {
        this.user.experience = profile.experiences.map((exp: any) => ({
          company: exp.company,
          role: exp.jobTitle,
          duration: `${exp.startDate} - ${exp.endDate || 'Present'}`,
          description: exp.description
        }));

        // Update current role based on latest experience
        if (this.user.experience.length > 0) {
          this.user.role = this.user.experience[0].role;
        }
      }

      // Update education
      if (profile.educations && profile.educations.length > 0) {
        this.user.education = profile.educations.map((edu: any) => ({
          school: edu.institution,
          degree: edu.degree,
          year: edu.graduationYear
        }));
      }
    }
  }

  // Method to be called after CV upload modal closes or via event
  refreshProfile() {
    this.loadExtractedProfile();
    this.calculateProfileStrength();
  }

  calculateProfileStrength() {
    let strength = 0;
    if (this.user.name) strength += 10;
    if (this.user.email) strength += 10;
    if (this.user.imageUrl) strength += 10;
    if (this.user.bio) strength += 20;
    if (this.user.skills.length > 0) strength += 20;
    if (this.user.experience.length > 0) strength += 20;
    if (this.user.education.length > 0) strength += 10;
    this.profileStrength = strength;
  }

  logout(): void {
    sessionStorage.removeItem('loggedInUser');
    this.router.navigate(['employee-login']);
  }
}
