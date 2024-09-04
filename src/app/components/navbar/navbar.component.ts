import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { RolePermissionService } from '../../services/role-permission.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  permissions: any = {};
  unreadCount: number = 0;
  notifications: any[] = [];
  user: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private rolePermissionService: RolePermissionService,
    private notificationService: NotificationService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.loadPermissions();
    this.loadUnreadCount();
    this.loadUserProfile();
    this.subscribeToUnreadCount();
  }

  loadUnreadCount(): void {
    this.notificationService.getUnreadNotificationCount().subscribe();
  }

  subscribeToUnreadCount(): void {
    this.notificationService.getUnreadCountObservable().subscribe(
      count => this.unreadCount = count
    );
  }

  loadPermissions(): void {
    const userRole = this.authService.getUserRole().toLowerCase();
    this.rolePermissionService.getRoles().subscribe(response => {
      const role = response.data.find((r: any) => r.name.toLowerCase() === userRole);
      if (role && role.permissions) {
        this.permissions = JSON.parse(role.permissions);
      } else {
        this.permissions = {};
      }
    });
  }

  hasPermission(resource: string, action: string): boolean {
    const resourcePermissions = this.permissions[resource.toUpperCase()] || [];
    return resourcePermissions.includes(action);
  }

  logout(): void {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      localStorage.clear();
      this.router.navigate(['/login']);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllNotificationsAsRead().subscribe(() => {
      this.notifications.forEach(notification => {
        notification.status = 'read';
      });
    });
  }

  loadUserProfile(): void {
    this.userService.getUserProfile().subscribe(
      response => {
        if (!response.error) {
          this.user = response.data;
        } else {
          this.toastr.error(response.msg);
        }
      },
      error => {
        this.toastr.error(error.error.msg);
      }
    );
  }
}
