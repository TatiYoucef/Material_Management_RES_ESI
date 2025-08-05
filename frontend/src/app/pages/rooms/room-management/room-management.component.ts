import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { NotificationService } from '../../../components/notification/notification.service';

@Component({
  selector: 'app-room-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-management.component.html',
  styleUrl: './room-management.component.scss'
})
export class RoomManagementComponent implements OnInit {
  rooms: any[] = [];
  newRoom: any = { name: '', capacity: 0 };
  editingRoom: any = null;
  originalRoomId: string | null = null; // Store original ID for modification

  // Pagination and Filtering
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 10; // Items per page
  searchQuery: string = '';
  filterCapacity: number | null = null;

  constructor(private dataService: DataService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    const params: any = {
      page: this.currentPage,
      limit: this.limit
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    if (this.filterCapacity) {
      params.capacity = this.filterCapacity;
    }

    this.dataService.getRooms(params).subscribe({
      next: (response: any) => {
        this.rooms = response.data;
        this.totalPages = Math.ceil(response.total / this.limit);
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load rooms.', type: 'error' });
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadRooms();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadRooms();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadRooms();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadRooms();
    }
  }

  addRoom(): void {
    this.dataService.createRoom(this.newRoom).subscribe({
      next: (room: any) => {
        this.loadRooms(); 
        this.newRoom = { id: '', name: '', capacity: 0 };
        this.notificationService.show({ message: 'Room added successfully.', type: 'success' });
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to add room.'), type: 'error' });
      }
    });
  }

  editRoom(room: any): void {
    this.editingRoom = { ...room };
    this.originalRoomId = room.id; // Store original ID
  }

  updateRoom(): void {
    if (this.editingRoom) {
      if (this.editingRoom.id !== this.originalRoomId) {
        // ID has changed, update ID first
        this.dataService.updateRoomId(this.originalRoomId!, this.editingRoom.id).subscribe({
          next: () => {
            // After ID is updated, proceed with updating other room details
            this.dataService.updateRoom(this.editingRoom.id, this.editingRoom).subscribe({
              next: (room: any) => {
                this.loadRooms();
                this.editingRoom = null;
                this.originalRoomId = null;
                this.notificationService.show({ message: 'Room updated successfully.', type: 'success' });
              },
              error: (err: any) => {
                this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to update room details.'), type: 'error' });
              }
            });
          },
          error: (err: any) => {
            this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to update room ID.'), type: 'error' });
          }
        });
      } else {
        // No ID change, just update room details
        this.dataService.updateRoom(this.editingRoom.id, this.editingRoom).subscribe({
          next: (room: any) => {
            this.loadRooms();
            this.editingRoom = null;
            this.originalRoomId = null;
            this.notificationService.show({ message: 'Room updated successfully.', type: 'success' });
          },
          error: (err: any) => {
            this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to update room.'), type: 'error' });
          }
        });
      }
    }
  }

  deleteRoom(id: string): void {
    this.dataService.deleteRoom(id).subscribe({
      next: () => {
        this.loadRooms();
        this.notificationService.show({ message: 'Room deleted successfully.', type: 'success' });
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.error || 'Failed to delete room.', type: 'error' });
      }
    });
  }

  cancelEdit(): void {
    this.editingRoom = null;
  }

  get currentRoom() {
    return this.editingRoom || this.newRoom;
  }
}
