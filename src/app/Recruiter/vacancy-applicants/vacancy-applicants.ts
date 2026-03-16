import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';
import { Application } from '../../models/application.model';

@Component({
  selector: 'app-vacancy-applicants',
  standalone: true,
  imports: [CommonModule, RouterModule, RecruiterAccount],
  templateUrl: './vacancy-applicants.html',
  styleUrl: './vacancy-applicants.css',
})
export class VacancyApplicants {
  applications: Application[] = [
    {
      id: 1,
      vacancyId: 101,
      candidateId: 1001,
      candidateName: 'Sarah Johnson',
      candidateAvatar: 'https://i.pravatar.cc/150?img=5',
      appliedDate: '2 hours ago',
      status: 'New',
      resumeUrl: '#',
      coverLetter: 'Excited to apply for this role. I have 6+ years building Angular apps.',
      position: 'Senior Frontend Developer',
    },
    {
      id: 2,
      vacancyId: 102,
      candidateId: 1002,
      candidateName: 'Michael Chen',
      candidateAvatar: 'https://i.pravatar.cc/150?img=12',
      appliedDate: '5 hours ago',
      status: 'Reviewed',
      resumeUrl: '#',
      coverLetter: 'Portfolio and case studies attached.',
      position: 'UX/UI Designer',
    },
    {
      id: 3,
      vacancyId: 103,
      candidateId: 1003,
      candidateName: 'Emily Rodriguez',
      candidateAvatar: 'https://i.pravatar.cc/150?img=9',
      appliedDate: '1 day ago',
      status: 'Interviewed',
      resumeUrl: '#',
      coverLetter: 'Strong background in SaaS product delivery.',
      position: 'Product Manager',
    },
    {
      id: 4,
      vacancyId: 101,
      candidateId: 1004,
      candidateName: 'David Kim',
      candidateAvatar: 'https://i.pravatar.cc/150?img=14',
      appliedDate: '1 day ago',
      status: 'Shortlisted',
      resumeUrl: '#',
      coverLetter: 'Happy to share GitHub and references.',
      position: 'Senior Frontend Developer',
    },
    {
      id: 5,
      vacancyId: 102,
      candidateId: 1005,
      candidateName: 'Jessica Taylor',
      candidateAvatar: 'https://i.pravatar.cc/150?img=20',
      appliedDate: '2 days ago',
      status: 'New',
      resumeUrl: '#',
      coverLetter: 'Design-first approach with strong UX research experience.',
      position: 'UX/UI Designer',
    },
    {
      id: 6,
      vacancyId: 101,
      candidateId: 1006,
      candidateName: 'Robert Wilson',
      candidateAvatar: 'https://i.pravatar.cc/150?img=11',
      appliedDate: '3 days ago',
      status: 'Rejected',
      resumeUrl: '#',
      coverLetter: 'Thank you for reviewing my application.',
      position: 'Senior Frontend Developer',
    },
    {
      id: 7,
      vacancyId: 103,
      candidateId: 1007,
      candidateName: 'Alice Brown',
      candidateAvatar: 'https://i.pravatar.cc/150?img=16',
      appliedDate: '4 days ago',
      status: 'Hired',
      resumeUrl: '#',
      coverLetter: 'Looking forward to joining the team.',
      position: 'Product Manager',
    }
  ];

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'New': 'bg-warning text-dark',
      'Reviewed': 'bg-info',
      'Interviewed': 'bg-primary',
      'Shortlisted': 'bg-secondary',
      'Rejected': 'bg-danger',
      'Hired': 'bg-success',
    };
    return statusClasses[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    return status;
  }
}
