import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { WorkorderService } from '../../../services/workorder.service';
import { ProductService } from '../../../services/product.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-workorder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-workorder.component.html',
  styleUrls: ['./create-workorder.component.css']
})
export class CreateWorkorderComponent implements OnInit {
  workOrderForm: FormGroup;
  readyGoods: any[] = [];
  rawMaterials: any[] = [];
  workOrderId: string | null = null;
  statuses = [ 'Cutting', 'Sewing', 'Printing', 'Check quality'];

  constructor(
    private fb: FormBuilder,
    private workOrderService: WorkorderService,
    private productService: ProductService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.workOrderForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1)]],
      deliveryDate: ['', Validators.required],
      rawMaterials: this.fb.array([]),
      notes: [''],
      status: ['Pending', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getReadyGoods();
    this.getRawMaterials();

    this.route.paramMap.subscribe(params => {
      this.workOrderId = params.get('id');
      if (this.workOrderId) {
        this.loadWorkOrder(parseInt(this.workOrderId, 10));
      }
    });
  }

  get rawMaterialsArray(): FormArray {
    return this.workOrderForm.get('rawMaterials') as FormArray;
  }

  addRawMaterial(): void {
    this.rawMaterialsArray.push(this.fb.group({
      productId: ['', Validators.required],  // Changed to productId
      quantity: [1, [Validators.required, Validators.min(1)]]
    }));
  }  

  removeRawMaterial(index: number): void {
    this.rawMaterialsArray.removeAt(index);
  }

  getReadyGoods(): void {
    this.productService.getReadyGoodProducts().subscribe(
      (response: any) => {
        this.readyGoods = response.data;
      },
      error => {
        this.toastr.error('Failed to fetch ready goods', 'Error');
      }
    );
  }

  getRawMaterials(): void {
    this.productService.getRawMaterials().subscribe(
      (response: any) => {
        this.rawMaterials = response.data;
      },
      error => {
        this.toastr.error('Failed to fetch raw materials', 'Error');
      }
    );
  }

  loadWorkOrder(workOrderId: number): void {
    this.workOrderService.getWorkOrderById(workOrderId).subscribe(
      (workOrder: any) => {
        this.workOrderForm.patchValue({
          productId: workOrder.productId,
          quantity: workOrder.quantity,
          deliveryDate: workOrder.deliveryDate,
          notes: workOrder.notes,
          status: workOrder.status
        });
  
        this.rawMaterialsArray.clear();
  
        let rawMaterials = [];
        try {
          rawMaterials = JSON.parse(workOrder.rawMaterials);
        } catch (e) {
          console.error('Failed to parse rawMaterials:', e);
        }
  
        rawMaterials.forEach((material: any) => {
          this.rawMaterialsArray.push(this.fb.group({
            productId: [material.productId, Validators.required],  // Changed to productId
            quantity: [material.quantity, [Validators.required, Validators.min(1)]]
          }));
        });
      },
      error => {
        this.toastr.error('Failed to load work order', 'Error');
      }
    );
  }

  onSubmit(): void {
    if (this.workOrderForm.invalid) {
      this.toastr.error('Please fill in all required fields', 'Error');
      return;
    }

    const workOrderData = this.workOrderForm.value;

    if (this.workOrderId) {
      this.workOrderService.updateWorkOrder(parseInt(this.workOrderId, 10), workOrderData).subscribe(
        () => {
          this.toastr.success('Work Order updated successfully', 'Success');
          this.router.navigate(['/work-order']);
        },
        error => {
          this.toastr.error('Failed to update work order', 'Error');
        }
      );
    } else {
      this.workOrderService.createWorkOrder(workOrderData).subscribe(
        () => {
          this.toastr.success('Work Order created successfully', 'Success');
          this.workOrderForm.reset();
          this.rawMaterialsArray.clear();
          this.router.navigate(['/work-order']);
        },
        error => {
          this.toastr.error('Failed to create work order', 'Error');
        }
      );
    }
  }
}
