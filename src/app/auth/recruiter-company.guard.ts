import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from './auth-session.service';
import { CompanyStoreService } from '../services/company-store.service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export const recruiterCompanyGuard: CanActivateFn = (_route, state) => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const companyStore = inject(CompanyStoreService);

  const user = authSession.getLoggedInUser();
  if (!user) return router.createUrlTree(['/employee-login']);

  if (user.role && user.role !== 'recruiter') return router.createUrlTree(['/employee-dashboard']);

  const userId = authSession.getUserId(user);
  if (!userId) return router.createUrlTree(['/employee-login']);

  return companyStore.getCompanyForUser(userId).pipe(
    map((company) => {
      if (!company) return router.createUrlTree(['/company-setup'], { queryParams: { returnUrl: state.url } });
      return true;
    }),
    catchError(() =>
      of(router.createUrlTree(['/company-setup'], { queryParams: { returnUrl: state.url } })),
    ),
  );
};
