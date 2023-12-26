import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private router: Router) {}

  spinnerSubject = new BehaviorSubject<boolean>(false);
  spinnerSubject$ = this.spinnerSubject.asObservable();

  authenticationSubject = new BehaviorSubject<boolean>(false);
  authenticationSubject$ = this.authenticationSubject.asObservable();

  notificationMessageSubject = new BehaviorSubject<string>('');
  notificationMessageSubject$ = this.notificationMessageSubject.asObservable();

  logger(data: any) {
    if (environment.production) {
      return;
    }
    console.log(data);
  }

  updateSpinnerSubject(spinnerState: boolean) {
    this.spinnerSubject.next(spinnerState);
  }

  updateNotificationMessageSubject(message: string) {
    this.notificationMessageSubject.next(message);
    setTimeout(() => {
      this.notificationMessageSubject.next('');
    }, 5000);
  }

  updateAuthenticationSubject(authenticationState: boolean) {
    this.authenticationSubject.next(authenticationState);
  }

  handleSignOut() {
    this.updateAuthenticationSubject(false);
    sessionStorage.removeItem('token');
    this.router.navigate(['/authentication']);
  }

  set token(token: string) {
    sessionStorage.setItem('token', token);
  }

  get token(): string {
    return sessionStorage.getItem('token') ?? '';
  }

  checkSavedCredentials() {
    try {
      const sessionStorageToken = sessionStorage.getItem('token');

      if (sessionStorageToken) {
        this.token = sessionStorageToken;
        this.updateAuthenticationSubject(true);
      } else {
        this.handleSignOut();
      }
    } catch (error) {
      this.handleSignOut();
      this.logger(error);
    }
  }
}
