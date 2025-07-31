import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservation-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-management.component.html',
  styleUrls: ['./reservation-management.component.scss']
})
export class ReservationManagementComponent implements OnInit {
  reservations: any[] = [];
  searchQuery: string = '';
  errorMessage: string = '';

  newReservation = {
    description: '',
    endDate: '',
    materials: [{ type: '', quantity: 1 }]
  };

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.dataService.getReservations(this.searchQuery).subscribe(data => {
      this.reservations = data;
    });
  }

  addMaterial(): void {
    this.newReservation.materials.push({ type: '', quantity: 1 });
  }

  createReservation(): void {
    this.errorMessage = '';
    const materialsToReserve: any[] = [];
    let allMaterialsAvailable = true;

    // Fetch available materials for each type and quantity requested
    const materialRequests = this.newReservation.materials.map(reqMat =>
      this.dataService.getMaterials({ type: reqMat.type, isAvailable: true, limit: reqMat.quantity }).toPromise().then((response: any) => {
        if (response.data.length < reqMat.quantity) {
          allMaterialsAvailable = false;
          this.errorMessage = `Not enough available ${reqMat.type} materials.`;
          return Promise.reject(this.errorMessage);
        }
        materialsToReserve.push(...response.data.map((m: any) => ({ id: m.id, type: m.type })));
        return;
      })
    );

    Promise.all(materialRequests).then(() => {
      if (allMaterialsAvailable) {
        this.dataService.createReservation({ ...this.newReservation, materials: materialsToReserve }).subscribe(
          () => {
            this.loadReservations();
            this.newReservation = {
              description: '',
              endDate: '',
              materials: [{ type: '', quantity: 1 }]
            };
          },
          error => {
            console.error('Error creating reservation:', error);
            this.errorMessage = error.error.errors ? error.error.errors.join(', ') : 'Failed to create reservation.';
          }
        );
      }
    }).catch(error => {
      console.error('Error preparing reservation:', error);
      // Error message already set by individual material request
    });
  }
}
