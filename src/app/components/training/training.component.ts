import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription, finalize } from 'rxjs';
import { responseConstant } from 'src/app/constants/response.constant';
import { CourseDetail } from 'src/app/models/CourseDetail.model';
import { Data } from 'src/app/models/Data.model';
import { BackendService } from 'src/app/services/backend.service';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css'],
})
export class TrainingComponent implements OnInit {
  html: any = '';
  courseDetails: any;
  subscriptions: Subscription[] = [];
  courseName: string[] = [];
  parts: string[] = [];
  topics: string[] = [];
  selectACourse: string = 'Select a course';
  selectATopic: string = 'Select a topic';

  constructor(
    private http: HttpClient,
    private backendService: BackendService,
    private sanitizer: DomSanitizer,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.fetchCourseDetails();
  }

  fetchHTML(title: string) {
    this.commonService.updateSpinnerSubject(true);
    let message: string = '';
    const dataRequest: Data = { title: title };

    const subscription = this.backendService
      .fetchHTML(dataRequest)
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
          const data = response.data.data;
          this.html = this.sanitizer.bypassSecurityTrustHtml(data);
        },
        error: (error: any) => {
          if (error.status === 401) {
            this.commonService.handleSignOut();
            return;
          }
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

  fetchCourseDetails() {
    this.commonService.updateSpinnerSubject(true);
    let message: string = '';

    const subscription = this.backendService
      .fetchCourseDetails()
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
          this.courseDetails = response.data;

          response.data.forEach((course: CourseDetail) => {
            this.courseName.push(course.courseName);
          });
        },
        error: (error: any) => {
          if (error.status === 401) {
            this.commonService.handleSignOut();
            return;
          }
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

  getCourseTopics(courseName: string) {
    let topics: string[] = [];
    this.courseDetails.forEach((course: CourseDetail) => {
      if (course.courseName === courseName) {
        topics = course.topics;
      }
    });
    return topics;
  }
  ngOnDestroy() {
    this.subscriptions.forEach((subscription: any) => {
      subscription.unsubscribe();
    });
  }

  onCourseChange(courseName: string) {
    this.commonService.updateNotificationMessageSubject('');

    this.topics = [];
    this.selectACourse = `Selected course - ${courseName}`;
    this.topics = this.getCourseTopics(courseName);
  }

  onTopicChange(topic: string) {
    this.commonService.updateNotificationMessageSubject('');
    this.selectATopic = `Selected topic - ${topic}`;
    this.fetchHTML(topic);
  }
}
