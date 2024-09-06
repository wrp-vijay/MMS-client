import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Order, Product, OrderItem, User } from '../../services/product.model';
import { AuthService } from '../../services/auth.service';
import { forkJoin, map, Observable } from 'rxjs';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [DatePipe, CommonModule, FormsModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  startDate: string = '';
  endDate: string = '';
  showDownloadButton: boolean = false;
  reportData: string = '';
  totalAmount: number = 0;

  constructor(
    private orderService: ProductService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading = true;

    this.orderService.getOrders().subscribe(
      response => {
        const userRole = this.authService.getUserRole();
        const userId = this.authService.getUserId();

        if (userRole === 'admin') {
          this.orders = response;
        } else {
          this.orders = response.filter(order => order.userId === userId);
        }

        this.filteredOrders = this.orders;
        this.loading = false;
        this.showDownloadButton = false;
      },
      (error: any) => {
        this.toastr.error(error.error.msg);
        console.error('Error:', error);
        this.loading = false;
      }
    );
  }

  searchOrders(): void {
    if (this.searchQuery) {
      this.filteredOrders = this.orders.filter(order =>
        Object.values(order).some(value =>
          value.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
        ) ||
        (order.User.firstName + ' ' + order.User.lastName).toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredOrders = this.orders;
    }
  }

  viewOrder(id: number): void {
    this.router.navigate(['/view-order', id]);
  }

  editOrder(id: number): void {
    this.router.navigate(['/orders/edit', id]);
  }

  addOrder(): void {
    this.router.navigate(['/orders/create']);
  }

  confirmDelete(orderId: number): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.deleteOrder(orderId);
    }
  }

  deleteOrder(orderId: number): void {
    this.orderService.deleteOrder(orderId).subscribe(
      () => {
        this.toastr.success('Order deleted successfully.');
        this.fetchOrders();
      },
      error => {
        console.error('Failed to delete order:', error);
        this.toastr.error(error.error.msg);
      }
    );
  }

  trackByIndex(index: number): number {
    return index;
  }

  hasPermission(resource: string, action: string): boolean {
    return this.authService.hasPermission(resource, action);
  }
  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'Pending':
        return 'Pending';
      case 'OnProcess':
        return 'OnProcess';
      case 'Delivered':
        return 'Delivered';
      case 'UnderCreation':
        return 'Under Creation';
      case 'Process':
        return 'Process';
      default:
        return 'default';
    }
  }


  generateReport(): void {
    if (!this.startDate || !this.endDate) {
      this.toastr.warning('Please provide both start date and end date.');
      return;
    }

    this.loading = true;

    this.orderService.generateOrderReport(this.startDate, this.endDate).subscribe(
      response => {
        this.orders = response;
        this.filteredOrders = [...this.orders]; // Ensure the filteredOrders is updated
        this.totalAmount = this.filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        // Convert data to CSV format
        this.reportData = this.convertToCSV(this.filteredOrders);

        this.toastr.success('Report generated successfully.');
        this.loading = false;
        this.showDownloadButton = true; // Show download button after generating report
        this.cdr.detectChanges(); // Manually trigger change detection if needed
      },
      error => {
        this.toastr.error('Failed to generate report.');
        console.error('Error:', error);
        this.loading = false;
      }
    );
  }

  downloadReport(): void {
    if (this.reportData) {
      this.downloadCSV(this.reportData, 'orders_report.csv');
    } else {
      this.toastr.warning('No report data available to download.');
    }
  }

  convertToCSV(orders: Order[]): string {
    const headers = ['Order ID', 'Customer Name', 'Order Date', 'Total Amount', 'Status', 'Items'];
    const rows = orders.map(order => [
      order.id,
      `${order.User.firstName} ${order.User.lastName}`,
      new Date(order.createdAt).toLocaleDateString(),
      order.totalAmount,
      order.status,
      order.OrderItems.map(item => `${item.Product.name} (${item.quantity} x $${item.unitPrice})`).join('; ')
    ]);

    return [headers.join(','), ...rows.map(row => row.join(',')), `,,Total Amount,,${this.totalAmount}`].join('\n');
  }

  downloadCSV(data: string, filename: string): void {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
