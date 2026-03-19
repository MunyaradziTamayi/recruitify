import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CandidateProfile, CandidateProfileRequest } from '../models/profile.model';
import { API_BASE_URL } from '../config/api-base-url';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/profiles`;
  }

  createProfile(request: CandidateProfileRequest): Observable<CandidateProfile> {
    return this.http.post<CandidateProfile>(this.baseUrl, request);
  }

  getProfileById(id: number): Observable<CandidateProfile> {
    return this.http.get<CandidateProfile>(`${this.baseUrl}/${id}`);
  }

  getProfiles(): Observable<CandidateProfile[]> {
    return this.http.get<CandidateProfile[]>(this.baseUrl);
  }

  findProfileByEmail(email: string): Observable<CandidateProfile | null> {
    const normalized = email.trim().toLowerCase();
    if (!normalized) return of(null);

    const params = new HttpParams().set('email', normalized);
    return this.http.get<CandidateProfile>(`${this.baseUrl}/search`, { params }).pipe(
      catchError(() => of(null)),
      map((profile) => profile ?? null),
    );
  }

  updateProfile(id: number, request: CandidateProfileRequest): Observable<CandidateProfile> {
    return this.http.put<CandidateProfile>(`${this.baseUrl}/${id}`, request);
  }

  deleteProfile(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
