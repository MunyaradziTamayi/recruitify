export interface Employer {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: string;
    avatarUrl?: string;
    companyId: number;
    createdAt: string;
    notificationPreferences: {
        newApplications: boolean;
        interviewReminders: boolean;
        weeklyDigest: boolean;
        marketingEmails: boolean;
    };
}
