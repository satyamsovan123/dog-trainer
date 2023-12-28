import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css'],
})
export class SpinnerComponent implements OnInit {
  constructor(private commonService: CommonService) {}
  spinnerState: boolean = false;
  ngOnInit() {
    this.commonService.spinnerSubject$.subscribe((spinnerState: boolean) => {
      this.spinnerState = spinnerState;
    });
  }
}
