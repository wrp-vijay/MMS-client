// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getUsers(searchQuery: string = '', page: number = 1, limit: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('searchQuery', searchQuery)
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<{ error: boolean, msg: string, data: User[], totalPages: number, currentPage: number }>(`${this.apiUrl}/users`, { params })
      .pipe(map(response => response));
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<{ error: boolean; msg: string; data: User }>(`${this.apiUrl}/users/${id}`)
      .pipe(map(response => response.data));
  }

  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, user);
  }

  updateUser(id: number, user: User): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/users/${id}`, user);
  }
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }

  getUserProfile(): Observable<any> {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.get<any>(`${this.apiUrl}/profile`, { headers });
  }

  updateUserProfile(formData: FormData): Observable<any> {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.put<any>(`${this.apiUrl}/edit-profile`, formData, { headers });
  }

  getToken() {
    return localStorage.getItem('token');
  }

}
