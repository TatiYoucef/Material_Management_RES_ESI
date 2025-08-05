import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number; // in milliseconds
  dismissible?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification | null>();

  constructor() { }

  show(notification: Notification): void {
    this.notificationSubject.next(notification);
  }

  clearNotification(): void {
    this.notificationSubject.next(null);
  }

  getNotification(): Observable<Notification | null> {
    return this.notificationSubject.asObservable();
  }
}
