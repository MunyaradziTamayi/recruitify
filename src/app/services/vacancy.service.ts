import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vacancy } from '../models/vacancy.model';
import { API_BASE_URL } from '../config/api-base-url';

export type VacancyUpsert = Omit<Vacancy, 'id'>;

@Injectable({ providedIn: 'root' })
export class VacancyService {
  private readonly baseUrl: string;

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/vacancies`;
  }

  createVacancy(request: VacancyUpsert): Observable<Vacancy> {
    return this.http.post<Vacancy>(this.baseUrl, request);
  }

  getVacancyById(id: number): Observable<Vacancy> {
    return this.http.get<Vacancy>(`${this.baseUrl}/${id}`);
  }

  getVacancies(): Observable<Vacancy[]> {
    return this.http.get<Vacancy[]>(this.baseUrl);
  }

  getRecommendedVacancies(profileId: number): Observable<Vacancy[]> {
    return this.http.get<Vacancy[]>(`${this.baseUrl}/recommended/${profileId}`);
  }

  updateVacancy(id: number, request: VacancyUpsert): Observable<Vacancy> {
    return this.http.put<Vacancy>(`${this.baseUrl}/${id}`, request);
  }

  deleteVacancy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
