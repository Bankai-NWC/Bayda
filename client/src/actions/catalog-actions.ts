'use server';

import { apiFetch } from '@/lib/api';
import { Category, Collection, Color, GetColorsResponse } from '@/types/product';

export async function getCollectionsAction() {
  return apiFetch<Collection[]>('/catalog/collections');
}

export async function createCollectionAction(name: string) {
  try {
    const collection = await apiFetch<Collection>('/catalog/collections', {
      method: 'POST',
      data: { name },
    });
    return { success: true, collection };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function deleteCollectionAction(id: number) {
  try {
    await apiFetch(`/catalog/collections/${id}`, {
      method: 'DELETE',
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function createColorAction(name: string, hexCode: string) {
  try {
    const colors = await apiFetch<Color>('/colors', {
      method: 'POST',
      data: { name, hexCode },
    });
    return { success: true, colors };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function getColorsAction<T extends number | undefined>(
  page?: T,
  limit?: number,
): Promise<GetColorsResponse<T>> {
  const url = page ? `/colors?page=${page}&limit=${limit || 10}` : '/colors';

  return apiFetch<GetColorsResponse<T>>(url);
}

export async function getColorByIdAction(id: number) {
  try {
    const color = await apiFetch<Color>(`/colors/${id}`);
    return { success: true, color };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function getColorsPaginatedAction(page: number, limit: number) {
  try {
    const data = await apiFetch(`/colors/paginated?page=${page}&limit=${limit}`);
    return { success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function updateColorAction(id: number, name: string, hexCode: string) {
  try {
    const color = await apiFetch<Color>(`/colors/${id}`, {
      method: 'PUT',
      data: { name, hexCode },
    });
    return { success: true, color };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function deleteColorAction(id: number) {
  try {
    await apiFetch(`/colors/${id}`, {
      method: 'DELETE',
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function getCategoriesAction() {
  return apiFetch<Category[]>('/catalog/categories');
}

export async function createCategoryAction(name: string) {
  try {
    const category = await apiFetch<Category>('/catalog/categories', {
      method: 'POST',
      data: { name },
    });

    return { success: true, category };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function deleteCategoryAction(id: number) {
  try {
    await apiFetch(`/catalog/categories/${id}`, {
      method: 'DELETE',
      data: { id },
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function getCategoryWithSizesAction(id: number) {
  try {
    const category = await apiFetch(`/catalog/categories/${id}/sizes`);
    return { success: true, category };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}

export async function setCategorySizesAction(id: number, sizes: string[]) {
  try {
    const category = await apiFetch(`/catalog/categories/${id}/sizes`, {
      method: 'POST',
      data: { id, sizes },
    });

    return { success: true, category };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error';
    return { success: false, error: message };
  }
}
