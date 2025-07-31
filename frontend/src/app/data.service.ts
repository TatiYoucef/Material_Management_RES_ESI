import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // New: Get aggregated material types
  getMaterialTypes(params?: any): Observable<any[]> {
    let httpParams = new HttpParams();
    if (params) {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    console.log('DataService: Calling /materials/types with params:', httpParams.toString());
    return this.http.get<any[]>(`${this.baseUrl}/materials/types`, { headers: this.getHeaders(), params: httpParams });
  }

  // Get all specific material instances (can be filtered by type)
  getMaterials(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    return this.http.get<any>(`${this.baseUrl}/materials`, { headers: this.getHeaders(), params: httpParams });
  }

  getRooms(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      for (let key in params) {
        httpParams = httpParams.append(key, params[key]);
      }
    }
    // Special case for getting all rooms for dropdowns
    if (params && params.all) {
      return this.http.get<any[]>(`${this.baseUrl}/rooms`, { headers: this.getHeaders(), params: httpParams });
    }
    return this.http.get<any>(`${this.baseUrl}/rooms`, { headers: this.getHeaders(), params: httpParams });
  }

  getMaterial(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/materials/${id}`, { headers: this.getHeaders() });
  }

  getRoom(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/rooms/${id}`, { headers: this.getHeaders() });
  }

  // Update a specific material instance
  updateMaterial(id: string, material: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/materials/${id}`, material, { headers: this.getHeaders() });
  }

  updateRoom(id: string, room: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/rooms/${id}`, room, { headers: this.getHeaders() });
  }

  // Create a new specific material instance
  createMaterial(material: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/materials`, material, { headers: this.getHeaders() });
  }

  createRoom(room: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/rooms`, room, { headers: this.getHeaders() });
  }

  // Delete a specific material instance
  deleteMaterial(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/materials/${id}`, { headers: this.getHeaders() });
  }

  deleteRoom(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/rooms/${id}`, { headers: this.getHeaders() });
  }

  getMaterialHistory(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/materials/${id}/history`, { headers: this.getHeaders() });
  }

  getRoomHistory(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/rooms/${id}/history`, { headers: this.getHeaders() });
  }

  // New: Move a specific material instance
  moveMaterial(id: string, newLocation: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/materials/${id}/move`, { newLocation }, { headers: this.getHeaders() });
  }

  // New: Reserve/Unreserve a specific material instance
  reserveMaterial(id: string, reserve: boolean): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/materials/${id}/reserve`, { reserve }, { headers: this.getHeaders() });
  }

  // New: Update material ID
  updateMaterialId(oldId: string, newId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/materials/${oldId}/id`, { newId }, { headers: this.getHeaders() });
  }

  // New: Update room ID
  updateRoomId(oldId: string, newId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/rooms/${oldId}/id`, { newId }, { headers: this.getHeaders() });
  }

  getReservations(searchQuery: string): Observable<any[]> {
    let params = new HttpParams();
    if (searchQuery) {
      params = params.set('search', searchQuery);
    }
    return this.http.get<any[]>(`${this.baseUrl}/reservations`, { headers: this.getHeaders(), params });
  }

  createReservation(reservation: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/reservations`, reservation, { headers: this.getHeaders() });
  }

  moveMaterialQuantity(materialType: string, quantity: number, fromRoom: string, toRoom: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/materials/move-quantity`, { materialType, quantity, fromRoom, toRoom }, { headers: this.getHeaders() });
  }
}