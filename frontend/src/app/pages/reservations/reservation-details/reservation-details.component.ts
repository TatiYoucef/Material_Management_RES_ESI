import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../components/notification/notification.service';


@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reservation-details.component.html',
  styleUrls: ['./reservation-details.component.scss']
})

export class ReservationDetailsComponent implements OnInit {
  reservation: any;
  aggregatedMaterials: any[] = []; // New property for aggregated materials
  showAddMaterials = false;

  materialRequestType: 'type' | 'id' = 'type';
  materialRequest = {
    type: '',
    quantity: 1,
    fromRoom: '',
    ids: ''
  };
  rooms: any[] = [];
  materialTypes: any[] = [];
  newEndDate: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadReservation();
    this.dataService.getRooms({ all: true }).subscribe({
      next: data => {
        this.rooms = data;
      },
      error: (err) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load rooms.', type: 'error' });
      }
    });
    this.dataService.getMaterialTypes().subscribe({
      next: (data: any) => {
        this.materialTypes = data.data;
      },
      error: (err) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load material types.', type: 'error' });
      }
    });
  }

  loadReservation(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getReservation(id).subscribe({
        next: data => {
          this.reservation = data;
          this.aggregateMaterials();
        },
        error: (err) => {
          this.notificationService.show({ message: err.error.error || 'Failed to load reservation details.', type: 'error' });
        }
      });
    }
  }

  aggregateMaterials(): void {
    const aggregated: { [key: string]: { type: string, count: number, instances: any[], isExpanded: boolean } } = {};

    this.reservation.materials.forEach((m: any) => {
      if (!aggregated[m.type]) {
        aggregated[m.type] = { type: m.type, count: 0, instances: [], isExpanded: false };
      }
      aggregated[m.type].count++;
      aggregated[m.type].instances.push(m);
    });

    this.aggregatedMaterials = Object.values(aggregated);
  }

  toggleDetails(materialType: any): void {
    materialType.isExpanded = !materialType.isExpanded;
  }

  cancelReservation(): void {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.dataService.cancelReservation(this.reservation.id).subscribe({
        next: () => {
          this.loadReservation();
          this.notificationService.show({ message: 'Reservation cancelled successfully.', type: 'success' });
        },
        error: (err) => {
          this.notificationService.show({ message: err.error.error || 'Failed to cancel reservation.', type: 'error' });
        }
      });
    }
  }

  endReservation(): void {
    if (confirm('Are you sure you want to end this reservation?')) {
      this.dataService.endReservation(this.reservation.id).subscribe({
        next: () => {
          this.loadReservation();
          this.notificationService.show({ message: 'Reservation ended successfully.', type: 'success' });
        },
        error: (err) => {
          this.notificationService.show({ message: err.error.error || 'Failed to end reservation.', type: 'error' });
        }
      });
    }
  }

  deleteReservation(id: string): void {
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.dataService.deleteReservation(id).subscribe({
        next: () => {
          this.router.navigate(['/reservations']); // Navigate back to reservation history
          this.notificationService.show({ message: 'Reservation deleted successfully.', type: 'success' });
        },
        error: (err) => {
          this.notificationService.show({ message: err.error.error || 'Failed to delete reservation.', type: 'error' });
        }
      });
    }
  }

  addMaterials(): void {
    let materialsToAdd: any;
    if (this.materialRequestType === 'type') {
      materialsToAdd = [{ 
        type: this.materialRequest.type, 
        quantity: this.materialRequest.quantity, 
        fromRoom: this.materialRequest.fromRoom 
      }];
    } else {
      materialsToAdd = [{ 
        ids: this.materialRequest.ids.split(',').map(id => id.trim()) 
      }];
    }

    this.dataService.addMaterialsToReservation(this.reservation.id, materialsToAdd).subscribe({
      next: () => {
        this.loadReservation();
        this.showAddMaterials = false;
        // Reset form
        this.materialRequest = {
          type: '',
          quantity: 1,
          fromRoom: '',
          ids: ''
        };
        this.notificationService.show({ message: 'Materials added to reservation successfully.', type: 'success' });
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to add materials to reservation.'), type: 'error' });
      }
    });
  }

  updateEndDate(): void {
    if (this.newEndDate) {
      this.dataService.updateReservationEndDate(this.reservation.id, this.newEndDate).subscribe({
        next: () => {
          this.loadReservation();
          this.newEndDate = '';
          this.notificationService.show({ message: 'Reservation end date updated successfully.', type: 'success' });
        },
        error: (err) => {
          this.notificationService.show({ message: err.error.error || 'Failed to update end date.', type: 'error' });
        }
      });
    }
  }
}