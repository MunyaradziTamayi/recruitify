export interface Interview {
    id?: number;
    applicationId: number;
    candidateId: number;
    candidateName: string;
    candidateAvatar?: string;
    position: string;
    date: string;
    time: string;
    type: 'Virtual' | 'In-person' | 'Phone';
    status: 'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled';
    meetingLink?: string;
    location?: string;
    notes?: string;
}
