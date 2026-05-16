'use server';

import { apiFetch } from '@/lib/api';

import type { WishlistItem } from '../types/wishlist';

export async function getWishlistAction() {
  try {
    const items = await apiFetch<WishlistItem[]>('/wishlist');
    return { success: true, items };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, items: [], error: message };
  }
}

export async function addToWishlistAction(variantId: number) {
  try {
    await apiFetch(`/wishlist/${variantId}`, { method: 'POST' });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function removeFromWishlistAction(variantId: number) {
  try {
    await apiFetch(`/wishlist/${variantId}`, { method: 'DELETE' });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function checkWishlistAction(variantId: number) {
  try {
    const data = await apiFetch<{ inWishlist: boolean }>(`/wishlist/${variantId}/check`);
    return { success: true, inWishlist: data.inWishlist };
  } catch (err) {
    return { success: false, inWishlist: false };
  }
}
