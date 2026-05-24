import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { catchError, throwError, switchMap, filter, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip token for auth endpoints
  const isAuthEndpoint = req.url.includes('/auth/login') || 
                         req.url.includes('/auth/signup') ||
                         req.url.includes('/auth/refresh');

  if (isAuthEndpoint) {
    return next(req);
  }

  // Add token to request
  const token = authService.getAccessToken();
  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return authService.isRefreshingToken().pipe(
          filter(isRefreshing => !isRefreshing),
          take(1),
          switchMap(() => {
            // Attempt to refresh token
            return authService.refreshToken().pipe(
              switchMap(() => {
                // Retry original request with new token
                const newToken = authService.getAccessToken();
                const retryReq = newToken
                  ? req.clone({
                      setHeaders: {
                        Authorization: `Bearer ${newToken}`
                      }
                    })
                  : req;
                return next(retryReq);
              }),
              catchError(refreshError => {
                return throwError(() => refreshError);
              })
            );
          })
        );
      }

      return throwError(() => error);
    })
  );
};