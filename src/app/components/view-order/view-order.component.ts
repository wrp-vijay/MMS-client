import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { ToastrService } from 'ngx-toastr';
import { Order } from '../../services/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-order',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-order.component.html',
  styleUrl: './view-order.component.css'
})
export class ViewOrderComponent implements OnInit {
  order: Order | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: ProductService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const orderId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchOrder(orderId);
  }

  fetchOrder(id: number): void {
    this.orderService.getOrderById(id).subscribe(
      order => {
        this.order = order;  // Directly assigning the Order object
        // console.log(this.order);
      },
      error => {
        this.toastr.error('Failed to fetch order details.');
        console.error('Error:', error);
      }
    );
  }
  
}
