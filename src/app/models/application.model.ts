export interface Application {
    id?: number;
    vacancyId: number;
    candidateId: number;
    candidateName: string;
    candidateAvatar?: string;
    appliedDate: string;
    status: 'New' | 'Reviewed' | 'Interviewed' | 'Hired' | 'Rejected' | 'Shortlisted';
    resumeUrl?: string;
    coverLetter?: string;
    position: string; // redundant but useful for UI
}
