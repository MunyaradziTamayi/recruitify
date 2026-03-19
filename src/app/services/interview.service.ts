import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Interview } from '../models/interview.model';
import { API_BASE_URL } from '../config/api-base-url';

export type InterviewUpsert = Omit<Interview, 'id'>;

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/interviews`;
  }

  createInterview(request: InterviewUpsert): Observable<Interview> {
    return this.http.post<Interview>(this.baseUrl, request);
  }

  getInterviewById(id: number): Observable<Interview> {
    return this.http.get<Interview>(`${this.baseUrl}/${id}`);
  }

  getInterviews(query: { candidateId?: number; recruiterId?: number } = {}): Observable<Interview[]> {
    let params = new HttpParams();
    if (query.candidateId != null) params = params.set('candidateId', String(query.candidateId));
    if (query.recruiterId != null) params = params.set('recruiterId', String(query.recruiterId));

    return this.http.get<Interview[]>(this.baseUrl, { params });
  }

  updateInterview(id: number, request: InterviewUpsert): Observable<Interview> {
    return this.http.put<Interview>(`${this.baseUrl}/${id}`, request);
  }

  deleteInterview(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
