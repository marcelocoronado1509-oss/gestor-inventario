
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService, UserRole } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn) {
    return router.createUrlTree(['/login']);
  }

  const requiredRole = route.data['role'] as UserRole | undefined;

  if (requiredRole && !auth.hasRole(requiredRole)) {
    return router.createUrlTree(['/productos']);
  }

  return true;
};
