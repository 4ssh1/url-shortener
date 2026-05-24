import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '@/env/environment';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (!environment.production) {
    const started = Date.now();
    
    return next(req).pipe(
      tap({
        next: (event) => {
          const elapsed = Date.now() - started;
          console.log(`✅ ${req.method} ${req.url} - ${elapsed}ms`);
        },
        error: (error) => {
          const elapsed = Date.now() - started;
          console.error(`❌ ${req.method} ${req.url} - ${elapsed}ms`, error);
        }
      })
    );
  }

  return next(req);
};