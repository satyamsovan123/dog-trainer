import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { responseConstant } from 'src/app/constants/response.constant';
import { PetProfile } from 'src/app/models/PetProfile.model';
import { BackendService } from 'src/app/services/backend.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-pet-profile',
  templateUrl: './pet-profile.component.html',
  styleUrls: ['./pet-profile.component.css'],
})
export class PetProfileComponent {
  form!: FormGroup;
  subscriptions: Subscription[] = [];
  today = this.getTodayDate();

  constructor(
    private commonService: CommonService,
    private backendService: BackendService,
    private router: Router
  ) {}

  getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm: any = today.getMonth() + 1; // Months start at 0!
    let dd: any = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '/' + mm + '/' + yyyy;
    return formattedToday;
  }

  ngOnInit(): void {
    this.form = this.generateForm();
    this.getPetProfile();
  }

  generateForm() {
    return new FormGroup({
      petName: new FormControl({ value: '', disabled: false }, []),
      petGender: new FormControl({ value: '', disabled: false }, []),
      petBreed: new FormControl({ value: '', disabled: false }, []),
      petDOB: new FormControl({ value: '', disabled: false }, []),
    });
  }

  handleSave() {
    const isFormValid = this.validateForm(this.form);
    if (!isFormValid) {
      const errorMessage = this.checkErrorsInForm(this.form);
      this.commonService.logger(errorMessage);
      this.commonService.updateNotificationMessageSubject(errorMessage);
      return;
    }

    const petProfileRequest: PetProfile = this.form.value;

    this.commonService.logger(petProfileRequest);

    this.commonService.updateSpinnerSubject(true);
    let message: string = '';

    const subscription = this.backendService
      .savePetProfile(petProfileRequest)
      .pipe(
        finalize(() => {
          this.commonService.updateSpinnerSubject(false);
          this.commonService.updateNotificationMessageSubject(message);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.commonService.logger(response);
          message = response.message
            ? response.message
            : responseConstant.GENERIC_SUCCESS;
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

  getPetProfile() {
    this.commonService.updateSpinnerSubject(true);
    let message: string = '';

    const subscription = this.backendService
      .getPetProfile()
      .pipe(
        finalize(() => {
          this.commonService.updateSpinnerSubject(false);
          this.commonService.updateNotificationMessageSubject(message);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.commonService.logger(response);
          message = response.message
            ? response.message
            : responseConstant.GENERIC_SUCCESS;

          this.form.patchValue(response.data.petProfile);
          this.form.patchValue({
            petDOB: new Date(response.data.petProfile.petDOB)
              .toISOString()
              .slice(0, 10),
          });
          this.commonService.savePetProfile(response.data.petProfile);
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
          if (key === 'petName') {
            errorMessage += responseConstant.INVALID_PET_NAME + ' ';
          }
          if (key === 'petBreed') {
            errorMessage += responseConstant.INVALID_PET_BREED + ' ';
          }
          if (key === 'petGender') {
            errorMessage += responseConstant.INVALID_PET_GENDER + ' ';
          }
          if (key === 'petDOB') {
            errorMessage += responseConstant.INVALID_PET_DOB + ' ';
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
