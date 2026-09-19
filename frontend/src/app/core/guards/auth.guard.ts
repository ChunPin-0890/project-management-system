// Route guard — like a React <PrivateRoute> wrapper or ASP.NET [Authorize]; runs before a route
// activates. UX convenience only: the real enforcement is server-side (JwtAuthGuard + membership).
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn ? true : router.createUrlTree(['/login']);
};
