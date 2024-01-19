import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription, finalize } from 'rxjs';
import { responseConstant } from 'src/app/constants/response.constant';
import { CourseDetail } from 'src/app/models/CourseDetail.model';
import { Data } from 'src/app/models/Data.model';
import { LastTopicRead } from 'src/app/models/LastTopicRead.model';
import { Notification } from 'src/app/models/Notification.model';
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
  todayIsBirthday: boolean = false;
  lastTopicRead: LastTopicRead = {
    courseName: '',
    topic: '',
  };
  lastTopicReadBackup: LastTopicRead = {
    courseName: '',
    topic: '',
  };

  constructor(
    private http: HttpClient,
    private backendService: BackendService,
    private sanitizer: DomSanitizer,
    private commonService: CommonService
  ) {}

  ngOnInit() {
    this.getCourseDetails();
    // this.fakeHTML();
  }

  getHTML(title: string) {
    this.commonService.updateSpinnerSubject(true);
    const dataRequest: Data = { title: title };
    const notification: Notification = {
      message: '',
      type: 0,
    };

    const subscription = this.backendService
      .getHTML(dataRequest)
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
          const data = this.sanitizeHTML(response.data.data);

          this.html = this.sanitizer.bypassSecurityTrustHtml(data);
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

  getCourseDetails() {
    this.commonService.updateSpinnerSubject(true);

    const notification: Notification = {
      message: '',
      type: 0,
    };

    const subscription = this.backendService
      .getCourseDetails()
      .pipe(
        finalize(() => {
          this.commonService.updateSpinnerSubject(false);
          this.commonService.updateNotificationSubject(notification);
          this.getPetProfile();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.commonService.logger(response);
          notification.message = response.message
            ? response.message
            : responseConstant.GENERIC_SUCCESS;
          this.courseDetails = response.data;

          response.data.forEach((course: CourseDetail) => {
            this.courseName.push(course.courseName);
          });
          this.sortList(this.courseName);
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

  getCourseTopics(courseName: string) {
    let topics: string[] = [];
    this.courseDetails.forEach((course: CourseDetail) => {
      /** Hardcoding to ignore topic */
      if (courseName === '3 Terrible Teens') {
        return;
      }

      if (course.courseName === courseName) {
        topics = course.topics;
      }
    });
    return this.sortList(topics);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription: any) => {
      subscription.unsubscribe();
    });
  }

  onCourseChange(courseName: string) {
    this.commonService.updateNotificationSubject({ message: '', type: 0 });

    this.topics = [];
    this.selectACourse = `Selected course - ${courseName}`;
    this.selectATopic = `Select a topic`;
    this.html = '';
    this.topics = this.getCourseTopics(courseName);
    this.lastTopicRead.courseName = courseName;
  }

  onTopicChange(topic: string) {
    this.commonService.updateNotificationSubject({ message: '', type: 0 });
    this.selectATopic = `Selected topic - ${this.sanitizeTopicName(topic)}`;
    this.html = '';
    this.lastTopicRead.topic = topic;
    this.getHTML(topic);
    if (
      JSON.stringify(this.lastTopicRead) !==
      JSON.stringify(this.lastTopicReadBackup)
    ) {
      this.updateLastTopicRead();
    }
  }

  fakeHTML() {
    this.html = `
    
      

  `;
  }

  sanitizeTopicName(topic: any) {
    return topic;
    return topic.match(/^(\d+)\s*(.*)$/).slice(1)[1];
  }

  sortList(list: any[]) {
    list.sort((a: any, b: any) => {
      const numA = parseInt(a.match(/^\d+/)[0]);
      const numB = parseInt(b.match(/^\d+/)[0]);
      return numA - numB;
    });
    return list;
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
          this.getLastTopicRead();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.commonService.logger(response);
          notification.message = response.message
            ? response.message
            : responseConstant.GENERIC_SUCCESS;
          this.commonService.savePetProfile(response.data.petProfile);

          if (
            new Date(response.data.petProfile.petDOB).getDate() ===
              new Date().getDate() &&
            new Date(response.data.petProfile.petDOB).getMonth() ===
              new Date().getMonth()
          ) {
            this.todayIsBirthday = true;
          }
        },
        error: (error: any) => {
          notification.type = 1;
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

  sanitizeHTML(html: string) {
    const petProfile = JSON.parse(localStorage.getItem('petProfile') ?? '{}');

    if (
      !petProfile ||
      !petProfile.petName ||
      !petProfile.petBreed ||
      !petProfile.petGender
    ) {
      return html;
    }

    let sanitizedHTML = html
      .replaceAll(/\b(?:German Shepherd)\b/gi, petProfile.petBreed)

      .replaceAll(/\b(?:Shadow|shadow)\b/gi, petProfile.petName)

      .replaceAll('h3', 'h2');

    if (petProfile.petGender === 'Male') {
      sanitizedHTML = sanitizedHTML
        .replaceAll(/\b(?:he|she)\b/gi, 'he')
        .replaceAll(/\b(?:him|her)\b/gi, 'him')
        .replaceAll(/\b(?:himself|herself)\b/gi, 'himself');
    }

    if (petProfile.petGender === 'Female') {
      sanitizedHTML = sanitizedHTML
        .replaceAll(/\b(?:he|she)\b/gi, 'she')
        .replaceAll(/\b(?:him|her)\b/gi, 'her')
        .replaceAll(/\b(?:himself|herself)\b/gi, 'herself');
    }

    return sanitizedHTML;
  }

  getBirthdayMessage() {
    const petProfile = JSON.parse(localStorage.getItem('petProfile') ?? '{}');
    return `Happy Birthday ${petProfile.petName}!`;
  }

  getLastTopicRead() {
    this.commonService.updateSpinnerSubject(true);
    const notification: Notification = {
      message: '',
      type: 0,
    };

    const subscription = this.backendService
      .getLastTopicRead()
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
          this.lastTopicRead = response.data.lastTopicRead;
          if (
            this.lastTopicRead.courseName !== '' &&
            this.lastTopicRead.topic !== ''
          ) {
            this.lastTopicReadBackup = JSON.parse(
              JSON.stringify(this.lastTopicRead)
            );
            this.onCourseChange(this.lastTopicRead.courseName);
            this.onTopicChange(this.lastTopicRead.topic);
          }
        },
        error: (error: any) => {
          notification.type = 1;

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

  updateLastTopicRead() {
    this.commonService.updateSpinnerSubject(true);

    const notification: Notification = {
      message: '',
      type: 0,
    };
    const subscription = this.backendService
      .updateLastTopicRead(this.lastTopicRead)
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
        },
        error: (error: any) => {
          this.commonService.logger(error);
          notification.type = 1;

          if (error.error && error.error.message) {
            notification.message = error.error.message;
          } else {
            notification.message = responseConstant.GENERIC_ERROR;
          }
        },
      });

    this.subscriptions.push(subscription);
  }
}
