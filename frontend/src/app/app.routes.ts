import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MaterialDetailsComponent } from './material-details/material-details.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { RoomDetailsComponent } from './room-details/room-details.component';
import { MaterialManagementComponent } from './material-management/material-management.component';
import { MaterialInstancesComponent } from './material-instances/material-instances.component';
import { RoomManagementComponent } from './room-management/room-management.component';
import { authGuard } from './auth.guard';
import { ReservationManagementComponent } from './reservation-management/reservation-management.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'materials/:id', component: MaterialDetailsComponent, canActivate: [authGuard] },
  { path: 'rooms/:id', component: RoomDetailsComponent, canActivate: [authGuard] },
  { path: 'material-management', component: MaterialManagementComponent, canActivate: [authGuard] },
  { path: 'material-instances/:type', component: MaterialInstancesComponent, canActivate: [authGuard] },
  { path: 'room-management', component: RoomManagementComponent, canActivate: [authGuard] },
  { path: 'reservation-management', component: ReservationManagementComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent }
];