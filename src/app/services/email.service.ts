import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api-base-url';

export interface EmailRequest {
  email: string;
  subject: string;
  body: string;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/email/send`;
  }

  sendEmail(request: EmailRequest): Observable<void> {
    return this.http.post<void>(this.baseUrl, request);
  }
}
