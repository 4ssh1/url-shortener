import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { catchError, throwError, switchMap, filter, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // Skip adding token for explicit auth endpoints
  const isAuthEndpoint = req.url.includes('/auth/login') || 
                         req.url.includes('/auth/signup') ||
                         req.url.includes('/auth/refresh');

  if (isAuthEndpoint) {
    return next(req);
  }

  // Inject current active token
  const token = authService.getAccessToken();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        
        // Use the continuous signal stream to determine queuing state
        return authService.isRefreshingToken().pipe(
          take(1), // Read current status immediately
          switchMap((isRefreshing) => {
            if (!isRefreshing) {
              // First request to hit 401 handles the actual refresh execution
              return authService.refreshToken().pipe(
                switchMap(() => {
                  const newToken = authService.getAccessToken();
                  const retryReq = req.clone({
                    setHeaders: { Authorization: `Bearer ${newToken}` }
                  });
                  return next(retryReq);
                }),
                catchError((refreshError) => {
                  authService.logout();
                  return throwError(() => refreshError);
                })
              );
            } else {
              // Concurrent requests queue up by waiting for isRefreshingToken to emit false
              return authService.isRefreshingToken().pipe(
                filter((refreshing) => !refreshing), // Wait until token rotation finishes
                take(1),
                switchMap(() => {
                  const newToken = authService.getAccessToken();
                  const retryReq = req.clone({
                    setHeaders: { Authorization: `Bearer ${newToken}` }
                  });
                  return next(retryReq);
                })
              );
            }
          })
        );
      }

      return throwError(() => error);
    })
  );
};