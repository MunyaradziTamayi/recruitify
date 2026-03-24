export interface Vacancy {
    id?: number;
    title: string;
    category: string;
    location: string;
    employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance';
    salaryRange: {
        min: number;
        max: number;
        currency: string;
    };
    description: string;
    requirements: string[];
    status: 'Active' | 'Closed' | 'Draft' | 'Archived' | 'OPEN';
    postedDate: string;
    closingDate?: string | null;
    companyId: number;
    applicantCount: number;
}

