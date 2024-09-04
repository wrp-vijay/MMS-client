import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  productId: number | undefined;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.productForm = this.fb.group({
      sku: ['', Validators.required],
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      stockQuentity: ['', [Validators.required]],
      productType: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.productId = +id;
        this.loadProduct(this.productId);
      }
    });
  }

  loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe(
      (response: any) => {
        this.productForm.patchValue(response.data);
      },
      (error: any) => {
        console.error('Failed to load product:', error);
        this.toastr.error('Failed to load product details.');
      }
    );
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.toastr.warning('Please fill all fields with valid data', 'Warning');
      return;
    }

    const productData = this.productForm.value;
    if (this.productId) {
      this.productService.updateProduct(this.productId, productData).subscribe(
        () => {
          this.toastr.success('Product updated successfully.');
          this.router.navigate(['/products']);
        },
        (error: any) => {
          console.error('Failed to update product:', error);
          this.toastr.error(error.error.msg);
        }
      );
    } else {
      this.productService.createProduct(productData).subscribe(
        () => {
          this.toastr.success('Product added successfully.');
          this.router.navigate(['/products']);
        },
        (error: any) => {
          console.error(error.error.msg);
          this.toastr.error(error.error.msg);
        }
      );
    }
  }
}


