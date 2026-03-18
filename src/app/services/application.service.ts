import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Application } from '../models/application.model';
import { API_BASE_URL } from '../config/api-base-url';

export type ApplicationQuery = {
  vacancyId?: number;
  candidateId?: number;
  status?: Application['status'];
};

export type ApplicationUpsert = Omit<Application, 'id'>;

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/applications`;
  }

  createApplication(request: ApplicationUpsert): Observable<Application> {
    return this.http.post<Application>(this.baseUrl, request);
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

  updateApplication(id: number, request: ApplicationUpsert): Observable<Application> {
    return this.http.put<Application>(`${this.baseUrl}/${id}`, request);
  }

  deleteApplication(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
