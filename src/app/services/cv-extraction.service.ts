// services/cv-extraction.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CandidateProfileDto } from '../models/candidate-profile.model';

@Injectable({
  providedIn: 'root'
})
export class CvExtractionService {
  private readonly apiUrl = 'http://localhost:8080/api/cv';

  constructor(private http: HttpClient) {}

  uploadCV(file: File): Observable<CandidateProfileDto> {
    const formData = new FormData();
    formData.append('cvFile', file, file.name);

    return this.http.post<CandidateProfileDto>(`${this.apiUrl}/upload`, formData);
  }
}
