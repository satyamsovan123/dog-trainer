import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { responseConstant } from 'src/app/constants/response.constant';
import { Authentication } from 'src/app/models/Authentication.model';
import { BackendService } from 'src/app/services/backend.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-authentication',
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.css'],
})
export class AuthenticationComponent {
  form!: FormGroup;
  subscriptions: Subscription[] = [];

  constructor(
    private commonService: CommonService,
    private backendService: BackendService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.generateForm();
  }

  generateForm() {
    return new FormGroup({
      email: new FormControl({ value: '', disabled: false }, [
        Validators.required,
        Validators.email,
      ]),
      password: new FormControl({ value: '', disabled: false }, [
        Validators.required,
        Validators.minLength(6),
        Validators.nullValidator,
      ]),
    });
  }

  handleSignin() {
    const isFormValid = this.validateForm(this.form);

    if (!isFormValid) {
      const errorMessage = this.checkErrorsInForm(this.form);
      this.commonService.logger(errorMessage);
      this.commonService.updateNotificationMessageSubject(errorMessage);
      return;
    }

    const authenticationRequest: Authentication = this.form.value;

    this.commonService.logger(authenticationRequest);

    this.commonService.updateSpinnerSubject(true);
    let message: string = '';

    const subscription = this.backendService
      .authentication(authenticationRequest)
      .pipe(
        finalize(() => {
          this.commonService.updateSpinnerSubject(false);
          this.commonService.updateNotificationMessageSubject(message);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.commonService.logger(response);
          message = response.body.message
            ? response.body.message
            : responseConstant.GENERIC_SUCCESS;

          const accessToken: string = response.headers.get('Authorization');
          this.commonService.token = accessToken;
          this.commonService.updateAuthenticationSubject(true);
          this.commonService.updateEmailSubject(authenticationRequest.email);
          this.commonService.email = authenticationRequest.email;

          this.router.navigate(['/training']);
        },
        error: (error: any) => {
          this.commonService.logger(error);

          if (error.error && error.error.message) {
            message = error.error.message;
          } else {
            message = responseConstant.GENERIC_ERROR;
          }
        },
      });

    this.subscriptions.push(subscription);
  }

  validateForm(form: FormGroup): boolean {
    let validationStatus: boolean = false;
    if (form.status === 'VALID') {
      validationStatus = true;
    }
    return validationStatus;
  }

  checkErrorsInForm(form: FormGroup): string {
    let errorMessage: string = '';

    Object.keys(form.controls).forEach((key) => {
      const controlErrors: any = form.get(key)?.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach((keyError) => {
          if (key === 'email') {
            errorMessage += responseConstant.INVALID_EMAIL + ' ';
          }
          if (key === 'password') {
            errorMessage += responseConstant.INVALID_PASSWORD;
          }
        });
      }
    });

    return errorMessage;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: any) => {
      subscription.unsubscribe();
    });
  }
}
