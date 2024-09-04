import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/product.model';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  permissionsLoaded = false;
  loading: boolean = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.permissions$.subscribe(() => {
      this.permissionsLoaded = true;
      this.fetchProducts();
    });
  }

  fetchProducts(): void {
    this.loading = true; // Start loading indicator
    this.productService.getReadyGoodProducts().subscribe(
      (response: any) => {
        if (!response.error) {
          this.products = response.data;
          // console.log(response.data.stockQuentity);
        }
        this.loading = false; // Stop loading indicator
      },
      (error: any) => {
        console.error('Failed to fetch products:', error);
        this.loading = false; // Stop loading indicator
      }
    );
  }

  confirmDelete(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.deleteProduct(productId);
    }
  }

  editProduct(id: number): void {
    if (id !== undefined) {
      this.router.navigate(['/products/edit', id]);
    }
  }

  deleteProduct(productId: number): void {
    this.loading = true; // Start loading indicator
    this.productService.deleteProduct(productId).subscribe(
      () => {
        this.toastr.success('Product deleted successfully.');
        this.fetchProducts();
      },
      (error: any) => {
        console.error('Failed to delete product:', error);
        this.toastr.error(error.error.msg);
        this.loading = false; // Stop loading indicator
      }
    );
  }

  hasPermission(resource: string, action: string): boolean {
    return this.permissionsLoaded ? this.authService.hasPermission(resource, action) : false;
  }
}
