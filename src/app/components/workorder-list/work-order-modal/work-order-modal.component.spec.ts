import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkOrderModalComponent } from './work-order-modal.component';

describe('WorkOrderModalComponent', () => {
  let component: WorkOrderModalComponent;
  let fixture: ComponentFixture<WorkOrderModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkOrderModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkOrderModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
