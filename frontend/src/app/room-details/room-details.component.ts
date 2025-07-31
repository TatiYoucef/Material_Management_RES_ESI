import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { DataService } from '../data.service';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import localeEnGb from '@angular/common/locales/en-GB';

@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  providers: [
    { provide: LOCALE_ID, useValue: 'en-GB' } // Set as default locale
  ],
  templateUrl: './room-details.component.html',
  styleUrl: './room-details.component.scss'
})
export class RoomDetailsComponent implements OnInit {
  room: any;
  materialsInRoom: any[] = []; // This will now store aggregated material types and their counts
  roomHistory: any[] = [];
  errorMessage: string = '';

  // For adding new room
  newRoom: any = { name: '', capacity: 0 }; // Removed materials array

  moveMaterialData = { materialType: '', quantity: 1, toRoom: '' };                      
  allRooms: any[] = []; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) {  registerLocaleData(localeEnGb);  }

  ngOnInit(): void {
    this.loadRoomDetails();
    this.dataService.getRooms({ all: true }).subscribe(res => this.allRooms = res);
  }

  loadRoomDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getRoom(id).subscribe(
        roomData => {
          this.room = roomData;
          this.loadRoomHistory(id);
          this.loadMaterialsInRoom(id);
        },
        error => {
          console.error('Error loading room:', error);
          this.errorMessage = 'Failed to load room details.';
        }
      );
    }
  }

  loadMaterialsInRoom(roomId: string): void {
    this.dataService.getMaterials({ location: roomId ,  limit: 1000  }).subscribe(
      (response: any) => {
        const materials = response.data; // These are specific material instances
        const aggregatedMaterials: { [key: string]: { type: string, count: number, instances: any[], isExpanded: boolean } } = {};

        materials.forEach((m: any) => {
          if (!aggregatedMaterials[m.type]) {
            aggregatedMaterials[m.type] = { type: m.type, count: 0, instances: [], isExpanded: false };
          }
          aggregatedMaterials[m.type].count++;
          aggregatedMaterials[m.type].instances.push(m);
        });

        this.materialsInRoom = Object.values(aggregatedMaterials);
      },
      error => {
        console.error('Error loading materials in room:', error);
        this.errorMessage = 'Failed to load materials in this room.';
      }
    );
  }

  loadRoomHistory(id: string): void {
    this.dataService.getRoomHistory(id).subscribe(
      history => {
        this.roomHistory = history.reverse();
      },
      error => {
        console.error('Error loading room history:', error);
      }
    );
  }

  toggleDetails(materialType: any): void {
    materialType.isExpanded = !materialType.isExpanded;
  }

  createRoom(): void {
    this.errorMessage = '';
    if (confirm(`Are you sure you want to create a new room: ${this.newRoom.name}?`)) {
      this.dataService.createRoom(this.newRoom).subscribe(
        () => {
          this.newRoom = { name: '', capacity: 0 }; // Reset form
          this.router.navigate(['/home']); // Navigate back to home or rooms list
        },
        error => {
          console.error('Error creating room:', error);
          this.errorMessage = error.error.errors ? error.error.errors.join(', ') : 'Failed to create room.';
        }
      );
    }
  }

  deleteRoom(): void {
    this.errorMessage = '';
    if (confirm(`Are you sure you want to delete ${this.room.name}? This action cannot be undone.`)) {
      this.dataService.deleteRoom(this.room.id).subscribe(
        () => {
          this.router.navigate(['/home']); // Navigate back to home or rooms list
        },
        error => {
          console.error('Error deleting room:', error);
          this.errorMessage = 'Failed to delete room.';
        }
      );
    }
  }

  moveMaterial(): void {
    this.errorMessage = '';
    if (this.room) {
      this.dataService.moveMaterialQuantity(this.moveMaterialData.materialType, this.moveMaterialData.quantity, this.room.id, this.moveMaterialData.toRoom).subscribe(
        () => {
          this.loadMaterialsInRoom(this.room.id);
        },
        error => {
          console.error('Error moving materials:', error);
          this.errorMessage = error.error.errors ? error.error.errors.join(', ') : 'Failed to move materials.';
        }
      );
    }
  }
}
