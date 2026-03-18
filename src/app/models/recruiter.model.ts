export interface Recruiter {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    avatarUrl?: string;
    companyId: number | null;
    createdAt: string | null;
    notificationPreferences: {
        newApplications: boolean;
        interviewReminders: boolean;
        weeklyDigest: boolean;
        marketingEmails: boolean;
    };
}
