import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { ManagePermissionsComponent } from './components/manage-permissions/manage-permissions.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { CreateRoleComponent } from './components/manage-permissions/create-role/create-role.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { AddUserComponent } from './components/user-list/add-user/add-user.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { AddProductComponent } from './components/product-list/add-product/add-product.component';
import { OrderListComponent } from './components/order-list/order-list.component';
import { OrderCreateComponent } from './components/order-list/order-create/order-create.component';
import { ViewOrderComponent } from './components/view-order/view-order.component';
import { WorkorderListComponent } from './components/workorder-list/workorder-list.component';
import { CreateWorkorderComponent } from './components/workorder-list/create-workorder/create-workorder.component';
import { ViewWorkorderComponent } from './components/view-workorder/view-workorder.component';
import { NotificationComponent } from './components/notification/notification.component';
import { NavbarResolver } from './components/navbar/navbar.resolver';
import { authGuard } from './guards/auth.guard';
import { ReportComponent } from './components/report/report.component';
import { ProductComponent } from './components/report/product/product.component';
import { InventoryComponent } from './components/report/inventory/inventory.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },

    { path: '', component: DashboardComponent },
    // { path: 'dashboard', component: DashboardComponent},
    { path: 'dashboard', component: DashboardComponent },

    { path: 'edit-profile', component: EditProfileComponent },

    { path: 'manage-permission', component: ManagePermissionsComponent, canActivate: [authGuard], data: { permission: 'delete' } },
    { path: 'add-role', component: CreateRoleComponent },

    { path: 'user-list', component: UserListComponent, canActivate: [authGuard], data: { permission: 'read' } },
    { path: 'add-user', component: AddUserComponent },
    { path: 'edit-user/:id', component: AddUserComponent },

    { path: 'products', component: ProductListComponent, canActivate: [authGuard], data: { permission: 'read' } },
    { path: 'products/create', component: AddProductComponent, canActivate: [authGuard], data: { permission: 'create' } },
    { path: 'products/edit/:id', component: AddProductComponent },

    { path: 'orders', component: OrderListComponent, canActivate: [authGuard], data: { permission: 'read' } },
    { path: 'orders/create', component: OrderCreateComponent, canActivate: [authGuard], data: { permission: 'create' } },
    { path: 'orders/edit/:id', component: OrderCreateComponent },
    { path: 'view-order/:id', component: ViewOrderComponent },

    { path: 'work-order', component: WorkorderListComponent, canActivate: [authGuard], data: { permission: 'read' } },
    { path: 'workorders/create', component: CreateWorkorderComponent, canActivate: [authGuard], data: { permission: 'create' } },
    { path: 'workorders/edit/:id', component: CreateWorkorderComponent },
    { path: 'view-workorder/:id', component: ViewWorkorderComponent },

    // {
    //     path: 'report', component: ReportComponent, canActivate: [authGuard], data: { permission: 'read' },
    //     children: [
    //         { path: 'product', component: ProductComponent },
    //     ]
    // },
    {path: 'products/report', component: ProductComponent},
    {path: 'inventory/report', component: InventoryComponent},

    { path: 'notification', component: NotificationComponent },
];
