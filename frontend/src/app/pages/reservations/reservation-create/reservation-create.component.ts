import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../components/notification/notification.service';

@Component({
  selector: 'app-reservation-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-create.component.html',
  styleUrls: ['./reservation-create.component.scss']
})
export class ReservationCreateComponent implements OnInit {
  newReservation: any = {
    description: '',
    startDate: new Date().toISOString().split('T')[0], // Default to today
    endDate: '',
    materials: []
  };
  materialRequestType: 'type' | 'id' = 'type';
  materialRequest = {
    type: '',
    quantity: 1,
    fromRoom: '',
    ids: ''
  };
  rooms: any[] = [];
  materialTypes: any[] = [];

  constructor(private dataService: DataService, private router: Router, private notificationService: NotificationService) { }

  ngOnInit(): void {
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

  addMaterialRequest(): void {
    if (this.materialRequestType === 'type') {
      this.newReservation.materials.push({ 
        type: this.materialRequest.type, 
        quantity: this.materialRequest.quantity, 
        fromRoom: this.materialRequest.fromRoom 
      });
    } else {
      this.newReservation.materials.push({ 
        ids: this.materialRequest.ids.split(',').map(id => id.trim()) 
      });
    }
    // Reset form
    this.materialRequest = {
      type: '',
      quantity: 1,
      fromRoom: '',
      ids: ''
    };
  }

  createReservation(): void {
    this.dataService.createReservation(this.newReservation).subscribe({
      next: (res) => {
        this.router.navigate(['/reservations', res.id]);
        this.notificationService.show({ message: 'Reservation created successfully.', type: 'success' });
      },
      error: (err) => {
        this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to create reservation.'), type: 'error' });
      }
    });
  }
}