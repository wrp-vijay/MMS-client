// import { Injectable } from '@angular/core';
// import { map, Observable } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
// import { Inventory, WorkOrder } from './product.model';
// import { ToastrService } from 'ngx-toastr';

// @Injectable({
//   providedIn: 'root'
// })
// export class WorkorderService {

//   private apiUrl = 'http://localhost:3000/workorders';

//   constructor(private http: HttpClient, private toastr: ToastrService) {}

//   private handleError(error: HttpErrorResponse): Observable<never> {
//     this.toastr.error('An error occurred', 'Error');
//     throw error;
//   }

//   getWorkOrders(): Observable<WorkOrder[]> {
//     return this.http.get<{ error: boolean, msg: string, data: WorkOrder[] }>(this.apiUrl).pipe(
//       map(response => response.data),
//       catchError(this.handleError)
//     );
//   }

//   getWorkOrderById(id: number): Observable<WorkOrder> {
//     return this.http.get<{ error: boolean, msg: string, data: WorkOrder }>(`${this.apiUrl}/${id}`).pipe(
//       map(response => response.data),
//       catchError(this.handleError)
//     );
//   }

//   createWorkOrder(workOrder: WorkOrder): Observable<WorkOrder> {
//     return this.http.post<{ error: boolean, msg: string, data: WorkOrder }>(this.apiUrl, workOrder).pipe(
//       map(response => response.data),
//       catchError(this.handleError)
//     );
//   }

//   updateWorkOrder(id: number, workOrder: WorkOrder): Observable<WorkOrder> {
//     return this.http.put<{ error: boolean, msg: string, data: WorkOrder }>(`${this.apiUrl}/${id}`, workOrder).pipe(
//       map(response => response.data),
//       catchError(this.handleError)
//     );
//   }

//   deleteWorkOrder(id: number): Observable<void> {
//     return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
//       catchError(this.handleError)
//     );
//   }

//   generateWorkOrderReport(startDate: string, endDate: string): Observable<WorkOrder[]> {
//   return this.http.get<{error: boolean, msg: string, data: WorkOrder[]}>(`http://localhost:3000/generateWorkOrderReport?startDate=${startDate}&endDate=${endDate}`).pipe(
//     map(response => response.data)
//   );
// }

// getAllInventory(): Observable<Inventory[]> {
//   return this.http.get<Inventory[]>('http://localhost:3000/inventory');
// }

// generateInventoryReport(startDate: string, endDate: string): Observable<WorkOrder[]> {
//   return this.http.get<{error: boolean, msg: string, data: WorkOrder[]}>(`http://localhost:3000/inventoryhistory-report?startDate=${startDate}&endDate=${endDate}`).pipe(
//     map(response => response.data)
//   );
// }
// }

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { Inventory, WorkOrder } from './product.model';

@Injectable({
  providedIn: 'root'
})
export class WorkorderService {
  private apiUrl = 'http://localhost:3000/workorders';

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  private handleError(error: HttpErrorResponse): Observable<never> {
    this.toastr.error('An error occurred', 'Error');
    throw error;
  }

  getWorkOrders(): Observable<WorkOrder[]> {
    return this.http.get<{ error: boolean, msg: string, data: WorkOrder[] }>(this.apiUrl).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  getWorkOrderById(id: number): Observable<WorkOrder> {
    return this.http.get<{ error: boolean, msg: string, data: WorkOrder }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  createWorkOrder(workOrder: WorkOrder): Observable<WorkOrder> {
    return this.http.post<{ error: boolean, msg: string, data: WorkOrder }>(this.apiUrl, workOrder).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  updateWorkOrder(id: number, workOrder: WorkOrder): Observable<WorkOrder> {
    return this.http.put<{ error: boolean, msg: string, data: WorkOrder }>(`${this.apiUrl}/${id}`, workOrder).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  deleteWorkOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  generateWorkOrderReport(startDate: string, endDate: string): Observable<WorkOrder[]> {
    return this.http.get<{ error: boolean, msg: string, data: WorkOrder[] }>(`${this.apiUrl}/report?startDate=${startDate}&endDate=${endDate}`).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

  getAllInventory(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>('http://localhost:3000/inventory').pipe(
      catchError(this.handleError)
    );
  }

  generateInventoryReport(startDate: string, endDate: string): Observable<WorkOrder[]> {
    return this.http.get<{ error: boolean, msg: string, data: WorkOrder[] }>(`http://localhost:3000/inventoryhistory-report?startDate=${startDate}&endDate=${endDate}`).pipe(
      map(response => response.data),
      catchError(this.handleError)
    );
  }

 updateWorkOrderStatus(id: number, status: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/status`, { status });
  }

}
