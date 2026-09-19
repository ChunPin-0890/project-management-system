// HTTP interceptor — like an axios request interceptor or an ASP.NET DelegatingHandler on
// HttpClient: attaches "Authorization: Bearer <jwt>" to every outgoing API request.
// On 401 (expired/invalid token) it clears the session and sends the user to /login.
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;
  const authed = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authed).pipe(
    catchError((err) => {
      if (err.status === 401 && !req.url.endsWith('/auth/login')) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
