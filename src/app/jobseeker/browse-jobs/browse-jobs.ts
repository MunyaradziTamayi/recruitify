import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { VacancyService } from '../../services/vacancy.service';
import { CompanyService } from '../../services/company.service';
import { Vacancy } from '../../models/vacancy.model';
import { Company } from '../../models/company.model';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  logo: string;
  timePosted: string;
  type: string;
  salary: string;
  description: string;
  tags: string[];
  isSaved: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  imageUrl: string;
}

@Component({
  selector: 'app-browse-jobs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './browse-jobs.html',
  styleUrl: './browse-jobs.css',
})
export class BrowseJobs implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  user: UserProfile = {
    name: '',
    email: '',
    imageUrl: ''
  };

  filters = {
    jobTitle: '',
    keywords: '',
    company: '',
    location: '',
    jobType: '',
  };

  selectedCategory: string = 'All';
  categories: string[] = ['All', 'Design', 'Development', 'Marketing', 'Sales', 'Management'];

  isLoadingVacancies = false;
  vacanciesLoadError: string | null = null;

  jobs: Job[] = [];
  filteredJobs: Job[] = [];

  availableLocations: string[] = [];
  availableJobTypes: string[] = [];

  constructor(
    private router: Router,
    private vacancyService: VacancyService,
    private companyService: CompanyService,
  ) {}

  ngOnInit(): void {
    const storedUser = sessionStorage.getItem('loggedInUser');
    if (storedUser) {
      const googleUser = JSON.parse(storedUser);
      this.user = {
        name: googleUser.name || 'User',
        email: googleUser.email || '',
        imageUrl: googleUser.picture || 'https://i.pravatar.cc/150?img=1'
      };
    } else {
      this.router.navigate(['employee-login']);
      return;
    }

    this.loadJobs();
  }

  onSearch(): void {
    this.filterJobs();
  }

  clearFilters(): void {
    this.filters = { jobTitle: '', keywords: '', company: '', location: '', jobType: '' };
    this.selectedCategory = 'All';
    this.filterJobs();
  }

  filterJobs(): void {
    const jobTitle = this.normalize(this.filters.jobTitle);
    const company = this.normalize(this.filters.company);
    const location = this.normalize(this.filters.location);
    const jobType = this.normalize(this.filters.jobType);
    const keywordTokens = this.tokenize(this.filters.keywords);

    this.filteredJobs = this.jobs.filter((job) => {
      const titleText = this.normalize(job.title);
      const companyText = this.normalize(job.company);
      const locationText = this.normalize(job.location);
      const typeText = this.normalize(job.type);

      if (jobTitle && !titleText.includes(jobTitle)) return false;
      if (company && !companyText.includes(company)) return false;
      if (location && !locationText.includes(location)) return false;
      if (jobType && typeText !== jobType) return false;

      if (keywordTokens.length) {
        const haystack = this.normalize(
          `${job.title} ${job.company} ${job.location} ${job.type} ${job.description} ${(job.tags ?? []).join(' ')}`,
        );
        if (!keywordTokens.every((t) => haystack.includes(t))) return false;
      }

      const matchesCategory =
        this.selectedCategory === 'All' || (job.tags ?? []).includes(this.selectedCategory);
      return matchesCategory;
    });
  }

  toggleSave(job: Job) {
    job.isSaved = !job.isSaved;
  }

  logout(): void {
    sessionStorage.removeItem('loggedInUser');
    this.router.navigate(['employee-login']);
  }

  private loadJobs(): void {
    const now = new Date();

    this.isLoadingVacancies = true;
    this.vacanciesLoadError = null;

    forkJoin({
      vacancies: this.vacancyService.getVacancies(),
      companies: this.companyService.getCompanies().pipe(catchError(() => of([] as Company[]))),
    })
      .pipe(
        map(({ vacancies, companies }) => {
          const companyById = new Map<number, Company>(
            (companies ?? []).filter((c) => typeof c.id === 'number').map((c) => [c.id as number, c]),
          );

          return (vacancies ?? [])
            .filter((v) => (v.status ?? 'Active') === 'Active')
            .map((vacancy) => this.mapVacancyToJob(vacancy, companyById, now));
        }),
        catchError(() => {
          this.vacanciesLoadError = 'Unable to load vacancies right now.';
          return of([] as Job[]);
        }),
        finalize(() => {
          this.isLoadingVacancies = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe((jobs) => {
        this.jobs = jobs;
        this.availableLocations = this.buildUniqueSorted(jobs.map((j) => j.location));
        this.availableJobTypes = this.buildUniqueSorted(jobs.map((j) => j.type));
        this.filterJobs();
        this.cdr.markForCheck();
      });
  }

  private mapVacancyToJob(vacancy: Vacancy, companyById: Map<number, Company>, now: Date): Job {
    const company = typeof vacancy.companyId === 'number' ? companyById.get(vacancy.companyId) : undefined;
    const companyName = company?.name ?? (vacancy.companyId != null ? `Company #${vacancy.companyId}` : 'Company');

    const postedAt = this.parsePostedDate(vacancy.postedDate);

    return {
      id: vacancy.id ?? 0,
      title: vacancy.title,
      company: companyName,
      location: vacancy.location,
      logo: company?.logoUrl || this.buildDefaultLogoUrl(companyName),
      timePosted: postedAt ? this.formatRelativeTime(postedAt, now) : 'Recently',
      type: vacancy.employmentType,
      salary: this.formatSalary(vacancy),
      description: vacancy.description,
      tags: this.buildTags(vacancy),
      isSaved: false,
    };
  }

  private buildTags(vacancy: Vacancy): string[] {
    const tags: string[] = [];
    if (vacancy.category) tags.push(vacancy.category);
    if (vacancy.employmentType) tags.push(vacancy.employmentType);
    if (vacancy.location) tags.push(vacancy.location);
    return tags;
  }

  private formatSalary(vacancy: Vacancy): string {
    const range = vacancy.salaryRange as Vacancy['salaryRange'] | null | undefined;
    const min = range?.min;
    const max = range?.max;
    const currency = range?.currency?.trim();

    if (min == null && max == null) return 'Not specified';
    const prefix = currency ? `${currency} ` : '';

    if (min != null && max != null) return `${prefix}${min} - ${max}`;
    if (min != null) return `${prefix}${min}+`;
    return `${prefix}${max}`;
  }

  private buildDefaultLogoUrl(companyName: string): string {
    const encoded = encodeURIComponent(companyName.trim() || 'Company');
    return `https://ui-avatars.com/api/?name=${encoded}&background=0D6EFD&color=fff&size=128`;
  }

  private parsePostedDate(value: unknown): Date | null {
    if (typeof value !== 'string') return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private formatRelativeTime(postedAt: Date, now: Date): string {
    const diffMs = now.getTime() - postedAt.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  private normalize(value: unknown): string {
    return typeof value === 'string' ? value.toLowerCase().trim() : '';
  }

  private tokenize(value: string): string[] {
    return this.normalize(value).split(/[\s,]+/).filter(Boolean);
  }

  private buildUniqueSorted(values: Array<string | null | undefined>): string[] {
    const set = new Set<string>();
    for (const value of values) {
      const normalized = typeof value === 'string' ? value.trim() : '';
      if (normalized) set.add(normalized);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }
}
