import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private baseUrl = 'http://localhost:3000'; // Adjust base URL as needed
  private unreadCount = new BehaviorSubject<number>(0);

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getNotification`);
  }

  getNotificationSpecificUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications`);
  }

  getUnreadNotificationCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/getUnreadCount`).pipe(
      tap((response: any) => this.unreadCount.next(response.data))
    );
  }

  markAllNotificationsAsRead(): Observable<any> {
    return this.http.post(`${this.baseUrl}/markAllAsRead`, {}).pipe(
      tap(() => {
        this.unreadCount.next(0); // Assuming all notifications are read
      })
    );
  }

  // Observable for unread count changes
  getUnreadCountObservable(): Observable<number> {
    return this.unreadCount.asObservable();
  }
}
