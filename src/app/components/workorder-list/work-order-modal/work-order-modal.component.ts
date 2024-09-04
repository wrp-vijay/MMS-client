import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { WorkorderService } from '../../../services/workorder.service';
import { WorkOrder } from '../../../services/product.model';

@Component({
  selector: 'app-work-order-modal',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './work-order-modal.component.html',
  styleUrls: ['./work-order-modal.component.css']
})
export class WorkOrderModalComponent {
  workOrders: WorkOrder[] = [];

  constructor(
    public dialogRef: MatDialogRef<WorkOrderModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private workOrderService: WorkorderService,
    private toastr: ToastrService
  ) {}

  onClose(): void {
    this.dialogRef.close(false);
  }

  updateOrderStatus(status: string): void {
    if (this.data.id) {
      this.workOrderService.updateWorkOrderStatus(this.data.id, status).subscribe(
        () => {
          this.toastr.success(`Work order marked as ${status}.`);
          this.dialogRef.close(true);
        },
        error => {
          console.error('Error:', error);
          this.toastr.error(`Failed to update work order status to ${status}.`);
        }
      );
    }
  }
}
