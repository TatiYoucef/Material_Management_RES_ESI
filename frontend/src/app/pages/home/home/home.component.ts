import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  materialTypes: any = { data: [], page: 1, totalPages: 1 };
  rooms: any = { data: [], page: 1, totalPages: 1 };
  searchQuery: string = '';
  roomCapacityFilter: number | null = null;
  viewMode: 'materialTypes' | 'rooms' = 'materialTypes'; // Default view

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadMaterialTypes();
    this.loadRooms();
  }

  loadMaterialTypes(page: number = 1): void {
    const params: any = {
      page: page,
      limit: 6
    };
    if (this.searchQuery && this.viewMode === 'materialTypes') {
      params.search = this.searchQuery;
    }
    this.dataService.getMaterialTypes(params).subscribe(response => {
      this.materialTypes = response;
    });
  }

  loadRooms(page: number = 1): void {
    const params: any = {
      page: page,
      limit: 5
    };
    if (this.searchQuery && this.viewMode === 'rooms') {
      params.search = this.searchQuery;
    }
    if (this.roomCapacityFilter) {
      params.capacity = this.roomCapacityFilter;
    }

    this.dataService.getRooms(params).subscribe(response => {
      this.rooms = response;
    });
  }

  onSearch(): void {
    if (this.viewMode === 'materialTypes') {
      this.loadMaterialTypes();
    } else {
      this.loadRooms();
    }
  }

  onRoomCapacityFilterChange(): void {
    this.loadRooms();
  }

  changeView(mode: 'materialTypes' | 'rooms'): void {
    this.viewMode = mode;
  }

  nextPage(): void {
    if (this.viewMode === 'materialTypes') {
      if (this.materialTypes.next) {
        this.loadMaterialTypes(this.materialTypes.next.page);
      }
    } else {
      if (this.rooms.next) {
        this.loadRooms(this.rooms.next.page);
      }
    }
  }

  prevPage(): void {
    if (this.viewMode === 'materialTypes') {
      if (this.materialTypes.previous) {
        this.loadMaterialTypes(this.materialTypes.previous.page);
      }
    } else {
      if (this.rooms.previous) {
        this.loadRooms(this.rooms.previous.page);
      }
    }
  }
}
