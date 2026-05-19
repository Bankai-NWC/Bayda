export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}

export const OrderStatusLabel: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
};

export interface OrderItemVariant {
  id: number;
  sku: string;
  size: string | null;
  color: { name: string; hexCode: string } | null;
  images: { image: { url: string } }[];
  product: { name: string; slug: string };
}

export interface OrderItem {
  id: number;
  orderId: number;
  variantId: number;
  quantity: number;
  priceAtPurchase: number;
  productVariant: OrderItemVariant;
}

export interface Order {
  id: number;
  userId: number;
  shippingCity: string;
  shippingStreet: string;
  shippingHouseNumber: string;
  shippingApartment: string | null;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  items: Order[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Address {
  id: number;
  userId: number;
  title: string | null;
  city: string;
  street: string;
  houseNumber: string;
  apartment: string | null;
  isDefault: boolean;
}
