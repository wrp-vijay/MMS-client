import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { Order } from '../../services/product.model';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-view-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-order.component.html',
  styleUrls: ['./view-order.component.css']
})
export class ViewOrderComponent implements OnInit {
  order: Order | null = null;
  canCreateWorkOrder: boolean = false; // Track button visibility

  constructor(
    private route: ActivatedRoute,
    private orderService: ProductService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const orderId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchOrder(orderId);
  }

  fetchOrder(id: number): void {
    this.orderService.getOrderById(id).subscribe(
      order => {
        this.order = order;
        this.checkIfWorkOrderCanBeCreated(order); // Check stock availability
      },
      error => {
        this.toastr.error('Failed to fetch order details.');
        console.error('Error:', error);
      }
    );
  }

  checkIfWorkOrderCanBeCreated(order: Order): void {
    if (!order || !order.OrderItems) {
      this.canCreateWorkOrder = false;
      return;
    }

    // Check if any item's quantity exceeds its stock quantity
    this.canCreateWorkOrder = order.OrderItems.some(item => {
      return item.quantity > item.Product.stockQuentity; // Stock is less than order quantity
    });
  }

  createWorkOrder(orderId: number): void {
    this.router.navigate(['/workorders/create']);
  }

  hasPermission(resource: string, action: string): boolean {
    return this.authService.hasPermission(resource, action);
  }
}
