import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  errorMessage: string = '';

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    this.dataService.getRooms({ all: true }).subscribe(data => {
      this.rooms = data;
    });
    this.dataService.getMaterialTypes().subscribe((data: any) => {
      this.materialTypes = data.data;
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
    this.errorMessage = '';
    this.dataService.createReservation(this.newReservation).subscribe(
      (res) => {
        this.router.navigate(['/reservations', res.id]);
      },
      (error) => {
        this.errorMessage = error.error.errors ? error.error.errors.join(', ') : 'Failed to create reservation.';
      }
    );
  }
}