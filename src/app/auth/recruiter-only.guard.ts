import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from './auth-session.service';

export const recruiterOnlyGuard: CanActivateFn = () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  const user = authSession.getLoggedInUser();
  if (!user) return router.createUrlTree(['/employee-login']);

  if (user.role && user.role !== 'recruiter') return router.createUrlTree(['/employee-dashboard']);

  return true;
};

