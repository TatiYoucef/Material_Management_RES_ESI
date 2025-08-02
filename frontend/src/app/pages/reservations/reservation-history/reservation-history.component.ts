import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-reservation-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reservation-history.component.html',
  styleUrls: ['./reservation-history.component.scss']
})
export class ReservationHistoryComponent implements OnInit {
  reservations: any[] = [];
  searchQuery: string = '';
  statusFilter: string = 'all'; // 'all', 'active', 'ended', 'cancelled'
  startDateFilter: string = '';
  endDateFilter: string = '';
  errorMessage: string = '';

  constructor(private dataService: DataService, private router: Router) { }

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    const filters: any = {
      search: this.searchQuery,
      status: this.statusFilter === 'all' ? undefined : this.statusFilter,
      startDate: this.startDateFilter,
      endDate: this.endDateFilter
    };

    this.dataService.getReservations(filters).subscribe(data => {
      this.reservations = data.map(r => ({
        ...r,
        isExpanded: false, // For the overall reservation row
        aggregatedMaterials: this.aggregateMaterials(r.materials) // New: Aggregate materials
      }));
    });
  }

  // Helper to aggregate materials by type
  private aggregateMaterials(materials: any[]): any[] {
    const aggregated: { [key: string]: { type: string, count: number, instances: any[], isExpanded: boolean } } = {};

    materials.forEach((m: any) => {
      if (!aggregated[m.type]) {
        aggregated[m.type] = { type: m.type, count: 0, instances: [], isExpanded: false };
      }
      aggregated[m.type].count++;
      aggregated[m.type].instances.push(m);
    });

    return Object.values(aggregated);
  }

  toggleMaterialTypeDetails(materialType: any): void {
    materialType.isExpanded = !materialType.isExpanded;
  }

  toggleDetails(reservation: any): void {
    reservation.isExpanded = !reservation.isExpanded;
  }

  viewReservation(id: string): void {
    this.router.navigate(['/reservations', id]);
  }

  createReservation(): void {
    this.router.navigate(['/reservations/new']);
  }

  deleteReservation(id: string): void {
    if (confirm('Are you sure you want to delete this reservation?')) {
      this.dataService.deleteReservation(id).subscribe(() => {
        this.loadReservations();
      });
    }
  }
}