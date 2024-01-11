import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationComponent } from './components/authentication/authentication.component';
import { HelpComponent } from './components/help/help.component';
import { TrainingComponent } from './components/training/training.component';
import { HomeComponent } from './components/home/home.component';
import { authenticationGuard } from './services/authentication.guard';
import { PetProfileComponent } from './components/pet-profile/pet-profile.component';

const routes: Routes = [
  { path: 'authentication', component: AuthenticationComponent },
  { path: 'help', component: HelpComponent },
  {
    path: 'training',
    component: TrainingComponent,
    canActivate: [authenticationGuard],
  },
  { path: 'home', component: HomeComponent },
  {
    path: 'pet-profile',
    component: PetProfileComponent,
    canActivate: [authenticationGuard],
  },

  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
