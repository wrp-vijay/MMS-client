import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { WorkorderService } from '../../../services/workorder.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Inventory } from '../../../services/product.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit{

  ngOnInit(): void {
    this.fetchInventoryData()
  }

  inventory: any[] = [];
  mostSellingProducts: any[] = [];
  filteredInventory: any[] = [];
  showMostSellingProducts: boolean = false;
  permissionsLoaded = false;
  loading: boolean = false;
  searchQuery: string = '';
  startDate: string = '';
  endDate: string = '';
  reportData: string = '';
  showDownloadButton = false;

  constructor(
    private workOrderService: WorkorderService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  fetchInventoryData(): void {
    this.loading = true; // Start loading indicator
    this.workOrderService.getAllInventory().subscribe(
      (response: any) => {
        if (!response.error) {
          this.inventory = response.data;
          this.filteredInventory = this.inventory;
          console.log(this.inventory);
          
        }
        this.loading = false; // Stop loading indicator
      },
      (error: any) => {
        console.error('Failed to fetch products:', error);
        this.loading = false; // Stop loading indicator
      }
    );
  }

  searchOrders(): void {
    if (this.searchQuery) {
      this.filteredInventory = this.inventory.filter(inventory =>
        Object.values(inventory).some(value =>
          (value as string).toString().toLowerCase().includes(this.searchQuery.toLowerCase())
        ) ||
        (inventory.productId + ' ' + inventory.changeDate).toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredInventory = this.inventory;
    }

    this.showDownloadButton = this.filteredInventory.length > 0;
  }

  trackByIndex(index: number): number {
    return index;
  }

  hasPermission(resource: string, action: string): boolean {
    return this.authService.hasPermission(resource, action);
  }

  generateReport(): void {
    if (!this.startDate || !this.endDate) {
      this.toastr.warning('Please provide both start date and end date.');
      return;
    }

    this.loading = true;

    this.workOrderService.generateInventoryReport(this.startDate, this.endDate).subscribe(
      response => {
        this.inventory = response;
        this.filteredInventory = [...this.inventory]; // Ensure the filteredOrders is updated

        // Convert data to CSV format
        this.reportData = this.convertToCSV(this.filteredInventory);

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
      this.downloadCSV(this.reportData, 'inventory_report.csv');
    } else {
      this.toastr.warning('No report data available to download.');
    }
  }

  convertToCSV(data: Inventory[]): string {
    const headers = ['History ID', 'Product ID', 'Change Date', 'Quantity Change', 'Note'];
    const rows = data.map(item => [
      item.id,
      item.productId,
      new Date(item.changeDate).toLocaleDateString(),
      item.quantityChange,
      item.note
    ]);
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
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

