import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';

@Component({
  selector: 'app-employer-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RecruiterAccount],
  templateUrl: './employer-settings.html',
  styleUrl: './employer-settings.css',
})
export class EmployerSettings {
  activeTab: 'profile' | 'notifications' | 'security' | 'team' = 'profile';

  userProfile = {
    firstName: 'John',
    lastName: 'Recruiter',
    email: 'john.recruiter@techflow.io',
    phone: '+1 (555) 123-4567',
    role: 'HR Manager',
    avatar: 'https://i.pravatar.cc/150?img=33'
  };

  notificationSettings = {
    newApplications: true,
    interviewReminders: true,
    weeklyDigest: false,
    marketingEmails: false
  };

  teamMembers = [
    { name: 'Sarah Wilson', role: 'Talent Acquisition', email: 'sarah.w@techflow.io', status: 'Active' },
    { name: 'Michael Lee', role: 'Technical Recruiter', email: 'michael.l@techflow.io', status: 'Active' },
    { name: 'Emily Davis', role: 'HR Coordinator', email: 'emily.d@techflow.io', status: 'Pending' }
  ];

  setTab(tab: 'profile' | 'notifications' | 'security' | 'team') {
    this.activeTab = tab;
  }

  saveSettings() {
    alert('Settings saved successfully!');
  }
}
