import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import localeEnGb from '@angular/common/locales/en-GB';


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
  errorMessage: string = '';

  // For reserving materials
  reservationData = { description: '', endDate: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) { registerLocaleData(localeEnGb); }

  ngOnInit(): void {
    this.loadMaterialAndRooms();
  }

  loadMaterialAndRooms(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Loading material and rooms for ID:', id);
    if (id) {
      this.dataService.getMaterial(id).subscribe(
        data => {
          this.material = data;
          this.selectedRoomId = this.material.currentLocation; // Pre-select current location
          this.loadMaterialHistory(id);
          console.log('Material loaded:', this.material);
        },
        error => {
          console.error('Error loading material:', error);
          this.errorMessage = 'Failed to load material details.';
        }
      );
    }
    this.dataService.getRooms().subscribe(
      data => {
        this.rooms = data.data; // Access data property for paginated response
        this.rooms = this.rooms.sort((a, b) => a.name.localeCompare(b.name));
        console.log('Rooms loaded:', this.rooms);
      },
      error => {
        console.error('Error loading rooms:', error);
        // Don't set error message here, as material might still load
      }
    );
  }

  loadMaterialHistory(id: string): void {
    this.dataService.getMaterialHistory(id).subscribe(
      history => {
        this.materialHistory = history.reverse();
      },
      error => {
        console.error('Error loading material history:', error);
      }
    );
  }

  moveMaterial(): void {
    if (!this.selectedRoomId || this.selectedRoomId === this.material.currentLocation) {
      this.errorMessage = 'Please select a different room to move the material.';
      return;
    }

    if (confirm(`Are you sure you want to move ${this.material.name} to ${this.selectedRoomId}?`)) {
      this.dataService.moveMaterial(this.material.id, this.selectedRoomId).subscribe(
        updatedMaterial => {
          this.material = updatedMaterial;
          this.loadMaterialHistory(this.material.id);
          this.errorMessage = ''; // Clear error on success
        },
        error => {
          console.error('Error moving material:', error);
          this.errorMessage = 'Failed to move material.';
        }
      );
    }
  }

  deleteMaterial(): void {
    if (confirm(`Are you sure you want to delete ${this.material.name}? This action cannot be undone.`)) {
      this.dataService.deleteMaterial(this.material.id).subscribe(
        () => {
          this.router.navigate(['/home']); // Navigate back to home or material types list
        },
        error => {
          console.error('Error deleting material:', error);
          this.errorMessage = 'Failed to delete material.';
        }
      );
    }
  }

  reserveMaterial(): void {
    this.errorMessage = '';
    if (this.material) {
      const materialsToReserve = [{
        id: this.material.id,
        type: this.material.type,
        quantity: 1 // Assuming one instance is reserved
      }];
      this.dataService.createReservation({ ...this.reservationData, materials: materialsToReserve }).subscribe(
        () => {
          this.loadMaterialAndRooms();
        },
        error => {
          console.error('Error reserving material:', error);
          this.errorMessage = error.error.errors ? error.error.errors.join(', ') : 'Failed to reserve material.';
        }
      );
    }
  }
}