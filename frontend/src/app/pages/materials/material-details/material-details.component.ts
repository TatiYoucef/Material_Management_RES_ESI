import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import localeEnGb from '@angular/common/locales/en-GB';
import { NotificationService } from '../../../components/notification/notification.service';


@Component({
  selector: 'app-material-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  providers: [
    { provide: LOCALE_ID, useValue: 'en-GB' } // Set as default locale
  ],
  templateUrl: './material-details.component.html',
  styleUrl: './material-details.component.scss'
})
export class MaterialDetailsComponent implements OnInit {
  material: any;
  rooms: any[] = [];
  materialHistory: any[] = [];
  selectedRoomId: string = '';

  // For reserving materials
  newReservationData = { description: '', endDate: '' };
  activeReservations: any[] = [];
  selectedExistingReservationId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private notificationService: NotificationService
  ) { registerLocaleData(localeEnGb); }

  ngOnInit(): void {
    this.loadMaterialAndRooms();
    this.loadActiveReservations();
  }

  loadMaterialAndRooms(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getMaterial(id).subscribe({
        next: data => {
          this.material = data;
          this.selectedRoomId = this.material.currentLocation; // Pre-select current location
          this.loadMaterialHistory(id);
        },
        error: (err: any) => {
          this.notificationService.show({ message: err.error.error || 'Failed to load material details.', type: 'error' });
        }
      });
    }
    this.dataService.getRooms().subscribe({
      next: data => {
        this.rooms = data.data; // Access data property for paginated response
        this.rooms = this.rooms.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load rooms.', type: 'error' });
      }
    });
  }

  loadActiveReservations(): void {
    this.dataService.getReservations('').subscribe({
      next: data => {
        this.activeReservations = data.filter((res: any) => res.status === 'active');
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load active reservations.', type: 'error' });
      }
    });
  }

  reserveMaterialNew(): void {
    if (this.material) {
      const materialsToReserve = [{ ids: [this.material.id] }];
      this.dataService.createReservation({ ...this.newReservationData, materials: materialsToReserve }).subscribe({
        next: () => {
          this.loadMaterialAndRooms();
          this.newReservationData = { description: '', endDate: '' }; // Reset form
          this.notificationService.show({ message: 'Material reserved successfully.', type: 'success' });
        },
        error: (err: any) => {
          this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to create new reservation.'), type: 'error' });
        }
      });
    }
  }

  addMaterialToExistingReservation(): void {
    if (!this.selectedExistingReservationId) {
      this.notificationService.show({ message: 'Please select an existing reservation.', type: 'warning' });
      return;
    }
    if (this.material) {
      const materialsToAdd = [{ ids: [this.material.id] }];
      this.dataService.addMaterialsToReservation(this.selectedExistingReservationId, materialsToAdd).subscribe({
        next: () => {
          this.loadMaterialAndRooms();
          this.selectedExistingReservationId = ''; // Reset form
          this.notificationService.show({ message: 'Material added to reservation successfully.', type: 'success' });
        },
        error: (err: any) => {
          this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to add material to existing reservation.'), type: 'error' });
        }
      });
    }
  }

  excludeMaterialFromReservation(): void {
    if (this.material && this.material.reservationDetails) {
      if (confirm(`Are you sure you want to exclude ${this.material.name} from reservation ${this.material.reservationDetails.id}?`)) {
        this.dataService.removeMaterialFromReservation(this.material.reservationDetails.id, this.material.id).subscribe({
          next: () => {
            this.loadMaterialAndRooms();
            this.notificationService.show({ message: 'Material excluded from reservation successfully.', type: 'success' });
          },
          error: (err: any) => {
            this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to exclude material.'), type: 'error' });
          }
        });
      }
    }
  }

  loadMaterialHistory(id: string): void {
    this.dataService.getMaterialHistory(id).subscribe({
      next: history => {
        this.materialHistory = history.reverse();
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load material history.', type: 'error' });
      }
    });
  }

  moveMaterial(): void {
    if (!this.selectedRoomId || this.selectedRoomId === this.material.currentLocation) {
      this.notificationService.show({ message: 'Please select a different room to move the material.', type: 'warning' });
      return;
    }

    if (confirm(`Are you sure you want to move ${this.material.name} to ${this.selectedRoomId}?`)) {
      this.dataService.moveMaterial(this.material.id, this.selectedRoomId).subscribe({
        next: updatedMaterial => {
          this.material = updatedMaterial;
          this.loadMaterialHistory(this.material.id);
          this.notificationService.show({ message: 'Material moved successfully.', type: 'success' });
        },
        error: (err: any) => {
          this.notificationService.show({ message: err.error.error || 'Failed to move material.', type: 'error' });
        }
      });
    }
  }

  deleteMaterial(): void {
    if (confirm(`Are you sure you want to delete ${this.material.name}? This action cannot be undone.`)) {
      this.dataService.deleteMaterial(this.material.id).subscribe({
        next: () => {
          this.router.navigate(['/home']); // Navigate back to home or material types list
          this.notificationService.show({ message: 'Material deleted successfully.', type: 'success' });
        },
        error: (err: any) => {
          this.notificationService.show({ message: err.error.error || 'Failed to delete material.', type: 'error' });
        }
      });
    }
  }

  toggleServingStatus(): void {
    if (this.material) {
      this.dataService.toggleServingStatus(this.material.id).subscribe({
        next: () => {
          this.loadMaterialAndRooms();
          this.notificationService.show({ message: 'Serving status updated successfully.', type: 'success' });
        },
        error: (err: any) => {
          this.notificationService.show({ message: err.error.error || 'Failed to update serving status.', type: 'error' });
        }
      });
    }
  }
}