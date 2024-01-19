import { Component, ViewChild, HostListener } from '@angular/core';
import {
  ColDef,
  GridApi,
  GridReadyEvent,
  IRowNode,
  RefreshCellsParams,
} from 'ag-grid-community';
import { AngularDeviceInformationService } from 'angular-device-information';
import { BaseChartDirective } from 'ng2-charts';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { responseConstant } from 'src/app/constants/response.constant';
import { PetProfile } from 'src/app/models/PetProfile.model';
import { BackendService } from 'src/app/services/backend.service';
import { CommonService } from 'src/app/services/common.service';
import { DateTime } from 'luxon';
import { DashboardChartConfiguration } from 'src/app/configs/chart.config';

import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { Notification } from 'src/app/models/Notification.model';

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
  today = new Date();
  columnDefs: any = [
    {
      headerName: 'Date (YYYY-MM-DD)',
      field: 'date',
      flex: 0.3,
      resizable: true,
      cellDataType: 'date',
      valueFormatter: this.dateFormatter,
      editable: true,
    },
    {
      headerName: 'Age',
      field: 'age',
      flex: 0.4,
      resizable: true,
      cellDataType: 'string',
      editable: false,
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
  selectedRows: {}[] = [];

  public chartOptions: ChartConfiguration['options'] =
    DashboardChartConfiguration;

  public chartType: ChartType = 'bar';

  public chartPlugins: [any] = [DataLabelsPlugin];

  public chartData: ChartData<'bar'> = {
    datasets: [],
  };
  screenHeight: any;
  screenWidth: any;

  constructor(
    private commonService: CommonService,
    private backendService: BackendService,
    private router: Router,
    private deviceInformationService: AngularDeviceInformationService
  ) {
    this.onResize();
  }

  ngOnInit(): void {
    this.form = this.generateForm();
    this.getPetProfile();
    this.noRowsTemplate = `<span>Woof, woof! No data to show.</span>`;
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

  handleUpdatePetProfile() {
    const isFormValid = this.validateForm(this.form);
    const notification: Notification = {
      message: '',
      type: 0,
    };
    if (!isFormValid) {
      const errorMessage = this.checkErrorsInForm(this.form);
      notification.message = errorMessage;
      notification.type = 1;
      this.commonService.logger(errorMessage);
      this.commonService.updateNotificationSubject(notification);
      return;
    }

    const petProfileRequest: PetProfile = this.form.value;
    petProfileRequest.petWeight = this.rowData;

    this.commonService.logger(petProfileRequest);

    this.commonService.updateSpinnerSubject(true);
    let message: string = '';

    const subscription = this.backendService
      .updatePetProfile(petProfileRequest)
      .pipe(
        finalize(() => {
          this.commonService.updateSpinnerSubject(false);
          this.commonService.updateNotificationSubject(notification);
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
          notification.type = 1;
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

    const notification: Notification = {
      message: '',
      type: 0,
    };

    const subscription = this.backendService
      .getPetProfile()
      .pipe(
        finalize(() => {
          this.commonService.updateSpinnerSubject(false);
          this.commonService.updateNotificationSubject(notification);
        })
      )
      .subscribe({
        next: (response: any) => {
          this.commonService.logger(response);
          notification.message = response.message
            ? response.message
            : responseConstant.GENERIC_SUCCESS;

          this.form.patchValue({
            petDOB: DateTime.fromISO(response.data.petProfile.petDOB).toFormat(
              'yyyy-MM-dd'
            ),

            petGender: response.data.petProfile.petGender,
            petBreed: response.data.petProfile.petBreed,
            petName: response.data.petProfile.petName,
          });
          this.commonService.savePetProfile(response.data.petProfile);

          this.rowData = response.data.petProfile.petWeight;
          this.rowData.forEach((row: any) => {
            row.age = this.ageFormatter({ data: row });
          });
          this.generateGraphData();
        },
        error: (error: any) => {
          notification.type = 1;
          if (error.status === 401) {
            this.commonService.handleSignOut();
            return;
          }
          this.commonService.logger(error);

          if (error.error && error.error.message) {
            notification.message = error.error.message;
          } else {
            notification.message = responseConstant.GENERIC_ERROR;
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

  dateFormatter(params: any) {
    return (
      DateTime.fromJSDate(new Date(params.value))
        // .toFormat('dd/MM/yyyy');
        .toFormat('yyyy-MM-dd')
    );
  }

  weightFormatter(params: any) {
    return params.value + ' KGs';
  }

  handleAddWeights() {
    this.rowData.push({
      date: DateTime.fromJSDate(new Date()).toFormat('yyyy-MM-dd'),
      weight: 0,
      age: `${0} years, ${0} months, ${0} days`,
    });
    this.gridApi.setGridOption('rowData', this.rowData);
    this.generateGraphData();
  }

  onGridReady(params: GridReadyEvent<any>) {
    this.gridApi = params.api;
  }

  handleDeleteWeights() {
    if (this.selectedRows.length > 0) {
      const unselectedRows = this.rowData.filter((row: any) => {
        return !this.selectedRows.includes(row);
      });
      this.rowData = unselectedRows;
    } else {
      this.rowData = [];
    }
    this.generateGraphData();
  }

  ageFormatter(params: any) {
    let petDetails = JSON.parse(localStorage.getItem('petProfile') ?? '');

    let petDOB = DateTime.fromJSDate(new Date(petDetails.petDOB));

    let rowDate = DateTime.fromJSDate(new Date(params.data['date']));

    const age: any = rowDate
      .diff(petDOB, ['years', 'months', 'days'])
      .toObject();

    if (age.years < 0 || age.months < 0 || age.days < 0) {
      age.years = 0;
      age.months = 0;
      age.days = 0;
    }

    let ageString = '';
    if (age.years === 0) {
      ageString =
        Math.ceil(age.months) + ' months, ' + Math.ceil(age.days) + ' days';
    } else if (age.months === 0) {
      ageString =
        Math.ceil(age.years) + ' years, ' + Math.ceil(age.days) + ' days';
    } else if (age.days === 0) {
      ageString =
        Math.ceil(age.years) + ' years, ' + Math.ceil(age.months) + ' months';
    } else {
      ageString =
        Math.ceil(age.years) +
        ' years, ' +
        Math.ceil(age.months) +
        ' months, ' +
        Math.ceil(age.days) +
        ' days';
    }

    ageString =
      Math.ceil(age.years) +
      ' years, ' +
      Math.ceil(age.months) +
      ' months, ' +
      Math.ceil(age.days) +
      ' days';

    params.data['age'] = ageString;
    return ageString;
  }

  onSelectionChanged(event: any) {
    const selectedRows = event.api
      .getSelectedNodes()
      .map((node: any) => node.data);
    this.selectedRows = selectedRows;
  }

  onCellEditingStopped(event: any) {
    this.generateGraphData();
  }

  generateGraphData(): void {
    const yAxisWeightData: any = [];

    const xAxisDateData: any = [];

    interface TempData {
      date: string;
      weight: number;
      age: string;
    }

    const tempData: TempData[] | any = JSON.parse(JSON.stringify(this.rowData));

    tempData.sort(
      (a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    this.rowData.forEach((row: any) => {
      yAxisWeightData.push(Number(row.weight));
      xAxisDateData.push(
        DateTime.fromJSDate(new Date(row.date)).toFormat('yyyy-MM-dd')
      );
    });

    const data: ChartData<'bar'> = {
      labels: xAxisDateData,
      datasets: [
        {
          data: yAxisWeightData,
          backgroundColor: '#000000',
          maxBarThickness: 100,
          hoverBackgroundColor: '#000000',
        },
      ],
    };
    this.chartData = data;
  }

  @HostListener('window:resize', ['$event'])
  onResize(): boolean {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    if (window.innerWidth < 500) {
      return false;
    } else {
      return true;
    }
  }
}
