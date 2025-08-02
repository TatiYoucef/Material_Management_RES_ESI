import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {
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

  uploadFile(file: File, title: string, description: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);

    return this.http.post(`${this.baseUrl}/files/upload`, formData, { headers: this.getHeaders() });
  }

  getFiles(search?: string): Observable<any[]> {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    return this.http.get<any[]>(`${this.baseUrl}/files`, { headers: this.getHeaders(), params });
  }

  getFile(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/files/${id}`, { headers: this.getHeaders() });
  }

  downloadFile(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/files/download/${id}`, { headers: this.getHeaders(), responseType: 'blob' });
  }

  deleteFile(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/files/${id}`, { headers: this.getHeaders() });
  }
}