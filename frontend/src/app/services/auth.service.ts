import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // Adjust if your backend runs on a different port

  constructor(private http: HttpClient) { }

  // In auth.service.ts
  login(username: string, password: string): Observable<boolean> {
    return this.http.post<{ token?: string }>(`${this.apiUrl}/login`, { username, password }).pipe(
      map(response => {
        if (!response?.token) {
          console.error('Login failed: No token provided.');
          return false;
        }
        localStorage.setItem('authToken', response.token);
        return true;
      }),
      catchError(error => {
        console.error('Login failed:', error);
        return of(false);
      })
    );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }
}