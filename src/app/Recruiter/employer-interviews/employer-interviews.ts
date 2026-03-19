import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RecruiterAccount } from '../shared/recruiter-account/recruiter-account';
import { InterviewService } from '../../services/interview.service';
import { AuthSessionService } from '../../auth/auth-session.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface Interview {
    id: number;
    candidateName: string;
    position: string;
    date: string;
    time: string;
    type: 'Virtual' | 'In-person' | 'Phone';
    status: 'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled';
    avatar: string;
}

@Component({
    selector: 'app-employer-interviews',
    standalone: true,
    imports: [CommonModule, RouterModule, RecruiterAccount],
    templateUrl: './employer-interviews.html',
    styleUrl: './employer-interviews.css',
})
export class EmployerInterviews implements OnInit {
    private readonly destroyRef = inject(DestroyRef);
    interviews: Interview[] = [];
    isLoading = false;

    constructor(
        private interviewService: InterviewService,
        private authSession: AuthSessionService,
        private router: Router
    ) {}

    ngOnInit(): void {
        const loggedInUser = this.authSession.getLoggedInUser();
        if (!loggedInUser) {
            this.router.navigate(['employee-login']);
            return;
        }

        const recruiterId = (loggedInUser as any).profileId;
        if (!recruiterId) return;

        this.isLoading = true;
        this.interviewService.getInterviews({ recruiterId })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (data) => {
                    this.interviews = data.map(i => ({
                        id: i.id ?? 0,
                        candidateName: i.candidateName,
                        position: i.position,
                        date: i.date,
                        time: i.time,
                        type: i.type as any,
                        status: i.status as any,
                        avatar: i.candidateAvatar || 'https://i.pravatar.cc/150?img=5'
                    }));
                    this.isLoading = false;
                },
                error: () => {
                    this.isLoading = false;
                }
            });
    }

    getStatusClass(status: string): string {
        const statusClasses: { [key: string]: string } = {
            'Upcoming': 'bg-primary',
            'Completed': 'bg-success',
            'Cancelled': 'bg-danger',
            'Rescheduled': 'bg-warning text-dark'
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
