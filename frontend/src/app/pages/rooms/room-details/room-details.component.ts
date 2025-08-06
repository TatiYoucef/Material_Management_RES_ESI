import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import localeEnGb from '@angular/common/locales/en-GB';
import { NotificationService } from '../../../components/notification/notification.service';

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

  // For adding new room
  newRoom: any = { name: '', capacity: 0 }; // Removed materials array

  moveMaterialData = { materialType: '', quantity: 1, toRoom: '' };                      
  allRooms: any[] = []; 
  showMoveMaterialForm: boolean = false; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService,
    private notificationService: NotificationService
  ) {  registerLocaleData(localeEnGb);  }

  ngOnInit(): void {
    this.loadRoomDetails();
    this.dataService.getRooms({ all: true }).subscribe({
      next: res => this.allRooms = res,
      error: (err) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load rooms.', type: 'error' });
      }
    });
  }

  loadRoomDetails(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getRoom(id).subscribe({
        next: roomData => {
          this.room = roomData;
          this.loadRoomHistory(id);
          this.loadMaterialsInRoom(id);
        },
        error: (err: any) => {
          this.notificationService.show({ message: err.error.error || 'Failed to load room details.', type: 'error' });
        }
      });
    }
  }

  loadMaterialsInRoom(roomId: string): void {
    this.dataService.getMaterials({ location: roomId ,  limit: 1000  }).subscribe({
      next: (response: any) => {
        const materials = response.data; // These are specific material instances
        const aggregatedMaterials: { [key: string]: { type: string, count: number, available: number, reserved: number, serving: number, instances: any[], isExpanded: boolean } } = {};

        materials.forEach((m: any) => {
          if (!aggregatedMaterials[m.type]) {
            aggregatedMaterials[m.type] = { type: m.type, count: 0, available: 0, reserved: 0, serving: 0, instances: [], isExpanded: false };
          }
          aggregatedMaterials[m.type].count++;
          if (m.isAvailable) {
            aggregatedMaterials[m.type].available++;
          } else {
            aggregatedMaterials[m.type].reserved++;
          }
          if (m.isServing) {
            aggregatedMaterials[m.type].serving++;
          }
          aggregatedMaterials[m.type].instances.push(m);
        });

        this.materialsInRoom = Object.values(aggregatedMaterials);
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load materials in this room.', type: 'error' });
      }
    });
  }

  loadRoomHistory(id: string): void {
    this.dataService.getRoomHistory(id).subscribe({
      next: history => {
        this.roomHistory = history.reverse();
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load room history.', type: 'error' });
      }
    });
  }

  toggleDetails(materialType: any): void {
    materialType.isExpanded = !materialType.isExpanded;
  }

  createRoom(): void {
    if (confirm(`Are you sure you want to create a new room: ${this.newRoom.name}?`)) {
      this.dataService.createRoom(this.newRoom).subscribe({
        next: () => {
          this.newRoom = { name: '', capacity: 0 }; // Reset form
          this.router.navigate(['/home']); // Navigate back to home or rooms list
          this.notificationService.show({ message: 'Room created successfully.', type: 'success' });
        },
        error: (err: any) => {
          this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to create room.'), type: 'error' });
        }
      });
    }
  }

  deleteRoom(): void {
    if (confirm(`Are you sure you want to delete ${this.room.name}? This action cannot be undone.`)) {
      this.dataService.deleteRoom(this.room.id).subscribe({
        next: () => {
          this.router.navigate(['/home']); // Navigate back to home or rooms list
          this.notificationService.show({ message: 'Room deleted successfully.', type: 'success' });
        },
        error: (err: any) => {
          this.notificationService.show({ message: err.error.error || 'Failed to delete room.', type: 'error' });
        }
      });
    }
  }

  moveMaterial(): void {
    if (this.room) {
      this.dataService.moveMaterialQuantity(this.moveMaterialData.materialType, this.moveMaterialData.quantity, this.room.id, this.moveMaterialData.toRoom).subscribe({
        next: () => {
          this.loadMaterialsInRoom(this.room.id);
          this.notificationService.show({ message: 'Materials moved successfully.', type: 'success' });
        },
        error: (err: any) => {
          this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to move materials.'), type: 'error' });
        }
      });
    }
  }
}