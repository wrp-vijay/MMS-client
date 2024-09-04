import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PermissionMappingService {
  private urlToResourceMap = new Map<string, string>();

  constructor() {
    // Define your URL to resource mappings
    this.urlToResourceMap.set('add-user', 'USER');
    this.urlToResourceMap.set('user-list', 'USER');
    this.urlToResourceMap.set('manage-permission', 'PERMISSION');
    this.urlToResourceMap.set('products', 'PRODUCT');
    this.urlToResourceMap.set('products/create', 'PRODUCT');
    this.urlToResourceMap.set('work-order', 'WORKORDER');
    this.urlToResourceMap.set('workorders/create', 'WORKORDER');
    this.urlToResourceMap.set('orders', 'ORDER');
    this.urlToResourceMap.set('orders/create', 'ORDER');
    // Add more mappings as needed
  }

  getResourceForUrl(url: string): string {
    return this.urlToResourceMap.get(url) || '';
  }
}
