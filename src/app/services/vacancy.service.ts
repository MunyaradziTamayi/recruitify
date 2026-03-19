import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, shareReplay, tap } from 'rxjs/operators';
import { Vacancy } from '../models/vacancy.model';
import { API_BASE_URL } from '../config/api-base-url';

export type VacancyUpsert = Omit<Vacancy, 'id'>;

export type VacancyChangeEvent =
  | { type: 'create'; companyId?: number; vacancy?: Vacancy }
  | { type: 'update'; companyId?: number; id: number; vacancy?: Vacancy }
  | { type: 'delete'; companyId?: number; id: number };

@Injectable({ providedIn: 'root' })
export class VacancyService {
  private readonly baseUrl: string;
  private readonly companyVacanciesCache = new Map<number, Observable<Vacancy[]>>();
  private readonly vacancyChangesSubject = new Subject<VacancyChangeEvent>();
  readonly vacancyChanges$ = this.vacancyChangesSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string,
  ) {
    this.baseUrl = `${apiBaseUrl.replace(/\/$/, '')}/api/vacancies`;
  }

  createVacancy(request: VacancyUpsert): Observable<Vacancy> {
    return this.http.post<Vacancy>(this.baseUrl, request).pipe(
      tap((created) => {
        const companyId = request.companyId;
        if (typeof companyId === 'number') {
          this.invalidateCompanyVacancies(companyId);
        }
        this.vacancyChangesSubject.next({ type: 'create', companyId, vacancy: created });
      }),
    );
  }

  getVacancyById(id: number): Observable<Vacancy> {
    return this.http.get<Vacancy>(`${this.baseUrl}/${id}`);
  }

  getVacancies(): Observable<Vacancy[]> {
    return this.http.get<Vacancy[]>(this.baseUrl);
  }

  getVacanciesForCompany(companyId: number, options?: { refresh?: boolean }): Observable<Vacancy[]> {
    if (!options?.refresh) {
      const cached = this.companyVacanciesCache.get(companyId);
      if (cached) return cached;
    }

    const request$ = this.http.get<Vacancy[]>(`${this.baseUrl}?companyId=${companyId}`).pipe(
      map((vacancies) => (vacancies ?? []).filter((v) => v.companyId === companyId)),
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError((error) => {
        this.companyVacanciesCache.delete(companyId);
        return throwError(() => error);
      }),
    );

    this.companyVacanciesCache.set(companyId, request$);
    return request$;
  }

  getRecommendedVacancies(profileId: number): Observable<Vacancy[]> {
    return this.http.get<Vacancy[]>(`${this.baseUrl}/recommended/${profileId}`);
  }

  updateVacancy(id: number, request: VacancyUpsert): Observable<Vacancy> {
    return this.http.put<Vacancy>(`${this.baseUrl}/${id}`, request).pipe(
      tap((updated) => {
        const companyId = request.companyId;
        if (typeof companyId === 'number') {
          this.invalidateCompanyVacancies(companyId);
        }
        this.vacancyChangesSubject.next({ type: 'update', id, companyId, vacancy: updated });
      }),
    );
  }

  deleteVacancy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this.vacancyChangesSubject.next({ type: 'delete', id });
      }),
    );
  }

  invalidateCompanyVacancies(companyId: number): void {
    this.companyVacanciesCache.delete(companyId);
  }
}
