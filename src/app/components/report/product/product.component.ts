import { Component, OnInit } from '@angular/core';
import { Product } from '../../../services/product.model';
import { ProductService } from '../../../services/product.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent implements OnInit {
  products: Product[] = [];
  mostSellingProducts: any[] = [];
  filteredProducts: Product[] = [];
  showMostSellingProducts: boolean = false;
  permissionsLoaded = false;
  loading: boolean = false;
  searchQuery: string = '';
  startDate: string = '';
  endDate: string = '';
  reportData: string = '';
  showDownloadButton = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.permissions$.subscribe(() => {
      this.permissionsLoaded = true;
      this.fetchProducts();
    });
  }

  fetchProducts(): void {
    this.loading = true; // Start loading indicator
    this.productService.getAllProducts().subscribe(
      (response: any) => {
        if (!response.error) {
          this.products = response.data;
          this.filteredProducts = this.products;
        }
        this.loading = false; // Stop loading indicator
      },
      (error: any) => {
        console.error('Failed to fetch products:', error);
        this.loading = false; // Stop loading indicator
      }
    );
  }

  generateReport(): void {
    if (!this.startDate || !this.endDate) {
      this.toastr.warning('Please provide both start date and end date.');
      return;
    }

    this.loading = true;

    this.productService.mostSellingProductReport(this.startDate, this.endDate).subscribe(
      (response: any) => {
        console.log('API Response:', response); // Log the entire response
        if (!response.error) {
          this.mostSellingProducts = response;
          console.log('Most Selling Products:', this.mostSellingProducts);
          this.showMostSellingProducts = true;
          this.reportData = this.convertToCSV(this.mostSellingProducts);
          this.toastr.success('Report generated successfully.');
        } else {
          this.toastr.error('Failed to fetch most selling products report.');
        }
        this.loading = false;
        this.showDownloadButton = true;
      },
      error => {
        this.toastr.error('Failed to generate report.');
        console.error('Error:', error);
        this.loading = false;
      }
    );
  }

  searchProducts(): void {
    if (this.searchQuery) {
      this.filteredProducts = this.products.filter(product =>
        Object.values(product).some(value =>
          value.toString().toLowerCase().includes(this.searchQuery.toLowerCase())
        ) ||
        (product.name + ' ' + product.description).toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredProducts = this.products;
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  hasPermission(resource: string, action: string): boolean {
    return this.permissionsLoaded ? this.authService.hasPermission(resource, action) : false;
  }

  downloadReport(): void {
    if (this.reportData) {
      this.downloadCSV(this.reportData, 'most_selling_products_report.csv');
    } else {
      this.toastr.warning('No report data available to download.');
    }
  }

  convertToCSV(products: any[]): string {
    if (!products || products.length === 0) {
      return ''; // Handle empty or undefined products array
    }

    const headers = ['Product ID', 'Product Name', 'Quantity Sold'];
    const rows = products.map(product => [
      product.productId ?? '',  // Handle possible undefined productId
      product.productName?.trim() ?? '',  // Handle possible undefined productName
      product.quantitySold ?? 0  // Handle possible undefined quantitySold
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
