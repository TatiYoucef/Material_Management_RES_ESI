import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../data.service';

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
  errorMessage: string = '';

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

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.loadMaterials();
    this.loadFilterOptions();
  }

  loadMaterials(): void {
    this.errorMessage = '';
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

    this.dataService.getMaterials(params).subscribe(
      (response: any) => {
        this.materials = response.data;
        this.totalPages = Math.ceil(response.total / this.limit);
      },
      (error: any) => {
        console.error('Error loading materials:', error);
        this.errorMessage = 'Failed to load materials.';
      }
    );

    this.dataService.getRooms().subscribe(
      data => {
        this.rooms = data.data; // Access data property for paginated response
        this.rooms = this.rooms.sort((a, b) => a.name.localeCompare(b.name));
        this.locations = this.rooms.map(room => room.id);
      },
      error => {
        console.error('Error loading rooms:', error);
        // Don't set error message here, as material might still load
      }
    );
  }

  loadFilterOptions(): void {
    // In a real application, these would likely come from a dedicated API endpoint
    // For now, we'll derive them from existing materials or hardcode some common ones.
    this.dataService.getMaterials({ limit: 1000 }).subscribe((response: any) => {
      const allMaterials = response.data;
      this.materialTypes = [...new Set(allMaterials.map((m: any) => m.type))].sort() as string[];
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
    this.errorMessage = '';
    this.dataService.createMaterial(this.newMaterial).subscribe(
      (response: any) => {
        this.currentPage = 1; // Reset to first page to see newly added materials
        this.loadMaterials();
        this.newMaterial = { type: '', name: '', details: '', isAvailable: true, currentLocation: '', quantity: 1 };
      },
      (error: any) => {
        console.error('Error adding material:', error);
        this.errorMessage = error.error.errors ? error.error.errors.join(', ') : 'Failed to add material.';
      }
    );
  }

  editMaterial(material: any): void {
    this.editingMaterial = { ...material };
    this.originalMaterialId = material.id ;
  }

  updateMaterial(): void {
    this.errorMessage = '';
    
    if (this.editingMaterial) {
      if (this.editingMaterial.id !== this.originalMaterialId) {
        // ID has changed, update ID first
        this.dataService.updateMaterialId(this.originalMaterialId!, this.editingMaterial.id).subscribe(
          () => {
            // After ID is updated, proceed with updating other material details
            this.dataService.updateMaterial(this.editingMaterial.id, this.editingMaterial).subscribe(
              (material: any) => {
                this.loadMaterials();
                this.editingMaterial = null;
                this.originalMaterialId = null;
              },
              (error: any) => {
                console.error('Error updating material details after ID change:', error);
                this.errorMessage = error.error?.errors 
                  ? error.error.errors.join(', ') 
                  : 'Failed to update material details after ID change.';
              }
            );
          },
          (error: any) => {
            console.error('Error updating material ID:', error);
            this.errorMessage = error.error?.errors 
              ? error.error.errors.join(', ') 
              : 'Failed to update material ID.';
          }
        );
      } else {
        // No ID change, just update material details
        this.dataService.updateMaterial(this.editingMaterial.id, this.editingMaterial).subscribe(
          (material: any) => {
            this.loadMaterials();
            this.editingMaterial = null;
            this.originalMaterialId = null;
          },
          (error: any) => {
            console.error('Error updating material:', error);
            this.errorMessage = error.error?.errors 
              ? error.error.errors.join(', ') 
              : 'Failed to update material.';
          }
        );
      }
    }
  }

  deleteMaterial(id: string): void {
    this.errorMessage = '';
    this.dataService.deleteMaterial(id).subscribe(
      () => {
        this.loadMaterials();
      },
      (error: any) => {
        console.error('Error deleting material:', error);
        this.errorMessage = 'Failed to delete material.';
      }
    );
  }

  cancelEdit(): void {
    this.editingMaterial = null;
  }

  get currentMaterial() {
    return this.editingMaterial || this.newMaterial;
  }
  
}
