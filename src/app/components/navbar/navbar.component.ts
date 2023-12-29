import { Component, OnInit } from '@angular/core';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  constructor(private commonService: CommonService) {}

  authenticated: boolean = false;
  email: string = '';

  ngOnInit(): void {
    this.commonService.authenticationSubject.subscribe(
      (authenticationState: boolean) => {
        this.authenticated = authenticationState;
      }
    );

    this.commonService.emailSubject.subscribe((email: string) => {
      console.log(email);
      this.email = email;
    });
  }

  handleSignOut() {
    this.commonService.handleSignOut();
  }
}
