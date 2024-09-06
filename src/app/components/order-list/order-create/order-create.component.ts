import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Order, OrderItem, Product } from '../../../services/product.model';
import { atLeastOneItemValidator } from './items'; // Import your custom validator
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './order-create.component.html',
  styleUrls: ['./order-create.component.css']
})
export class OrderCreateComponent implements OnInit {
  orderForm: FormGroup;
  products: Product[] = [];
  orderId: number | null = null;
  loading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.orderForm = this.fb.group({
      userId: [{ value: '', disabled: true }],
      deliveryDate: ['', Validators.required],
      shippingAddress: ['', Validators.required],
      totalAmount: [{ value: 0, disabled: true }],
      status: ['Pending', Validators.required],
      items: this.fb.array([], Validators.required)
    });
  }

  ngOnInit(): void {
    this.getProducts();
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      if (this.orderId) {
        this.loadOrderDetails(this.orderId);
      }
    });
    this.setUserId();
  }

  private setUserId(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.orderForm.get('userId')?.setValue(userId);
    }
  }

  getProducts(): void {
    this.loading = true;
    this.productService.getReadyGoodProducts().subscribe(
      (response: any) => {
        this.products = response.data;
        this.loading = false;
      },
      error => {
        this.toastr.error('Failed to fetch products.');
        this.loading = false;
      }
    );
  }

  loadOrderDetails(orderId: number): void {
    this.loading = true;
    this.productService.getOrderById(orderId).subscribe(
      (order: Order) => {
        this.orderForm.patchValue({
          userId: order.userId,
          deliveryDate: order.deliveryDate,
          shippingAddress: order.shippingAddress,
          totalAmount: order.totalAmount.toString(),  // Convert to string
          status: order.status
        });

        this.items.clear();
        order.OrderItems.forEach(item => {
          this.addItem(item);
        });
        this.updateTotalAmount();
        this.loading = false;
      },
      error => {
        this.toastr.error('Failed to load order details.');
        this.loading = false;
      }
    );
  }
  
  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }
  
  addItem(item?: OrderItem): void {
    const itemForm = this.fb.group({
      productId: [item ? item.productId : '', Validators.required],
      quantity: [item ? item.quantity : 0, [Validators.required, Validators.min(1)]],
      unitPrice: [{ value: item ? item.unitPrice.toString() : '0', disabled: true }],  // Convert to string
      totalPrice: [{ value: item ? item.totalPrice.toString() : '0', disabled: true }]  // Convert to string
    });
  
    itemForm.get('productId')!.valueChanges.subscribe(productId => {
      if (productId !== null) {
        const product = this.products.find(p => p.id === +productId);
        if (product) {
          itemForm.get('unitPrice')!.setValue(product.price.toString());  // Convert to string
          this.updateTotalPrice(itemForm);
        }
      }
    });
  
    itemForm.get('quantity')!.valueChanges.subscribe(() => {
      this.updateTotalPrice(itemForm);
    });
  
    this.items.push(itemForm);
  }
  
  updateTotalPrice(itemForm: FormGroup): void {
    const quantity = itemForm.get('quantity')!.value;
    const unitPrice = parseFloat(itemForm.get('unitPrice')!.value);
    const totalPrice = (quantity * unitPrice).toFixed(2);  // Keep it as a string with 2 decimal places
    itemForm.get('totalPrice')!.setValue(totalPrice);
    this.updateTotalAmount();
  }
  
  updateTotalAmount(): void {
    const totalAmount = this.items.controls.reduce((acc, itemForm) => {
      const totalPrice = parseFloat(itemForm.get('totalPrice')!.value);
      console.log(`Item Total Price: ${totalPrice}`);
      return acc + totalPrice;
    }, 0);
    const roundedTotalAmount = totalAmount.toFixed(2);
    console.log(`Calculated Total Amount: ${roundedTotalAmount}`);
    this.orderForm.get('totalAmount')!.setValue(roundedTotalAmount);
  }
  
  removeItem(index: number): void {
    this.items.removeAt(index);
    this.updateTotalAmount();
  }

  private handleInsufficientStockItems(items: any[]): void {
    // This method will handle displaying insufficient stock items
    items.forEach(item => {
      // Example: Display a message or update the form based on stock issues
      this.toastr.warning(`Product ID ${item.productId} has insufficient stock. Available: ${item.availableStock}, Requested: ${item.requestedQuantity}`, 'Insufficient Stock');
    });
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.toastr.warning('Please fill all fields with valid data', 'Warning');
      return;
    }

    this.loading = true;

    const orderData = this.orderForm.getRawValue();
    if (this.orderId) {
      this.productService.updateOrder(this.orderId, orderData).subscribe(
        (response:any) => {
          if (response.error) {
            // Handle the case where insufficient stock is reported
            if (response.insufficientStockItems && response.insufficientStockItems.length > 0) {
              this.handleInsufficientStockItems(response.insufficientStockItems);
            } else {
              this.toastr.success('Order updated successfully.');
              this.router.navigate(['/orders']);
            }
          } else {
            this.toastr.success('Order updated successfully.');
            this.router.navigate(['/orders']);
          }
          this.loading = false;
        },
        (error:any) => {
          this.toastr.error(error.error.msg);
          this.loading = false;
        }
      );
    } else {
      this.productService.createOrder(orderData).subscribe(
        () => {
          this.toastr.success('Order created successfully.');
          this.router.navigate(['/orders']);
          this.loading = false;
        },
        (error:any) => {
          this.toastr.error(error.error.msg);
          this.loading = false;
        }
      );
    }
  }
}
