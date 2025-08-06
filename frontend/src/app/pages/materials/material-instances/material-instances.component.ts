import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { DataService } from '../../../services/data.service';
import { NotificationService } from '../../../components/notification/notification.service';

@Component({
  selector: 'app-material-instances',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // Add FormsModule here
  templateUrl: './material-instances.component.html',
  styleUrl: './material-instances.component.scss'
})
export class MaterialInstancesComponent implements OnInit {
  materialType: string | null = null;
  materialInstances: any[] = [];
  summary = { available: 0, reserved: 0, serving: 0 };
  roomSummary: any = {};

  // Pagination and Filtering
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 6; // Items per page
  searchQuery: string = '';
  filterStatus: string = '';
  filterLocation: string = '';

  // For filter dropdowns (optional, could be fetched from backend if dynamic)
  locations: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.materialType = params.get('type');
      if (this.materialType) {
        this.loadMaterialInstances(this.materialType);
      }
      this.dataService.getRooms({ all: true }).subscribe({
        next: res => {
          this.locations = res.map((r: { id: any; }) => r.id);
        },
        error: (err: any) => {
          this.notificationService.show({ message: err.error.error || 'Failed to load locations.', type: 'error' });
        }
      });
    });
  }

  loadMaterialInstances(type: string): void {
    const params: any = {
      page: this.currentPage,
      limit: this.limit,
      type: type // Always filter by type for this component
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    if (this.filterStatus === 'available') {
      params.isAvailable = true;
      params.isServing = false;
    } else if (this.filterStatus === 'reserved') {
      params.isAvailable = false;
    } else if (this.filterStatus === 'serving') {
      params.isAvailable = true;
      params.isServing = true;
    }
    if (this.filterLocation) {
      params.location = this.filterLocation;
    }

    this.dataService.getMaterials(params).subscribe({
      next: (response: any) => {
        this.materialInstances = response.data;
        this.totalPages = Math.ceil(response.total / this.limit);
        this.summary = response.summary;
        this.roomSummary = response.roomSummary;
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load material instances.', type: 'error' });
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    if (this.materialType) {
      this.loadMaterialInstances(this.materialType);
    }
  }

  onFilterChange(): void {
    this.currentPage = 1;
    if (this.materialType) {
      this.loadMaterialInstances(this.materialType);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.materialType) {
        this.loadMaterialInstances(this.materialType);
      }
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.materialType) {
        this.loadMaterialInstances(this.materialType);
      }
    }
  }

  getRoomNames(): string[] {
    return Object.keys(this.roomSummary);
  }
}
