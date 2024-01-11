import { Component } from '@angular/core';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  IRowNode,
  RefreshCellsParams,
} from 'ag-grid-community';
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
  private gridApi!: GridApi;
  noRowsTemplate: any;
  loadingTemplate: any;
  form!: FormGroup;
  subscriptions: Subscription[] = [];
  today = this.getTodayDate();
  columnDefs: any = [
    {
      headerName: 'Date (DD/MM/YYYY)',
      field: 'date',
      flex: 0.3,
      resizable: true,
      cellDataType: 'dateString',
      valueFormatter: this.dateFormatter,
      editable: true,
    },
    {
      headerName: 'Age (Months)',
      field: 'age',
      flex: 0.4,
      resizable: true,
      cellDataType: 'number',
      editable: true,
      valueFormatter: this.ageFormatter,
    },
    {
      headerName: 'Weight (KGs)',
      field: 'weight',
      flex: 0.3,
      resizable: false,
      cellDataType: 'number',
      editable: true,
      valueFormatter: this.weightFormatter,
    },
  ];

  rowData: {}[] = [];

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
    this.noRowsTemplate = `<span>Woof, woof! No rows to show.</span>`;
    this.loadingTemplate = `<span>🐾 Loading...</span>`;
  }

  generateForm() {
    return new FormGroup({
      petName: new FormControl({ value: '', disabled: false }, []),
      petGender: new FormControl({ value: '', disabled: false }, []),
      petBreed: new FormControl({ value: '', disabled: false }, []),
      petDOB: new FormControl({ value: '', disabled: false }, []),
    });
  }

  handleSavePetProfile() {
    const isFormValid = this.validateForm(this.form);
    if (!isFormValid) {
      const errorMessage = this.checkErrorsInForm(this.form);
      this.commonService.logger(errorMessage);
      this.commonService.updateNotificationMessageSubject(errorMessage);
      return;
    }

    const petProfileRequest: PetProfile = this.form.value;
    petProfileRequest.petWeight = this.rowData;

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

          this.ngOnInit();
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
            petDOB: this.sanitizeDate(response.data.petProfile.petDOB),
          });
          this.commonService.savePetProfile(response.data.petProfile);

          this.rowData = response.data.petProfile.petWeight;
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

  sanitizeDate(date: string) {
    return new Date(date).toISOString().slice(0, 10);
  }

  dateFormatter(params: any) {
    const inputDate = params.value;
    const [year, month, day] = inputDate.split('-');
    const formattedDate = new Date(`${year}-${month}-${day}`);
    const formattedDay = formattedDate.getDate();
    const formattedMonth = formattedDate.getMonth() + 1; // Months are zero-based, so adding 1
    const formattedYear = formattedDate.getFullYear();
    const paddedDay = formattedDay < 10 ? `0${formattedDay}` : formattedDay;
    const paddedMonth =
      formattedMonth < 10 ? `0${formattedMonth}` : formattedMonth;
    const finalFormattedDate = `${paddedDay}/${paddedMonth}/${formattedYear}`;

    return finalFormattedDate;
  }

  weightFormatter(params: any) {
    return params.value + ' KGs';
  }

  handleAddWeights() {
    this.rowData.push({ date: '01-01-1970', weight: 0, age: 0 });
    this.gridApi.setGridOption('rowData', this.rowData);
  }
  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
  }

  handleDeleteWeights() {
    this.rowData = [];
  }

  ageFormatter(params: any) {
    let petDetails = JSON.parse(localStorage.getItem('petProfile') ?? '');
    let d2 = new Date(petDetails.petDOB);
    let d1 = new Date(params.data['date']);

    const endDate = d1;
    const startDate = d2;

    const oneDayMs = 1000 * 60 * 60 * 24;
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / oneDayMs);
    let years = Math.floor(diffDays / 365);
    let months = Math.floor(diffDays / 30.44) % 12;
    let days = diffDays - years * 365 - Math.floor(months * 30.44);
    if (months <= 0 || days <= 0 || years <= 0) {
      years = 0;
      months = 0;
      days = 0;
    }
    return years + ' years, ' + months + ' months, ' + days + ' days';
  }
}
