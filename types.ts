// Enum for product state
export enum ProductState {
  Raw = 'Sống',
  Cooked = 'Chín',
}

// A unified product type for the entire application
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  priceRaw: number; // Price for raw state
  priceCooked: number; // Price for cooked state
  description: string;
}

export enum StockStatus {
  InStock = 'Còn hàng',
  LowStock = 'Sắp hết hàng',
  OutOfStock = 'Hết hàng',
}

// A product within a customer's order
export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number; // Price at the time of order
    state: ProductState; // Which version was ordered
}

// The status of an order
export enum OrderStatus {
  Pending = 'Chờ xử lý',
  Completed = 'Hoàn thành',
}

// A customer's order
export interface CustomerOrder {
    id: string;
    customerName: string;
    group: string;
    items: OrderItem[];
    status: OrderStatus;
    createdAt: string;
}