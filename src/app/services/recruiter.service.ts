import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Recruiter } from '../models/recruiter.model';
import { API_BASE_URL } from '../config/api-base-url';

export type RecruiterUpsert = Omit<Recruiter, 'id'>;

@Injectable({ providedIn: 'root' })
export class RecruiterService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/recruiters`;
  }

  createRecruiter(request: RecruiterUpsert): Observable<Recruiter> {
    return this.http.post<Recruiter>(this.baseUrl, request);
  }

  getRecruiterById(id: number): Observable<Recruiter> {
    return this.http.get<Recruiter>(`${this.baseUrl}/${id}`);
  }

  getRecruiters(): Observable<Recruiter[]> {
    return this.http.get<Recruiter[]>(this.baseUrl);
  }

  findRecruiterByEmail(email: string): Observable<Recruiter | null> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return of(null);

    return this.getRecruiters().pipe(
      map((recruiters) => recruiters.find((r) => r.email?.trim().toLowerCase() === normalized) ?? null),
    );
  }

  updateRecruiter(id: number, request: RecruiterUpsert): Observable<Recruiter> {
    return this.http.put<Recruiter>(`${this.baseUrl}/${id}`, request);
  }

  deleteRecruiter(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
