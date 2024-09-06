export interface Product {
    id: number;
    sku: string;
    name: string;
    description: string;
    price: number;
    stockQuentity: number;
    quantitySold: number;
    productType: 'raw material' | 'ready good';
  }
  
  export interface Order {
    insufficientStockItems: any;
    id: number;
    userId: string;
    orderId: number;
    quantity: number;
    orderDate: string; // Changed from Date to string for consistency
    deliveryDate: string;
    shippingAddress: string;
    totalAmount: number;
    status: string;
    createdAt: string; // Changed to string for consistency
    rawMaterials: OrderItem[]; // Adjusted to match the rawMaterials structure
    User: User;
    Product: Product;
    OrderItems: OrderItem[];
  }
  
  export interface User {
id: any;
    firstName: string;
    lastName: string;
  }
  
  export interface OrderItem {
    isInStock: boolean;
    id: number;
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    Product: Product;
  }
  


// models/work-order.model.ts
export interface WorkOrder {
    id: number;
    productId: number;
    quantity: number;
    createdAt: string; // Changed to string for consistency
    deliveryDate: string;
    shippingAddress: string;
    totalAmount: number;
    notes: string;
    status: string;
    User: User;
    Product: Product;
    rawMaterials: RawMaterial[];  // Ensure this is defined
  }
  
  export interface RawMaterial {
    id: number;
    name: string;
    quantity: number;
    // Add other relevant fields here
  }

  export interface Inventory {
    id: number;
    productId: number;
    changeDate: Date;
    quantityChange: number;
    note: string;
  }
  
