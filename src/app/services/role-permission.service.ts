import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService implements OnDestroy {
  private apiUrl = 'http://localhost:3000'; // Adjust with your API base URL
  private subscriptions: Subscription = new Subscription();

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getRoles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/roles`);
  }
  
  getPermissions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/permissions`);
  }

  createRole(role: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/roles`, role);
  }

  updatePermissions(updates: { roleId: number, permissions: { [key: string]: string[] } }[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/permissions`, { updates });
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/roles/${id}`);
  }
}
