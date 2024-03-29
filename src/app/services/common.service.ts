import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { PetProfile } from '../models/PetProfile.model';
import { Notification } from '../models/Notification.model';
import { AngularDeviceInformationService } from 'angular-device-information';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(
    private router: Router,
    private deviceInformationService: AngularDeviceInformationService
  ) {}

  spinnerSubject = new BehaviorSubject<boolean>(false);
  spinnerSubject$ = this.spinnerSubject.asObservable();

  authenticationSubject = new BehaviorSubject<boolean>(false);
  authenticationSubject$ = this.authenticationSubject.asObservable();

  notificationSubject = new BehaviorSubject<Notification>({
    message: '',
    type: 0,
  });
  notificationSubject$ = this.notificationSubject.asObservable();

  logger(data: any) {
    if (environment.production) {
      return;
    }
    console.log(data);
  }

  updateSpinnerSubject(spinnerState: boolean) {
    this.spinnerSubject.next(spinnerState);
  }

  updateNotificationSubject(notification: Notification) {
    const os = this.getCurrentDeviceInformation();
    if (notification.type === 0 && os === 'iOS') {
      return;
    }
    this.notificationSubject.next(notification);
    setTimeout(() => {
      this.notificationSubject.next({
        message: '',
        type: 0,
      });
    }, 5000);
  }

  updateAuthenticationSubject(authenticationState: boolean) {
    this.authenticationSubject.next(authenticationState);
  }

  handleSignOut() {
    this.updateAuthenticationSubject(false);
    localStorage.removeItem('token');
    localStorage.removeItem('petProfile');
    this.router.navigate(['/authentication']);
  }

  set token(token: string) {
    localStorage.setItem('token', token);
  }

  get token(): string {
    return localStorage.getItem('token') ?? '';
  }

  checkSavedCredentials() {
    try {
      const localStorageToken = localStorage.getItem('token');

      if (localStorageToken) {
        this.token = localStorageToken;
        this.updateAuthenticationSubject(true);
      } else {
        this.handleSignOut();
      }
    } catch (error) {
      this.handleSignOut();
      this.logger(error);
    }
  }

  savePetProfile(petProfile: PetProfile) {
    try {
      localStorage.setItem('petProfile', JSON.stringify(petProfile));
    } catch (error) {
      this.logger(error);
    }
  }

  getCurrentDeviceInformation() {
    return this.deviceInformationService.getDeviceInfo().os;
  }
}
