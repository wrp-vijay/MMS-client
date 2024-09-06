import { ChangeDetectorRef, Component } from '@angular/core';
import { WorkorderService } from '../../services/workorder.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { WorkOrder } from '../../services/product.model';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { WorkOrderModalComponent } from './work-order-modal/work-order-modal.component';

@Component({
  selector: 'app-workorder-list',
  standalone: true,
  imports: [DatePipe, FormsModule, CommonModule],
  templateUrl: './workorder-list.component.html',
  styleUrls: ['./workorder-list.component.css']
})
export class WorkorderListComponent {
  workOrders: WorkOrder[] = [];
  filteredWorkOrders: WorkOrder[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  startDate: string = '';
  endDate: string = '';
  showDownloadButton: boolean = false;
  reportData: string = '';
  totalAmount: number = 0;

  constructor(
    private cdr: ChangeDetectorRef,
    private workOrderService: WorkorderService,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchWorkOrders();
  }

  hasPermission(resource: string, action: string): boolean {
    return this.authService.hasPermission(resource, action);
  }

  fetchWorkOrders(): void {
  
    this.workOrderService.getWorkOrders().subscribe(
      response => {
        this.workOrders = response;
        this.filteredWorkOrders = response;
        this.loading = false;
      },
      (error: any) => {
        this.toastr.error(error.error.msg);
        this.loading = false;
        // Ensure filteredWorkOrders is empty when there's an error
        // this.filteredWorkOrders = [];
      }
    );
  }
  
  openModal(workOrderId: number): void {
    const dialogRef = this.dialog.open(WorkOrderModalComponent, {
      width: '300px',
      data: { id: workOrderId } // Pass the work order ID
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // If the result is true, reload the work orders
        this.fetchWorkOrders();
      }
    });
  }
  
  searchWorkOrders(): void {
    if (this.searchQuery) {
      this.filteredWorkOrders = this.workOrders.filter(workOrder =>
        Object.values(workOrder).some(value =>
          value.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
        ) ||
        workOrder.Product.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredWorkOrders = this.workOrders;
    }
  }

  viewWorkOrder(id: number): void {
    this.router.navigate(['/view-workorder', id]);
  }

  editWorkOrder(id: number): void {
    this.router.navigate(['/workorders/edit', id]);
  }

  addWorkOrder(): void {
    this.router.navigate(['/workorders/create']);
  }

  confirmDelete(workOrderId: number): void {
    if (confirm('Are you sure you want to delete this work order?')) {
      this.deleteWorkOrder(workOrderId);
    }
  }

  deleteWorkOrder(workOrderId: number): void {
    this.workOrderService.deleteWorkOrder(workOrderId).subscribe(
      () => {
        this.toastr.success('Work order deleted successfully.');
        this.fetchWorkOrders();
      },
      error => {
        console.error('Error:', error);
        this.toastr.error(error.error.msg);
      }
    );
  }

  generateReport(): void {
    if (!this.startDate || !this.endDate) {
      this.toastr.warning('Please provide both start date and end date.');
      return;
    }

    this.loading = true;

    this.workOrderService.generateWorkOrderReport(this.startDate, this.endDate).subscribe(
      response => {
        this.workOrders = response;
        this.filteredWorkOrders = [...this.workOrders];
        this.totalAmount = this.filteredWorkOrders.reduce((sum, order) => sum + order.totalAmount, 0);

        this.reportData = this.convertToCSV(this.filteredWorkOrders);

        this.toastr.success('Report generated successfully.');
        this.loading = false;
        this.showDownloadButton = true;
        this.cdr.detectChanges();
      },
      error => {
        this.toastr.error(error.error.msg);
        console.error('Error:', error);
        this.loading = false;
      }
    );
  }
  
  getStatusBadgeColor(status: string): string {
    switch (status) {
      case 'Pending':
        return 'Pending';
      case 'Cutting':
        return 'Cutting';
      case 'Sewing':
        return 'Sewing';
      case 'Printing':
        return 'Printing';
      case 'CheckQuality':
        return 'CheckQuality';
      case 'Complete':
        return 'Complete';
      default:
        return 'default';
    }
  }
  
  downloadReport(): void {
    const blob = new Blob([this.reportData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'work_order_report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    this.showDownloadButton = false;
  }

  private convertToCSV(workOrders: WorkOrder[]): string {
    const header = ['ID', 'Quantity', 'Delivery Date', 'Status', 'Product Name', 'Total Amount'];
    const rows = workOrders.map(order => [
      order.id,
      order.quantity,
      order.deliveryDate,
      order.status,
      order.Product.name,
      order.totalAmount
    ]);

    return [header, ...rows].map(row => row.join(',')).join('\n');
  }

  trackByIndex(index: number): number {
        return index;
      }
}
