// import { inject } from '@angular/core';
// import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
// import { AuthService } from '../services/auth.service';
// import { RolePermissionService } from '../services/role-permission.service';
// import { ToastrService } from 'ngx-toastr';
// import { Observable, of } from 'rxjs';
// import { map, catchError } from 'rxjs/operators';

// export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> => {
//   const authService = inject(AuthService);
//   const rolePermissionService = inject(RolePermissionService);
//   const toastr = inject(ToastrService);
//   const router = inject(Router);

//   if (!authService.isLogdin()) {
//     toastr.warning('Please log in to access this page.');
//     router.navigate(['/login']);
//     return of(false);
//   }

//   const requiredPermission = route.data['permission'];
//   const userRole = authService.getUserRole().toLowerCase();

//   // Check URL-based role restrictions
//   if (route.url.length > 0) {
//     const menu = route.url[0].path;

//     if (menu === 'add-user' || menu === 'user-list' || menu === 'manage-permission' || menu === 'products/create' || menu === 'dashboard') {
//       if (userRole !== 'admin') {
//         toastr.warning('You don\'t have access to this page.');
//         router.navigate(['/']);
//         return of(false);
//       }
//     }
//     if (menu === 'work-order') {
//       if (userRole !== 'manager' && userRole !== 'admin') {
//         toastr.warning('You don\'t have access to this page.');
//         router.navigate(['/']);
//         return of(false);
//       }
//     }
//     if (menu === 'orders') {
//       if (userRole !== 'admin' && userRole !== 'vendor') {
//         toastr.warning('You don\'t have access to this page.');
//         router.navigate(['/']);
//         return of(false);
//       }
//     }
//   }

//   // Check permissions
//   return rolePermissionService.getRoles().pipe(
//     map(response => {
//       // console.log('Role Permission Response:', response);

//       const role = response.data.find((r: any) => r.name.toLowerCase() === userRole);
//       // console.log('Role:', role);

//       if (role && role.permissions) {
//         const permissions = JSON.parse(role.permissions);
//         // console.log('Permissions:', permissions);

//         const hasPermission = Object.values(permissions).some((permissionArray) => {
//           return Array.isArray(permissionArray) && permissionArray.includes(requiredPermission);
//         });

//         if (hasPermission) {
//           return true;
//         } else {
//           toastr.warning('You don\'t have access to this data.');
//           router.navigate(['/']);
//           return false;
//         }
//       } else {
//         toastr.warning('Role not found or permissions missing.');
//         router.navigate(['/']);
//         return false;
//       }
//     }),
//     catchError(error => {
//       console.error('Error fetching roles:', error);
//       toastr.error('Failed to load permissions.');
//       router.navigate(['/login']);
//       return of(false);
//     })
//   );
// };

import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolePermissionService } from '../services/role-permission.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { PermissionMappingService } from './permission-mapping.service';
import { Permissions } from './types';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> => {
  const authService = inject(AuthService);
  const rolePermissionService = inject(RolePermissionService);
  const toastr = inject(ToastrService);
  const router = inject(Router);
  const permissionMappingService = inject(PermissionMappingService);

  if (!authService.isLogdin()) {
    toastr.warning('Please log in to access this page.');
    router.navigate(['/login']);
    return of(false);
  }

  const requiredPermission = route.data['permission'];
  const userRole = authService.getUserRole().toLowerCase();
  const currentUrl = route.url.join('/');

  // Get resource type from URL mapping
  const resourceType = permissionMappingService.getResourceForUrl(currentUrl);

  // Fetch user roles and permissions dynamically
  return rolePermissionService.getRoles().pipe(
    map(response => {
      if (response.error) {
        toastr.error('Failed to load roles.');
        router.navigate(['/login']);
        return false;
      }

      // Find the user's role
      const role = response.data.find((r: any) => r.name.toLowerCase() === userRole);
      if (role && role.permissions) {
        const permissions: Permissions = JSON.parse(role.permissions);

        // Check if the role has the required permission for the current resource type
        const actions = permissions[resourceType] || [];
        const hasPermission = actions.includes(requiredPermission);

        if (hasPermission) {
          return true;
        } else {
          toastr.warning('You don\'t have access to this page.');
          router.navigate(['/']);
          return false;
        }
      } else {
        toastr.warning('Role not found or permissions missing.');
        router.navigate(['/']);
        return false;
      }
    }),
    catchError(error => {
      console.error('Error fetching roles:', error);
      toastr.error('Failed to load permissions.');
      router.navigate(['/login']);
      return of(false);
    })
  );
};
