import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { DataService } from '../../../services/data.service';

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
  summary = { available: 0, reserved: 0 };
  roomSummary: any = {};
  errorMessage: string = '';

  // Pagination and Filtering
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 6; // Items per page
  searchQuery: string = '';
  filterAvailability: string = ''; // 'true', 'false', or ''
  filterLocation: string = '';

  // For filter dropdowns (optional, could be fetched from backend if dynamic)
  locations: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.materialType = params.get('type');
      if (this.materialType) {
        this.loadMaterialInstances(this.materialType);
      }
    });
  }

  loadMaterialInstances(type: string): void {
    this.errorMessage = '';
    const params: any = {
      page: this.currentPage,
      limit: this.limit,
      type: type // Always filter by type for this component
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    if (this.filterAvailability !== '') {
      params.isAvailable = this.filterAvailability;
    }
    if (this.filterLocation) {
      params.location = this.filterLocation;
    }

    this.dataService.getMaterials(params).subscribe(
      (response: any) => {
        this.materialInstances = response.data;
        this.totalPages = Math.ceil(response.total / this.limit);
        this.summary = response.summary;
        this.roomSummary = response.roomSummary;
      },
      (error: any) => {
        console.error('Error loading material instances:', error);
        this.errorMessage = 'Failed to load material instances.';
      }
    );
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
