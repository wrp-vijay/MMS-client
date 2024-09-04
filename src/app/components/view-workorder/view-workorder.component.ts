import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkorderService } from '../../services/workorder.service'; // Update with the correct path
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { WorkOrder } from '../../services/product.model';

@Component({
  selector: 'app-view-workorder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-workorder.component.html',
  styleUrls: ['./view-workorder.component.css']
})
export class ViewWorkorderComponent implements OnInit {
  workOrder: WorkOrder | null = null;

  constructor(
    private route: ActivatedRoute,
    private workOrderService: WorkorderService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    const workOrderId = +this.route.snapshot.paramMap.get('id')!;
    this.fetchWorkOrder(workOrderId);
  }

  fetchWorkOrder(id: number): void {
    this.workOrderService.getWorkOrderById(id).subscribe(
      workOrder => {
        this.workOrder = workOrder;
        console.log(this.workOrder);
      },
      error => {
        this.toastr.error('Failed to fetch work order details.');
        console.error('Error:', error);
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
}
