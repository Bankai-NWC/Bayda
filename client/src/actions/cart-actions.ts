'use server';

import { apiFetch } from '@/lib/api';
import { Cart } from '@/types/cart';

export async function getCartAction() {
  try {
    const cart = await apiFetch<Cart>('/cart');
    return { success: true, cart };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, cart: null, error: message };
  }
}

export async function getCartItemQuantityAction(variantId: number): Promise<number> {
  try {
    const { cart } = await getCartAction();
    const item = cart?.items.find((i) => i.variantId === variantId);
    return item?.quantity ?? 0;
  } catch {
    return 0;
  }
}

export async function addToCartAction(variantId: number, quantity: number = 1) {
  try {
    const cart = await apiFetch<Cart>(`/cart/${variantId}`, {
      method: 'POST',
      data: { quantity },
    });
    return { success: true, cart };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, cart: null, error: message };
  }
}

export async function updateCartItemAction(variantId: number, quantity: number) {
  try {
    const cart = await apiFetch<Cart>(`/cart/${variantId}`, {
      method: 'PATCH',
      data: { quantity },
    });
    return { success: true, cart };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, cart: null, error: message };
  }
}

export async function removeFromCartAction(variantId: number) {
  try {
    const cart = await apiFetch<Cart>(`/cart/${variantId}`, { method: 'DELETE' });
    return { success: true, cart };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, cart: null, error: message };
  }
}

export async function clearCartAction() {
  try {
    await apiFetch('/cart', { method: 'DELETE' });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}
