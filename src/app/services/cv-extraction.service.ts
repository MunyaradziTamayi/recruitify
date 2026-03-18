// services/cv-extraction.service.ts
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  uploadCV(file: File): Observable<CandidateProfileDto> {
    const formData = new FormData();
    formData.append('cvFile', file, file.name);

    return this.http.post<CandidateProfileDto>(`${this.apiUrl}/upload`, formData);
  }

  viewCvPdf(profileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/view/${profileId}`, { responseType: 'blob' });
  }
}
