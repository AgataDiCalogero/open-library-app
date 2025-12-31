import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        console.error('[HTTP ERROR]', req.method, req.url, err.status, err.message);
      } else {
        console.error('[HTTP ERROR]', req.method, req.url, err);
      }
      return throwError(() => err);
    })
  );
