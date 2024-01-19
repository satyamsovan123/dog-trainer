import { Component } from '@angular/core';
import { Notification } from 'src/app/models/Notification.model';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent {
  notification: Notification = {
    message: '',
    type: 0,
  };
  constructor(private commonService: CommonService) {}

  ngOnInit(): void {
    this.commonService.notificationSubject$.subscribe(
      (notification: Notification) => {
        this.notification = notification;
      }
    );
  }

  clearNotification() {
    this.commonService.updateNotificationSubject({
      message: '',
      type: 0,
    });
  }
}
