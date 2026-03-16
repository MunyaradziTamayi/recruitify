import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';

interface Interview {
    id: number;
    candidateName: string;
    position: string;
    date: string;
    time: string;
    type: 'Virtual' | 'In-person' | 'Phone';
    status: 'Upcoming' | 'Completed' | 'Cancelled';
    avatar: string;
}

@Component({
    selector: 'app-employer-interviews',
    standalone: true,
    imports: [CommonModule, RouterModule, RecruiterAccount],
    templateUrl: './employer-interviews.html',
    styleUrl: './employer-interviews.css',
})
export class EmployerInterviews {
    interviews: Interview[] = [
        {
            id: 1,
            candidateName: 'Sarah Johnson',
            position: 'Senior Frontend Developer',
            date: 'March 10, 2026',
            time: '10:00 AM',
            type: 'Virtual',
            status: 'Upcoming',
            avatar: 'https://i.pravatar.cc/150?img=5'
        },
        {
            id: 2,
            candidateName: 'Michael Chen',
            position: 'UX/UI Designer',
            date: 'March 11, 2026',
            time: '02:30 PM',
            type: 'Virtual',
            status: 'Upcoming',
            avatar: 'https://i.pravatar.cc/150?img=12'
        },
        {
            id: 3,
            candidateName: 'Emily Rodriguez',
            position: 'Product Manager',
            date: 'March 12, 2026',
            time: '11:15 AM',
            type: 'In-person',
            status: 'Upcoming',
            avatar: 'https://i.pravatar.cc/150?img=9'
        },
        {
            id: 4,
            candidateName: 'David Kim',
            position: 'Senior Frontend Developer',
            date: 'March 05, 2026',
            time: '09:00 AM',
            type: 'Phone',
            status: 'Completed',
            avatar: 'https://i.pravatar.cc/150?img=14'
        }
    ];

    getStatusClass(status: string): string {
        const statusClasses: { [key: string]: string } = {
            'Upcoming': 'bg-primary',
            'Completed': 'bg-success',
            'Cancelled': 'bg-danger'
        };
        return statusClasses[status] || 'bg-secondary';
    }

    getTypeIcon(type: string): string {
        const icons: { [key: string]: string } = {
            'Virtual': 'bi-camera-video',
            'In-person': 'bi-geo-alt',
            'Phone': 'bi-telephone'
        };
        return icons[type] || 'bi-calendar-event';
    }
}
