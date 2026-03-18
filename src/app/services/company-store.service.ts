import { Injectable } from '@angular/core';
import { Company } from '../models/company.model';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CompanyService } from './company.service';
import { RecruiterService } from './recruiter.service';

@Injectable({ providedIn: 'root' })
export class CompanyStoreService {
  constructor(
    private recruiters: RecruiterService,
    private companies: CompanyService,
  ) {}

  getCompanyForUser(userId: string): Observable<Company | null> {
    return this.recruiters.findRecruiterByEmail(userId).pipe(
      switchMap((recruiter) => {
        const companyId = recruiter?.companyId;
        if (!companyId) return of(null);
        return this.companies.getCompanyById(companyId);
      }),
      catchError(() => of(null)),
    );
  }

  saveCompanyForUser(userId: string, company: Company): Observable<Company> {
    return this.recruiters.findRecruiterByEmail(userId).pipe(
      switchMap((recruiter) => {
        if (!recruiter?.id) {
          throw new Error('Recruiter account not found for this user.');
        }

        const { id, ...companyPayload } = company;
        const companyRequest = companyPayload as Omit<Company, 'id'>;

        const save$ = id
          ? this.companies.updateCompany(id, companyRequest)
          : this.companies.createCompany(companyRequest);

        return save$.pipe(
          switchMap((savedCompany) => {
            const newCompanyId = savedCompany.id;
            if (!newCompanyId) return of(savedCompany);

            if (recruiter.companyId === newCompanyId) return of(savedCompany);

            const recruiterId = recruiter.id;
            if (!recruiterId) return of(savedCompany);

            const { id: _ignored, ...recruiterPayload } = { ...recruiter, companyId: newCompanyId };
            return this.recruiters.updateRecruiter(recruiterId, recruiterPayload).pipe(map(() => savedCompany));
          }),
        );
      }),
    );
  }

  buildDefaultLogoUrl(companyName: string): string {
    const encoded = encodeURIComponent(companyName.trim() || 'Company');
    return `https://ui-avatars.com/api/?name=${encoded}&background=0D6EFD&color=fff&size=128`;
  }
}
