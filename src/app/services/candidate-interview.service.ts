import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Interview } from '../models/interview.model';
import { API_BASE_URL } from '../config/api-base-url';

export type CandidateInterviewUpsert = Omit<Interview, 'id'>;

@Injectable({ providedIn: 'root' })
export class CandidateInterviewService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/candidate/interviews`;
  }

  createInterview(request: CandidateInterviewUpsert): Observable<Interview> {
    return this.http.post<Interview>(this.baseUrl, request);
  }

  getInterviewById(id: number): Observable<Interview> {
    return this.http.get<Interview>(`${this.baseUrl}/${id}`);
  }

  getInterviews(): Observable<Interview[]> {
    return this.http.get<Interview[]>(this.baseUrl);
  }

  updateInterview(id: number, request: CandidateInterviewUpsert): Observable<Interview> {
    return this.http.put<Interview>(`${this.baseUrl}/${id}`, request);
  }

  deleteInterview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
