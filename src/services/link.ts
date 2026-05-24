import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import {
  Link,
  CreateLinkRequest,
  CreateLinkResponse,
  LinksResponse,
  LinkAnalytics,
  AnalyticsResponse,
  DeleteLinkResponse
} from '../interfaces/link';

@Injectable({
  providedIn: 'root'
})
export class LinkService {
  private http = inject(HttpClient);

  // Signals for state management
  private linksSignal = signal<Link[]>([]);
  private selectedLinkSignal = signal<Link | null>(null);
  private analyticsSignal = signal<LinkAnalytics | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public readonly signals
  links = this.linksSignal.asReadonly();
  selectedLink = this.selectedLinkSignal.asReadonly();
  analytics = this.analyticsSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();

  // Computed signals
  totalLinks = computed(() => this.linksSignal().length);
  totalClicks = computed(() => 
    this.linksSignal().reduce((sum, link) => sum + link.clicks, 0)
  );
  recentLinks = computed(() => 
    this.linksSignal().slice(0, 5)
  );

  createLink(request: CreateLinkRequest): Observable<CreateLinkResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<CreateLinkResponse>(`${environment.apiUrl}/links`, request).pipe(
      tap(response => {
        if (response.success) {
          this.linksSignal.update(links => [response.data, ...links]);
        }
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Failed to create link');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  getMyLinks(): Observable<LinksResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<LinksResponse>(`${environment.apiUrl}/links`).pipe(
      tap(response => {
        if (response.success) {
          this.linksSignal.set(response.data);
        }
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Failed to fetch links');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  deleteLink(linkId: string): Observable<DeleteLinkResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.delete<DeleteLinkResponse>(`${environment.apiUrl}/links/${linkId}`).pipe(
      tap(response => {
        if (response.success) {
          this.linksSignal.update(links => links.filter(link => link.id !== linkId));
          
          if (this.selectedLinkSignal()?.id === linkId) {
            this.selectedLinkSignal.set(null);
            this.analyticsSignal.set(null);
          }
        }
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Failed to delete link');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  getAnalytics(linkId: string): Observable<AnalyticsResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<AnalyticsResponse>(`${environment.apiUrl}/links/${linkId}/analytics`).pipe(
      tap(response => {
        if (response.success) {
          this.analyticsSignal.set(response.data);
          
          const link = this.linksSignal().find(l => l.id === linkId);
          if (link) {
            this.selectedLinkSignal.set(link);
          }
        }
        this.loadingSignal.set(false);
      }),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Failed to fetch analytics');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  selectLink(link: Link | null): void {
    this.selectedLinkSignal.set(link);
    if (!link) {
      this.analyticsSignal.set(null);
    }
  }

  copyToClipboard(shortUrl: string): Promise<boolean> {
    return navigator.clipboard.writeText(shortUrl)
      .then(() => true)
      .catch(() => false);
  }

  getShortUrl(backHalf: string): string {
    return `${environment.appUrl}/${backHalf}`;
  }

  clearError(): void {
    this.errorSignal.set(null);
  }

  clearAnalytics(): void {
    this.analyticsSignal.set(null);
    this.selectedLinkSignal.set(null);
  }
}