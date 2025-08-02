import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reservation-details.component.html',
  styleUrls: ['./reservation-details.component.scss']
})

export class ReservationDetailsComponent implements OnInit {
  reservation: any;
  aggregatedMaterials: any[] = []; // New property for aggregated materials
  errorMessage: string = '';
  showAddMaterials = false;

  materialRequestType: 'type' | 'id' = 'type';
  materialRequest = {
    type: '',
    quantity: 1,
    fromRoom: '',
    ids: ''
  };
  rooms: any[] = [];
  materialTypes: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.loadReservation();
    this.dataService.getRooms({ all: true }).subscribe(data => {
      this.rooms = data;
    });
    this.dataService.getMaterialTypes().subscribe((data: any) => {
      this.materialTypes = data.data;
    });
  }

  loadReservation(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.dataService.getReservation(id).subscribe(
        data => {
          this.reservation = data;
          this.aggregateMaterials();
        },
        error => {
          this.errorMessage = 'Failed to load reservation details.';
        }
      );
    }
  }

  aggregateMaterials(): void {
    const aggregated: { [key: string]: { type: string, count: number, instances: any[], isExpanded: boolean } } = {};

    this.reservation.materials.forEach((m: any) => {
      if (!aggregated[m.type]) {
        aggregated[m.type] = { type: m.type, count: 0, instances: [], isExpanded: false };
      }
      aggregated[m.type].count++;
      aggregated[m.type].instances.push(m);
    });

    this.aggregatedMaterials = Object.values(aggregated);
  }

  toggleDetails(materialType: any): void {
    materialType.isExpanded = !materialType.isExpanded;
  }

  cancelReservation(): void {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.dataService.cancelReservation(this.reservation.id).subscribe(() => {
        this.loadReservation();
      });
    }
  }

  endReservation(): void {
    if (confirm('Are you sure you want to end this reservation?')) {
      this.dataService.endReservation(this.reservation.id).subscribe(() => {
        this.loadReservation();
      });
    }
  }

  deleteReservation(id: string): void {
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.dataService.deleteReservation(id).subscribe(() => {
        this.router.navigate(['/reservations']); // Navigate back to reservation history
      });
    }
  }

  addMaterials(): void {
    let materialsToAdd: any;
    if (this.materialRequestType === 'type') {
      materialsToAdd = [{ 
        type: this.materialRequest.type, 
        quantity: this.materialRequest.quantity, 
        fromRoom: this.materialRequest.fromRoom 
      }];
    } else {
      materialsToAdd = [{ 
        ids: this.materialRequest.ids.split(',').map(id => id.trim()) 
      }];
    }

    this.dataService.addMaterialsToReservation(this.reservation.id, materialsToAdd).subscribe(() => {
      this.loadReservation();
      this.showAddMaterials = false;
      // Reset form
      this.materialRequest = {
        type: '',
        quantity: 1,
        fromRoom: '',
        ids: ''
      };
    });
  }
}