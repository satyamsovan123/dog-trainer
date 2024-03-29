import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthenticationComponent } from './components/authentication/authentication.component';
import { TrainingComponent } from './components/training/training.component';
import { HelpComponent } from './components/help/help.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { NotificationComponent } from './components/notification/notification.component';
import { AuthenticationInterceptor } from './services/authentication.interceptor';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PetProfileComponent } from './components/pet-profile/pet-profile.component';
import { AgGridModule } from 'ag-grid-angular';
import { AngularDeviceInformationService } from 'angular-device-information';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavbarComponent,
    AuthenticationComponent,
    TrainingComponent,
    HelpComponent,
    SpinnerComponent,
    NotificationComponent,
    PetProfileComponent,
  ],
  imports: [
    AgGridModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    NgChartsModule.forRoot(),
  ],
  providers: [
    AngularDeviceInformationService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
