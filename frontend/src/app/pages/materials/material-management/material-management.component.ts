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

  showCustomIds: boolean = false;
  customIds: string[] = [];
  idStart: number | null = null;
  idEnd: number | null = null;
  idCommas: string = '';
  idInputMode: 'none' | 'enumerated' | 'commaSeparated' = 'none';

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
  selectedType: string = ''; // For dropdown selection
  newTypeName: string = ''; // For new type input
  showNewTypeInput: boolean = false;

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

  toggleCustomIds(): void {
    this.showCustomIds = !this.showCustomIds;
    if (!this.showCustomIds) {
      this.clearCustomIds();
      this.idInputMode = 'none';
    }
  }

  addEnumeratedIds(): void {
    if (this.idStart !== null && this.idEnd !== null && this.idStart <= this.idEnd) {
      for (let i = this.idStart; i <= this.idEnd; i++) {
        const id = i.toString();
        if (!this.customIds.includes(id)) {
          this.customIds.push(id);
        }
      }
      this.idStart = null;
      this.idEnd = null;
      this.updateNewMaterialQuantity();
    }
  }

  addCommaSeparatedIds(): void {
    if (this.idCommas) {
      const ids = this.idCommas.split(',').map(id => id.trim()).filter(id => id);
      for (const id of ids) {
        if (!this.customIds.includes(id)) {
          this.customIds.push(id);
        }
      }
      this.idCommas = '';
      this.updateNewMaterialQuantity();
    }
  }

  selectIdInputMode(mode: 'enumerated' | 'commaSeparated'): void {
    this.idInputMode = mode;
    this.clearCustomIds(); // Clear any previously added IDs when changing mode
  }

  clearCustomIds(): void {
    this.customIds = [];
    this.idStart = null;
    this.idEnd = null;
    this.idCommas = '';
    this.updateNewMaterialQuantity();
  }

  updateNewMaterialQuantity(): void {
    if (this.showCustomIds) {
      this.newMaterial.quantity = this.customIds.length;
    } else {
      this.newMaterial.quantity = 1; // Default quantity
    }
  }

  handleTypeChange(): void {
    if (this.selectedType === '__new__') {
      this.showNewTypeInput = true;
      this.newTypeName = ''; // Clear previous new type input
    } else {
      this.showNewTypeInput = false;
      this.newTypeName = '';
      this.newMaterial.type = this.selectedType; // Set type from selected existing type
    }
  }

  addMaterial(): void {
    if (!this.newMaterial.name || !this.newMaterial.currentLocation) {
      this.notificationService.show({ message: 'Please fill in all required fields.', type: 'warning' });
      return;
    }

    if (this.showNewTypeInput) {
      if (!this.newTypeName.trim()) {
        this.notificationService.show({ message: 'Please enter a new material type.', type: 'warning' });
        return;
      }
      this.newMaterial.type = this.newTypeName.trim();
    } else if (!this.selectedType) {
      this.notificationService.show({ message: 'Please select an existing material type or add a new one.', type: 'warning' });
      return;
    }

    const materialToCreate = { ...this.newMaterial };

    if (this.showCustomIds) {
      if (this.customIds.length === 0) {
        this.notificationService.show({ message: 'Please add at least one custom ID or disable custom IDs.', type: 'warning' });
        return;
      }
      materialToCreate.customIds = this.customIds;
      materialToCreate.quantity = this.customIds.length; // Ensure quantity matches custom IDs
    }

    this.dataService.createMaterial(materialToCreate).subscribe({
      next: (response: any) => {
        this.currentPage = 1; // Reset to first page to see newly added materials
        this.loadMaterials();
        this.newMaterial = { type: '', name: '', details: '', isAvailable: true, currentLocation: '', quantity: 1 };
        this.clearCustomIds();
        this.showCustomIds = false; // Reset toggle
        this.selectedType = ''; // Reset selected type
        this.newTypeName = ''; // Reset new type name
        this.showNewTypeInput = false; // Reset new type input visibility
        this.notificationService.show({ message: 'Material added successfully.', type: 'success' });
      },
      error: (err: any) => {
        this.notificationService.show({ message: err.error.errors ? err.error.errors.join(', ') : (err.error.error || 'Failed to add material.'), type: 'error' });
      }
    });
  }

  editMaterial(material: any): void {
    this.editingMaterial = { ...material };
    this.originalMaterialId = material.id;
    // Set selectedType for editing existing material
    this.selectedType = material.type;
    this.showNewTypeInput = false; // Hide new type input when editing
  }

  updateMaterial(): void {
    if (this.editingMaterial) {
      if (!this.editingMaterial.name || !this.editingMaterial.currentLocation) {
        this.notificationService.show({ message: 'Please fill in all required fields for editing.', type: 'warning' });
        return;
      }

      // If editing and a new type is being entered
      if (this.showNewTypeInput) {
        if (!this.newTypeName.trim()) {
          this.notificationService.show({ message: 'Please enter a new material type.', type: 'warning' });
          return;
        }
        this.editingMaterial.type = this.newTypeName.trim();
      } else if (!this.selectedType) {
        this.notificationService.show({ message: 'Please select an existing material type or add a new one.', type: 'warning' });
        return;
      } else {
        this.editingMaterial.type = this.selectedType;
      }

      const updatedMaterial = {
        ...this.editingMaterial,
        newId: this.editingMaterial.id
      };

      this.dataService.updateMaterialWithId(this.originalMaterialId!, updatedMaterial).subscribe({
        next: (material: any) => {
          this.loadMaterials();
          this.editingMaterial = null;
          this.originalMaterialId = null;
          this.selectedType = ''; // Reset selected type
          this.newTypeName = ''; // Reset new type name
          this.showNewTypeInput = false; // Reset new type input visibility
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
    this.selectedType = ''; // Reset selected type
    this.newTypeName = ''; // Reset new type name
    this.showNewTypeInput = false; // Reset new type input visibility
  }

  get currentMaterial() {
    return this.editingMaterial || this.newMaterial;
  }
  
}
