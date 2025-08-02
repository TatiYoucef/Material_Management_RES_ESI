import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home/home.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { MaterialDetailsComponent } from './pages/materials/material-details/material-details.component';
import { NotFoundComponent } from './pages/not-found/not-found/not-found.component';
import { RoomDetailsComponent } from './pages/rooms/room-details/room-details.component';
import { MaterialManagementComponent } from './pages/materials/material-management/material-management.component';
import { MaterialInstancesComponent } from './pages/materials/material-instances/material-instances.component';
import { RoomManagementComponent } from './pages/rooms/room-management/room-management.component';
import { authGuard } from './services/auth.guard';
import { ReservationHistoryComponent } from './pages/reservations/reservation-history/reservation-history.component';
import { ReservationCreateComponent } from './pages/reservations/reservation-create/reservation-create.component';
import { ReservationDetailsComponent } from './pages/reservations/reservation-details/reservation-details.component';
import { FileListComponent } from './file-management/file-list/file-list.component';
import { FileDetailComponent } from './file-management/file-detail/file-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [authGuard] },
  { path: 'materials/:id', component: MaterialDetailsComponent, canActivate: [authGuard] },
  { path: 'rooms/:id', component: RoomDetailsComponent, canActivate: [authGuard] },
  { path: 'material-management', component: MaterialManagementComponent, canActivate: [authGuard] },
  { path: 'material-instances/:type', component: MaterialInstancesComponent, canActivate: [authGuard] },
  { path: 'room-management', component: RoomManagementComponent, canActivate: [authGuard] },
  { path: 'reservations', component: ReservationHistoryComponent, canActivate: [authGuard] },
  { path: 'reservations/new', component: ReservationCreateComponent, canActivate: [authGuard] },
  { path: 'reservations/:id', component: ReservationDetailsComponent, canActivate: [authGuard] },
  { path: 'files', component: FileListComponent, canActivate: [authGuard] },
  { path: 'files/:id', component: FileDetailComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent }
];
