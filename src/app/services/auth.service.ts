import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

interface Permissions {
  [key: string]: string[]; // Key is a string representing the resource name, value is an array of permissions
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000'; // Replace with your actual API URL
  private permissionsSubject = new BehaviorSubject<Permissions>({});
  public permissions$ = this.permissionsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadPermissions(); // Ensure permissions are loaded when service is instantiated
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => 
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Token decoding error:', e);
      return {};
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password }).pipe(
      map((response) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
          this.loadPermissions(); // Load permissions on login
        }
        return response;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.permissionsSubject.next({}); // Clear permissions on logout
  }

  isLogdin(): boolean {
    return typeof window !== 'undefined' && localStorage.getItem('token') != null;
  }

  getUserRole(): string {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = this.decodeToken(token);
      return decodedToken.role || ''; 
    }
    return '';
  }
  getUserId(): string | null {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken: any = this.decodeToken(token);
      return decodedToken.userId || null;
    }
    return null;
  }
  

  private loadPermissions(): void {
    const userRole = this.getUserRole().toLowerCase();
    this.http.get<any>(`${this.apiUrl}/roles`).subscribe(response => {
      const role = response.data.find((r: any) => r.name.toLowerCase() === userRole);
      if (role && role.permissions) {
        this.permissionsSubject.next(JSON.parse(role.permissions) as Permissions);
      } else {
        this.permissionsSubject.next({});
      }
    });
  }

  hasPermission(resource: string, action: string): boolean {
    let permissions: Permissions = {};
    this.permissions$.subscribe(perm => permissions = perm);
    const resourcePermissions = permissions[resource.toUpperCase()] || [];
    return resourcePermissions.includes(action);
  }
}
