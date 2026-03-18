import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LeadIQCandidateSearchRequest, LeadIQCandidateSearchResponse } from '../models/leadiq.model';
import { API_BASE_URL } from '../config/api-base-url';

@Injectable({ providedIn: 'root' })
export class LeadIqCandidatesService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/leadiq/candidates`;
  }

  searchCandidates(request: LeadIQCandidateSearchRequest): Observable<LeadIQCandidateSearchResponse> {
    return this.http.post<LeadIQCandidateSearchResponse>(`${this.baseUrl}/search`, request);
  }
}
