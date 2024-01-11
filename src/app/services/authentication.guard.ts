import { CanActivateFn } from '@angular/router';
import { CommonService } from './common.service';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

export const authenticationGuard: CanActivateFn = (route, state) => {
  let value: boolean = true;
  const currentPath = route.url[0].path;

  if (currentPath === 'authentication') {
    return !value;
  }

  return value;
};
