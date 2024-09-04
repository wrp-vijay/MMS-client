import { Component } from '@angular/core';
import { RolePermissionService } from '../../../services/role-permission.service';
import { ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-role',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.css']  // Fix styleUrl to styleUrls
})
export class CreateRoleComponent {
  permissionSlugs: string[] = [];
  permissionActions: string[] = ['create', 'read', 'update', 'delete'];
  newRole: { name: string; permissions: { [key: string]: string[] } } = { name: '', permissions: {} };

  constructor(
    private permissionsService: RolePermissionService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.loadPermissions();
  }

  loadPermissions(): void {
    this.permissionsService.getPermissions().subscribe(
      (response: { data: { slug: string }[] }) => {
        this.permissionSlugs = Array.from(new Set(response.data.map(permission => permission.slug)));
      },
      error => {
        console.error('Error loading permissions', error);
        this.toastr.error('Failed to load permissions.', 'Error');
      }
    );
  }

  onNewRoleCheckboxChange(slug: string, action: string, event: Event): void {
    const target = event.target as HTMLInputElement;

    if (!this.newRole.permissions[slug]) {
      this.newRole.permissions[slug] = [];
    }

    if (target.checked) {
      if (!this.newRole.permissions[slug].includes(action)) {
        this.newRole.permissions[slug].push(action);
      }
    } else {
      const index = this.newRole.permissions[slug].indexOf(action);
      if (index > -1) {
        this.newRole.permissions[slug].splice(index, 1);
      }
    }
  }

  createRole(): void {
    this.permissionsService.createRole(this.newRole).subscribe(
      () => {
        this.newRole = { name: '', permissions: {} };
        this.toastr.success('Role created successfully.', 'Success');
        this.router.navigate(['/manage-permission']);
      },
      error => {
        console.error('Error creating role', error);
        this.toastr.error('Failed to create role.', 'Error');
      }
    );
  }
  isActionSelected(slug: string, action: string): boolean {
    return this.newRole.permissions[slug]?.includes(action) ?? false;
  }
  
}
