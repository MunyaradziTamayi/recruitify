// services/cv-extraction.service.ts
import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CandidateProfileDto } from '../models/candidate-profile.model';
import { API_BASE_URL } from '../config/api-base-url';

@Injectable({
  providedIn: 'root'
})
export class CvExtractionService {
  private readonly apiUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.apiUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/cv`;
  }

  uploadCV(file: File, profileId: number): Observable<CandidateProfileDto> {
    const formData = new FormData();
    formData.append('cvFile', file, file.name);

    const params = new HttpParams().set('profileId', String(profileId));
    return this.http.post<CandidateProfileDto>(`${this.apiUrl}/upload`, formData, { params });
  }

  viewCvPdf(profileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/view/${profileId}`, { responseType: 'blob' });
  }
}
