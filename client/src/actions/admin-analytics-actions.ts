'use server';

import { apiFetch } from '@/lib/api';
import { OrderStatus } from '@/types/order';

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  ordersByStatus: { status: OrderStatus; count: number }[];
  recentOrders: {
    id: number;
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    itemsCount: number;
    user: { fullName: string; email: string };
  }[];
  topProducts: {
    variantId: number;
    totalSold: number;
    variant?: {
      sku: string;
      size: string | null;
      color: { name: string } | null;
      product: { name: string; slug: string };
    };
  }[];
  ordersLast30Days: { date: string; count: number; revenue: number }[];
}

export async function getOrderStatsAction() {
  try {
    const data = await apiFetch<OrderStats>('/analytics/orders');
    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, data: null, error: message };
  }
}
