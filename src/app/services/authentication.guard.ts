import { CanActivateFn } from '@angular/router';
import { CommonService } from './common.service';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { inject } from '@angular/core';

export const authenticationGuard: CanActivateFn = (route, state) => {
  let value: boolean = false;
  const currentPath = route.url[0].path;
  const commonService: CommonService = inject(CommonService);
  const router: Router = inject(Router);

  commonService.authenticationSubject.subscribe((res) => {
    value = res;
  });

  if (currentPath === 'authentication') {
    if (value) {
      router.navigate(['/training']);
    }
    return !value;
  }

  return value;
};
