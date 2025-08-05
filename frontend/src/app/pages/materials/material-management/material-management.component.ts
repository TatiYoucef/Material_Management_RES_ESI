import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { NotificationService } from '../../../components/notification/notification.service';

@Component({
  selector: 'app-material-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './material-management.component.html',
  styleUrl: './material-management.component.scss'
})

export class MaterialManagementComponent implements OnInit {
  materials: any[] = [];
  rooms: any[] = [];
  newMaterial: any = { type: '', name: '', details: '', isAvailable: true, currentLocation: '', quantity: 1 };
  editingMaterial: any = null;
  originalMaterialId: string | null = null; // Store original ID for modification

  // Pagination and Filtering
  currentPage: number = 1;
  totalPages: number = 1;
  limit: number = 10; // Items per page
  searchQuery: string = '';
  filterType: string = '';
  filterAvailability: string = ''; // 'true', 'false', or ''
  filterLocation: string = '';

  // For filter dropdowns (optional, could be fetched from backend if dynamic)
  materialTypes: string[] = [];
  locations: string[] = [];

  constructor(private dataService: DataService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadMaterials();
    this.loadFilterOptions();
  }

  loadMaterials(): void {
    const params: any = {
      page: this.currentPage,
      limit: this.limit
    };

    if (this.searchQuery) {
      params.search = this.searchQuery;
    }
    if (this.filterType) {
      params.type = this.filterType;
    }
    if (this.filterAvailability !== '') {
      params.isAvailable = this.filterAvailability;
    }
    if (this.filterLocation) {
      params.location = this.filterLocation;
    }

    this.dataService.getMaterials(params).subscribe({
      next: (response: any) => {
        this.materials = response.data;
        this.totalPages = Math.ceil(response.total / this.limit);
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load materials.', type: 'error' });
      }
    });

    this.dataService.getRooms().subscribe({
      next: data => {
        this.rooms = data.data; // Access data property for paginated response
        this.rooms = this.rooms.sort((a, b) => a.name.localeCompare(b.name));
        this.locations = this.rooms.map(room => room.id);
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load rooms.', type: 'error' });
      }
    });
  }

  loadFilterOptions(): void {
    // In a real application, these would likely come from a dedicated API endpoint
    // For now, we'll derive them from existing materials or hardcode some common ones.
    this.dataService.getMaterials({ limit: 1000 }).subscribe({
      next: (response: any) => {
        const allMaterials = response.data;
        this.materialTypes = [...new Set(allMaterials.map((m: any) => m.type))].sort() as string[];
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.error || 'Failed to load material types.', type: 'error' });
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadMaterials();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadMaterials();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadMaterials();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadMaterials();
    }
  }

  addMaterial(): void {
    this.notificationService.show({ message: 'Material added successfully.', type: 'success' });
    this.dataService.createMaterial(this.newMaterial).subscribe({
      next: (response: any) => {
        this.currentPage = 1; // Reset to first page to see newly added materials
        this.loadMaterials();
        this.newMaterial = { type: '', name: '', details: '', isAvailable: true, currentLocation: '', quantity: 1 };
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to add material.'), type: 'error' });
      }
    });
  }

  editMaterial(material: any): void {
    this.editingMaterial = { ...material };
    this.originalMaterialId = material.id ;
  }

  updateMaterial(): void {
    if (this.editingMaterial) {
      const updatedMaterial = {
        ...this.editingMaterial,
        newId: this.editingMaterial.id
      };

      this.dataService.updateMaterialWithId(this.originalMaterialId!, updatedMaterial).subscribe({
        next: (material: any) => {
          this.loadMaterials();
          this.editingMaterial = null;
          this.originalMaterialId = null;
          this.notificationService.show({ message: 'Material updated successfully.', type: 'success' });
        },
        error: (err: any) => {
          this.notificationService.show({ message: err.error?.errors 
            ? err.error.errors.join(', ') 
            : (err.error.error || 'Failed to update material.'), type: 'error' });
        }
      });
    }
  }

  deleteMaterial(id: string): void {
    this.dataService.deleteMaterial(id).subscribe({
      next: () => {
        this.loadMaterials();
        this.notificationService.show({ message: 'Material deleted successfully.', type: 'success' });
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.error || 'Failed to delete material.', type: 'error' });
      }
    });
  }

  cancelEdit(): void {
    this.editingMaterial = null;
  }

  get currentMaterial() {
    return this.editingMaterial || this.newMaterial;
  }
  
}
