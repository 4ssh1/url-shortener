import { Injectable, signal, computed, inject, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '@/env/environment';
import {
  User,
  AuthResponse,
  LoginCredentials,
  SignupCredentials,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Signals for reactive state management
  private currentUserSignal = signal<User | null>(null);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);

  // Public computed signals
  currentUser = this.currentUserSignal.asReadonly();
  loading = this.loadingSignal.asReadonly();
  error = this.errorSignal.asReadonly();
  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  isAdmin = computed(() => this.currentUserSignal()?.role === 'admin');

  private refreshTokenInProgress$ = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Only attempt to initialize authentication context on the client side
    if (this.isBrowser) {
      this.initializeAuth();
    }
  }

  private initializeAuth(): void {
    const token = this.getAccessToken();
    if (token) {
      try {
        const user = this.decodeToken(token);
        this.currentUserSignal.set(user);
      } catch {
        this.clearAuth();
      }
    }
  }

  /**
   * User signup
   */
  signup(credentials: SignupCredentials): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signup`, credentials).pipe(
      tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response);
        }
      }),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Signup failed');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.success) {
          this.handleAuthSuccess(response);
        }
      }),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Login failed');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      this.clearAuth();
      return throwError(() => new Error('No refresh token available'));
    }

    this.refreshTokenInProgress$.next(true);

    return this.http.post<RefreshTokenResponse>(`${environment.apiUrl}/auth/refresh`, {
      refreshToken
    }).pipe(
      tap(response => {
        if (response.success) {
          this.setAccessToken(response.data.accessToken);
          
          try {
            const user = this.decodeToken(response.data.accessToken);
            this.currentUserSignal.set(user);
          } catch (e) {
            console.error('Failed to parse user payload from refreshed token:', e);
          }

          this.refreshTokenInProgress$.next(false);
        }
      }),
      catchError(error => {
        this.refreshTokenInProgress$.next(false);
        this.clearAuth();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, request).pipe(
      tap(() => this.loadingSignal.set(false)),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Request failed');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post(`${environment.apiUrl}/auth/reset-password`, request).pipe(
      tap(() => this.loadingSignal.set(false)),
      catchError(error => {
        this.errorSignal.set(error.error?.message || 'Reset failed');
        this.loadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.setAccessToken(response.data.accessToken);
    this.setRefreshToken(response.data.refreshToken);
    this.currentUserSignal.set(response.data.user);
    this.loadingSignal.set(false);
    this.router.navigate(['/dashboard']);
  }

  private clearAuth(): void {
    if (this.isBrowser) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
    this.currentUserSignal.set(null);
  }

  getAccessToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem("accessToken");
    }
    return null;
  }

  private setAccessToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem("accessToken", token);
    }
  }

  getRefreshToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem("refreshToken");
    }
    return null;
  }

  private setRefreshToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem("refreshToken", token);
    }
  }

  private decodeToken(token: string): User {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.id || payload.userId,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role || 'user'
      };
    } catch {
      throw new Error('Invalid token');
    }
  }

  isRefreshingToken(): Observable<boolean> {
    return this.refreshTokenInProgress$.asObservable();
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}