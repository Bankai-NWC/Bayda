'use server';

import { revalidatePath } from 'next/cache';

import { apiFetch } from '@/lib/api';
import { Address, Order, OrdersResponse } from '@/types/order';

interface CreateOrderInput {
  shippingCity: string;
  shippingStreet: string;
  shippingHouseNumber: string;
  shippingApartment?: string;
  items: { variantId: number; quantity: number }[];
}

export async function createOrderAction(input: CreateOrderInput) {
  try {
    const order = await apiFetch<Order>('/orders', {
      method: 'POST',
      data: input,
    });
    revalidatePath('/cart');
    revalidatePath('/orders');
    return { success: true, order };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error creating order';
    return { success: false, error: message };
  }
}

export async function getMyOrdersAction(page?: number) {
  try {
    const query = page ? `?page=${page}` : '';
    const data = await apiFetch<OrdersResponse>(`/orders/my${query}`);
    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, data: null, error: message };
  }
}

export async function getMyOrderAction(id: number) {
  try {
    const order = await apiFetch<Order>(`/orders/my/${id}`);
    return { success: true, order };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, order: null, error: message };
  }
}

export async function cancelOrderAction(id: number) {
  try {
    await apiFetch(`/orders/my/${id}`, { method: 'DELETE' });
    revalidatePath('/orders');
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function getMyAddressesAction() {
  try {
    const addresses = await apiFetch<Address[]>('/addresses');
    return { success: true, addresses };
  } catch (err) {
    return { success: false, addresses: [] };
  }
}
