'use server';

import { apiFetch } from '@/lib/api';
import { Order, OrdersResponse, OrderStatus } from '@/types/order';

export async function getAdminOrdersAction(filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));

    const query = params.toString();
    const data = await apiFetch<OrdersResponse>(`/orders${query ? `?${query}` : ''}`);
    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, data: null, error: message };
  }
}

export async function getAdminOrderAction(id: number) {
  try {
    const order = await apiFetch<Order>(`/orders/${id}`);
    return { success: true, order };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, order: null, error: message };
  }
}

export async function updateOrderStatusAction(id: number, status: OrderStatus) {
  try {
    const order = await apiFetch<Order>(`/orders/${id}/status`, {
      method: 'PATCH',
      data: { status },
    });
    return { success: true, order };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}
