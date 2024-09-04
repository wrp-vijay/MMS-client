import { Component, OnInit, OnDestroy } from '@angular/core';
import { RolePermissionService } from '../../services/role-permission.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-manage-permissions',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './manage-permissions.component.html',
  styleUrls: ['./manage-permissions.component.css']
})
export class ManagePermissionsComponent implements OnInit, OnDestroy {
  roles: any[] = [];
  permissions: any[] = [];
  permissionSlugs: string[] = [];
  permissionActions: string[] = ['create', 'read', 'update', 'delete'];
  permissionChanges: { id: number, roleId: number, slug: string, name: string, status: boolean }[] = [];
  isLoading: boolean = true;

  private subscriptions: Subscription = new Subscription();

  constructor(private permissionsService: RolePermissionService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadRoles(): void {
    const startTime = Date.now();
    const rolesSubscription = this.permissionsService.getRoles().subscribe(
      (data: any) => {
        const endTime = Date.now();
        // console.log(`Roles API call took ${endTime - startTime} ms`);
        this.roles = data.data.map((role: any) => ({
          ...role,
          permissions: JSON.parse(role.permissions)
        }));
        // console.log(this.roles);
      },
      error => {
        this.checkLoading();
        console.error('Error loading roles', error);
      }
    );
    this.subscriptions.add(rolesSubscription);
  }

  loadPermissions(): void {
    const permissionsSubscription = this.permissionsService.getPermissions().subscribe(
      (data: any) => {
        this.permissions = data.data;
        this.permissionSlugs = Array.from(new Set(this.permissions.map(p => p.slug)));
        this.checkLoading();
      },
      error => {
        this.checkLoading();
        console.error('Error loading permissions', error);
      }
    );
    this.subscriptions.add(permissionsSubscription);
  }

  checkLoading(): void {
    if (this.roles.length > 0 && this.permissions.length > 0) {
      this.isLoading = false;
    }
  }

  getRolePermissionStatus(roleId: number, slug: string, action: string): boolean {
    const role = this.roles.find(r => r.id === roleId);
    return role && role.permissions[slug] && role.permissions[slug].includes(action);
  }

  onCheckboxChange(roleId: number, slug: string, action: string, event: any): void {
    const status = event.target.checked;
    const role = this.roles.find(r => r.id === roleId);

    if (role) {
      if (!role.permissions[slug]) {
        role.permissions[slug] = [];
      }
      if (status) {
        if (!role.permissions[slug].includes(action)) {
          role.permissions[slug].push(action);
        }
      } else {
        role.permissions[slug] = role.permissions[slug].filter((perm: string) => perm !== action);
      }

      this.permissionChanges.push({ id: role.id, roleId, slug, name: action, status });
    }
  }

  updateAllPermissions(): void {
    const updates = this.roles.map(role => ({
      roleId: role.id,
      permissions: role.permissions
    }));

    const updateSubscription = this.permissionsService.updatePermissions(updates).subscribe(
      () => {
        this.loadRoles();
        this.permissionChanges = [];
        this.toastr.success('Permissions updated successfully.', 'Success');
      },
      error => {
        console.error('Error updating permissions', error);
        this.toastr.error('Failed to update permissions.', 'Error');
      }
    );
    this.subscriptions.add(updateSubscription);
  }

  deleteRole(id: number): void {
    if (confirm('Are you sure you want to delete this role?')) {
      const deleteRoleSubscription = this.permissionsService.deleteRole(id).subscribe(
        () => {
          this.loadRoles();
          this.toastr.success('Role deleted successfully.', 'Success');
        },
        error => {
          console.error('Error deleting role', error);
          this.toastr.error('Failed to delete role.', 'Error');
        }
      );
      this.subscriptions.add(deleteRoleSubscription);
    }
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }
}
