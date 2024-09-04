import { Component } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  constructor( private productService: ProductService, private toastr: ToastrService, private authService: AuthService){}

  hasPermission(resource: string, action: string): boolean {
    return this.authService.hasPermission(resource, action);
  }

  // generateInventoryReport(): void {
  //   this.productService.generateInventoryReport().subscribe(
  //     response => {
  //       const blob = new Blob([response], { type: 'text/csv' });
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = 'inventory_report.csv';
  //       document.body.appendChild(a);
  //       a.click();
  //       document.body.removeChild(a);
  //       this.toastr.success('Inventory report generated successfully.');
  //     },
  //     error => {
  //       if (error.status === 429) {
  //         this.toastr.error('Rate limit exceeded. Please try again after 15 min.');
  //       } else {
  //         this.toastr.error('Failed to generate order report.');
  //       }
  //       console.error('Error:', error);
  //     }
  //   );
  // }

  // mostSellingProductReport(period: string): void {
  //   this.productService.mostSellingProductReport(period).subscribe(
  //     response => {
  //       const blob = new Blob([response], { type: 'text/csv' });
  //       const url = window.URL.createObjectURL(blob);
  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = 'ProductSelling_report.csv';
  //       document.body.appendChild(a);
  //       a.click();
  //       document.body.removeChild(a);
  //       this.toastr.success('Most Selling Product report generated successfully.');
  //     },
  //     error => {
  //       if (error.status === 429) {
  //         this.toastr.error('Rate limit exceeded. Please try again after 15 min.');
  //       } else {
  //         this.toastr.error('Failed to generate product report.');
  //       }
  //       console.error('Error:', error);
  //     }
  //   );
  // }
}
