import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { NotificationService } from '../../services/notification.service'; // Adjust path as necessary

@Injectable({
  providedIn: 'root'
})
export class NavbarResolver implements Resolve<any> {
  constructor(private notificationService: NotificationService) {}

  resolve(): Observable<any> {
    return this.notificationService.getUnreadNotificationCount().pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Failed to load unread count:', error);
        return of(0); // Return a default value of 0 if there's an error
      })
    );
  }
}
