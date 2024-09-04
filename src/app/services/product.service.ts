import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, Product } from './product.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/orders';
  private productUrl = 'http://localhost:3000/products';

  constructor(private http: HttpClient) { }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productUrl);
  }

  getReadyGoodProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.productUrl}/ready-good`);
  }
  getRawMaterials(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.productUrl}/raw-material`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.productUrl}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.productUrl, product);
  }

  updateProduct(id: number, product: Product): Observable<void> {
    return this.http.put<void>(`${this.productUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.productUrl}/${id}`);
  }

  createOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }


  getOrders(): Observable<Order[]> {
    return this.http.get<{error: boolean, msg: string, data: Order[]}>('http://localhost:3000/getOrders').pipe(
      map(response => response.data)
    );
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<{error: boolean, msg: string, data: Order}>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  updateOrder(id: number, order: Order): Observable<Order> {
    return this.http.put<{error: boolean, msg: string, data: Order}>(`${this.apiUrl}/${id}`, order).pipe(
      map(response => response.data)
    );
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  generateOrderReport(startDate: string, endDate: string): Observable<Order[]> {
    return this.http.get<{error: boolean, msg: string, data: Order[]}>(`http://localhost:3000/generateOrderReport?startDate=${startDate}&endDate=${endDate}`).pipe(
      map(response => response.data)
    );
  }


  mostSellingProductReport(startDate: string, endDate: string): Observable<Product[]> {
    return this.http.get<{error: boolean, msg: string, data: Product[]}>(`http://localhost:3000/mostsellingproduct-report?startDate=${startDate}&endDate=${endDate}`).pipe(
      map(response => response.data)
    );
  }

  // mostSellingProductReport(period: string): Observable<Blob> {
  //   const headers = new HttpHeaders({
  //     'Content-Type': 'application/json',
  //     'Accept': 'application/csv'
  //   });
  //   return this.http.get(`http://localhost:3000/mostsellingproduct-report?period=${period}`, { headers, responseType: 'blob' });
  // }
}

