export interface Company {
    id?: number;
    name: string;
    logoUrl: string;
    industry: string;
    size: string;
    website: string;
    location: string;
    description: string;
    culture: string;
    benefits: string[];
    socialLinks?: {
        linkedin?: string;
        twitter?: string;
        facebook?: string;
    };
}
