import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { CommonService } from './services/common.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, AfterContentChecked {
  title = 'DogTrainer';
  disableBackground: boolean = false;
  footerText: string = '';
  constructor(
    private commonService: CommonService,
    private cd: ChangeDetectorRef
  ) {}
  ngAfterContentChecked(): void {
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.commonService.checkSavedCredentials();
    this.commonService.spinnerSubject.subscribe((disableBackground) => {
      this.disableBackground = disableBackground;
    });
  }
}
