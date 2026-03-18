import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Company } from '../models/company.model';
import { API_BASE_URL } from '../config/api-base-url';

export type CompanyUpsert = Omit<Company, 'id'>;

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/companies`;
  }

  createCompany(request: CompanyUpsert): Observable<Company> {
    return this.http.post<Company>(this.baseUrl, request);
  }

  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/${id}`);
  }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(this.baseUrl);
  }

  searchCompanies(term: string): Observable<Company[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<Company[]>(`${this.baseUrl}/search`, { params });
  }

  filterCompaniesByIndustry(industry: string): Observable<Company[]> {
    const params = new HttpParams().set('industry', industry);
    return this.http.get<Company[]>(`${this.baseUrl}/filter/industry`, { params });
  }

  filterCompaniesBySize(size: string): Observable<Company[]> {
    const params = new HttpParams().set('size', size);
    return this.http.get<Company[]>(`${this.baseUrl}/filter/size`, { params });
  }

  updateCompany(id: number, request: CompanyUpsert): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/${id}`, request);
  }

  deleteCompany(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
