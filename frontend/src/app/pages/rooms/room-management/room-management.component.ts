import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';

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
  errorMessage: string = '';

  // Pagination and Filtering
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 10; // Items per page
  searchQuery: string = '';
  filterCapacity: number | null = null;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.errorMessage = '';
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

    this.dataService.getRooms(params).subscribe(
      (response: any) => {
        this.rooms = response.data;
        this.totalPages = Math.ceil(response.total / this.limit);
      },
      (error: any) => {
        console.error('Error loading rooms:', error);
        this.errorMessage = 'Failed to load rooms.';
      }
    );
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
    this.errorMessage = '';
    this.dataService.createRoom(this.newRoom).subscribe(
      (room: any) => {
        this.loadRooms(); 
        this.newRoom = { id: '', name: '', capacity: 0 };
      },
      (error: any) => {
        console.error('Error adding room:', error);
        this.errorMessage = error.error.errors ? error.error.errors.join(', ') : 'Failed to add room.';
      }
    );
  }

  editRoom(room: any): void {
    this.editingRoom = { ...room };
    this.originalRoomId = room.id; // Store original ID
  }

  updateRoom(): void {
    this.errorMessage = '';
    if (this.editingRoom) {
      if (this.editingRoom.id !== this.originalRoomId) {
        // ID has changed, update ID first
        this.dataService.updateRoomId(this.originalRoomId!, this.editingRoom.id).subscribe(
          () => {
            // After ID is updated, proceed with updating other room details
            this.dataService.updateRoom(this.editingRoom.id, this.editingRoom).subscribe(
              (room: any) => {
                this.loadRooms();
                this.editingRoom = null;
                this.originalRoomId = null;
              },
              (error: any) => {
                console.error('Error updating room details after ID change:', error);
                this.errorMessage = error.error.errors ? error.error.errors.join(', ') : 'Failed to update room details.';
              }
            );
          },
          (error: any) => {
            console.error('Error updating room ID:', error);
            this.errorMessage = error.error.errors ? error.error.errors.join(', ') : 'Failed to update room ID.';
          }
        );
      } else {
        // No ID change, just update room details
        this.dataService.updateRoom(this.editingRoom.id, this.editingRoom).subscribe(
          (room: any) => {
            this.loadRooms();
            this.editingRoom = null;
            this.originalRoomId = null;
          },
          (error: any) => {
            console.error('Error updating room:', error);
            this.errorMessage = error.error.errors ? error.error.errors.join(', ') : 'Failed to update room.';
          }
        );
      }
    }
  }

  deleteRoom(id: string): void {
    this.errorMessage = '';
    this.dataService.deleteRoom(id).subscribe(
      () => {
        this.loadRooms();
      },
      (error: any) => {
        console.error('Error deleting room:', error);
        this.errorMessage = 'Failed to delete room.';
      }
    );
  }

  cancelEdit(): void {
    this.editingRoom = null;
  }

  get currentRoom() {
    return this.editingRoom || this.newRoom;
  }
}
