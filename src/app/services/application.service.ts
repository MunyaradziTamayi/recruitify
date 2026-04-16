import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, Subject, tap } from 'rxjs';
import { Application } from '../models/application.model';
import { API_BASE_URL } from '../config/api-base-url';

export type ApplicationQuery = {
  vacancyId?: number;
  candidateId?: number;
  status?: Application['status'];
};

export type ApplicationUpsert = Omit<Application, 'id'>;

export interface RecommendedCandidate {
  fullName: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  email: string | null;
  linkedinUrl: string | null;
  matchScore: number;
  matchedRequiredSkills: string[];
  matchedOptionalSkills: string[];
  source: unknown;
}

export interface ApplicationChangeEvent {
  type: 'create' | 'update' | 'delete';
  applicationId?: number;
  vacancyId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private readonly baseUrl: string;
  private readonly _applicationChanges$ = new Subject<ApplicationChangeEvent>();
  public readonly applicationChanges$ = this._applicationChanges$.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/applications`;
  }

  createApplication(request: ApplicationUpsert): Observable<Application> {
    return this.http.post<Application>(this.baseUrl, request).pipe(
      tap((app) => this._applicationChanges$.next({ type: 'create', applicationId: app.id, vacancyId: app.vacancyId }))
    );
  }

  getApplicationById(id: number): Observable<Application> {
    return this.http.get<Application>(`${this.baseUrl}/${id}`);
  }

  getApplications(query: ApplicationQuery = {}): Observable<Application[]> {
    let params = new HttpParams();

    if (query.vacancyId != null) params = params.set('vacancyId', String(query.vacancyId));
    if (query.candidateId != null) params = params.set('candidateId', String(query.candidateId));
    if (query.status != null) params = params.set('status', query.status);

    return this.http.get<Application[]>(this.baseUrl, { params });
  }

  getApplicationsForCandidate(candidateId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.baseUrl}/candidate/${candidateId}`);
  }

  getApplicationsForVacancy(vacancyId: number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.baseUrl}/vacancy/${vacancyId}`);
  }

  updateApplication(id: number, request: ApplicationUpsert): Observable<Application> {
    return this.http.put<Application>(`${this.baseUrl}/${id}`, request).pipe(
      tap((app) => this._applicationChanges$.next({ type: 'update', applicationId: app.id, vacancyId: app.vacancyId }))
    );
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => this._applicationChanges$.next({ type: 'delete', applicationId: id }))
    );
  }

  applyToVacancy(vacancyId: number, candidateId: number, coverLetter: string): Observable<Application> {
    const url = `${this.baseUrl}/vacancies/${vacancyId}/candidates/${candidateId}`;
    return this.http.post<Application>(url, { coverLetter });
  }

  getRecommendedCandidatesForVacancy(
    vacancyId: number,
    options: { maxResults?: number; requireAllRequiredSkills?: boolean } = {},
  ): Observable<RecommendedCandidate[]> {
    let params = new HttpParams();
    if (options.maxResults != null) params = params.set('maxResults', String(options.maxResults));
    if (options.requireAllRequiredSkills != null) {
      params = params.set('requireAllRequiredSkills', String(options.requireAllRequiredSkills));
    }

    return this.http
      .get<{ candidates: RecommendedCandidate[] }>(`${this.baseUrl}/vacancy/${vacancyId}/recommended-candidates`, {
        params,
      })
      .pipe(map((res) => res?.candidates ?? []));
  }
}
