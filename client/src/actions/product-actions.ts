'use server';

import { revalidatePath } from 'next/cache';

import { apiFetch, apiFetchMultipart } from '@/lib/api';
import { CreateProductSchema, VariantSchema } from '@/lib/validate-schemas';
import {
  CreateProductFormState,
  Material,
  Product,
  ProductsResponse,
  ProductVariant,
  SizeChart,
} from '@/types/product';

export async function createProductAction(
  _: CreateProductFormState,
  formData: FormData,
): Promise<CreateProductFormState> {
  const rawData = {
    name: formData.get('name'),
    description: formData.get('description') || undefined,
    categoryId: formData.get('categoryId'),
    collectionId:
      formData.get('collectionId') && formData.get('collectionId') !== 'none'
        ? formData.get('collectionId')
        : undefined,
    gender: formData.get('gender'),
    sku: formData.get('sku'),
    price: formData.get('price'),
    salePrice: formData.get('salePrice') || undefined,
    size: formData.get('size') || undefined,
    colorId:
      formData.get('colorId') && formData.get('colorId') !== 'none'
        ? formData.get('colorId')
        : undefined,
    stock: formData.get('stock') || 0,
  };

  const validatedFields = CreateProductSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  const images = formData.getAll('images') as File[];
  if (!images.length || images[0].size === 0) {
    return { errors: { images: ['At least one product image is required'] } };
  }

  try {
    const body = new FormData();

    const {
      name,
      description,
      categoryId,
      collectionId,
      gender,
      sku,
      price,
      salePrice,
      size,
      colorId,
      stock,
    } = validatedFields.data;

    body.append('name', name);
    if (description) body.append('description', description);
    body.append('categoryId', String(categoryId));
    if (collectionId) body.append('collectionId', String(collectionId));
    body.append('gender', gender);
    body.append('sku', sku);
    body.append('price', String(price));
    if (salePrice) body.append('salePrice', String(salePrice));
    if (size) body.append('size', size);
    if (colorId) body.append('colorId', String(colorId));
    body.append('stock', String(stock));

    images.forEach((image) => body.append('images', image));

    const product = await apiFetchMultipart<Product>('/products/create', body);
    return { success: true, product };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error creating product';
    return { serverError: message };
  }
}

export async function getProductAction(id: number): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export async function getProductBySlugAction(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/slug/${slug}`);
}

export async function updateProductAction(
  id: number,
  _: { serverError?: string; success?: boolean },
  formData: FormData,
): Promise<{ serverError?: string; success?: boolean }> {
  try {
    const collectionId = formData.get('collectionId');

    await apiFetch(`/products/${id}`, {
      method: 'PATCH',
      data: {
        name: formData.get('name') || undefined,
        description: formData.get('description') || undefined,
        categoryId: formData.get('categoryId') ? Number(formData.get('categoryId')) : undefined,
        collectionId:
          collectionId === 'none' ? null : collectionId ? Number(collectionId) : undefined,
        gender: formData.get('gender') || undefined,
      },
    });

    revalidatePath(`/admin/products/${id}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error updating product';
    return { serverError: message };
  }
}

export async function updateVariantAction(
  productId: number,
  variantId: number,
  _: { serverError?: string; success?: boolean },
  formData: FormData,
): Promise<{ serverError?: string; success?: boolean; variant?: ProductVariant }> {
  try {
    const colorId = formData.get('colorId');

    const variant = await apiFetch<ProductVariant>(`/products/${productId}/variants/${variantId}`, {
      method: 'PATCH',
      data: {
        sku: formData.get('sku') || undefined,
        price: formData.get('price') ? Number(formData.get('price')) : undefined,
        salePrice: formData.get('salePrice') ? Number(formData.get('salePrice')) : null,
        size: formData.get('size') || null,
        colorId: colorId && colorId !== 'none' ? Number(colorId) : null,
        stock: formData.get('stock') ? Number(formData.get('stock')) : undefined,
      },
    });

    return { success: true, variant };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error updating variant';
    return { serverError: message };
  }
}

export async function deleteVariantAction(
  productId: number,
  variantId: number,
): Promise<{ serverError?: string; success?: boolean }> {
  try {
    await apiFetch(`/products/${productId}/variants/${variantId}`, { method: 'DELETE' });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error deleting variant';
    return { serverError: message };
  }
}

export async function deleteProductAction(
  id: number,
): Promise<{ serverError?: string; success?: boolean }> {
  try {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error deleting product';
    return { serverError: message };
  }
}

export async function addVariantImagesAction(
  productId: number,
  variantId: number,
  formData: FormData,
): Promise<{ serverError?: string; success?: boolean; variant?: ProductVariant }> {
  const images = formData.getAll('images') as File[];
  if (!images.length || images[0].size === 0) {
    return { serverError: 'At least one image is required' };
  }

  try {
    const body = new FormData();
    images.forEach((image) => body.append('images', image));

    const variant = await apiFetchMultipart<ProductVariant>(
      `/products/${productId}/variants/${variantId}/images`,
      body,
    );
    return { success: true, variant };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error uploading images';
    return { serverError: message };
  }
}

export async function deleteImageAction(
  imageId: number,
): Promise<{ serverError?: string; success?: boolean }> {
  try {
    await apiFetch(`/products/images/${imageId}`, { method: 'DELETE' });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error deleting image';
    return { serverError: message };
  }
}

export async function addVariantAction(
  productId: number,
  _: CreateProductFormState,
  formData: FormData,
): Promise<CreateProductFormState> {
  const colorId = formData.get('colorId');

  const rawData = {
    sku: formData.get('sku'),
    price: formData.get('price'),
    salePrice: formData.get('salePrice') || undefined,
    size: formData.get('size') || undefined,
    colorId: colorId && colorId !== 'none' ? colorId : undefined,
    stock: formData.get('stock') || 0,
  };

  const validatedFields = VariantSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const body = new FormData();
    const { sku, price, salePrice, size, colorId: validColorId, stock } = validatedFields.data;

    body.append('sku', sku);
    body.append('price', String(price));
    if (salePrice) body.append('salePrice', String(salePrice));
    if (size) body.append('size', size);
    if (validColorId) body.append('colorId', String(validColorId));
    body.append('stock', String(stock));

    const images = formData.getAll('images') as File[];
    if (images.length && images[0].size > 0) {
      images.forEach((image) => body.append('images', image));
    }

    await apiFetchMultipart<ProductVariant>(`/products/${productId}/variants`, body);
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error adding variant';
    return { serverError: message };
  }
}

export async function assignVariantImagesAction(
  productId: number,
  variantId: number,
  imageIds: number[],
): Promise<{ success?: boolean; serverError?: string }> {
  try {
    await apiFetch(`/products/${productId}/variants/${variantId}/images`, {
      method: 'PUT',
      data: { imageIds },
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error assigning images';
    return { serverError: message };
  }
}

export async function getProductsAction(filters?: {
  search?: string;
  category?: string;
  collection?: string;
  gender?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: string | number;
  limit?: string | number;
}): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  if (filters?.search) params.set('search', filters.search);
  if (filters?.category) params.set('category', filters.category);
  if (filters?.collection) params.set('collection', filters.collection);
  if (filters?.gender) params.set('gender', filters.gender);
  if (filters?.size) params.set('size', filters.size);
  if (filters?.color) params.set('color', filters.color);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters?.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));

  const query = params.toString();
  return apiFetch<ProductsResponse>(`/products${query ? `?${query}` : ''}`);
}

export async function addProductImagesAction(
  productId: number,
  formData: FormData,
): Promise<{ success?: boolean; serverError?: string }> {
  const images = formData.getAll('images') as File[];
  if (!images.length || images[0].size === 0) {
    return { serverError: 'At least one image is required' };
  }

  try {
    const body = new FormData();
    images.forEach((image) => body.append('images', image));
    await apiFetchMultipart(`/products/${productId}/images`, body);
    revalidatePath(`/admin/products/${productId}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error uploading images';
    return { serverError: message };
  }
}

export async function deleteProductImageAction(
  imageId: number,
): Promise<{ success?: boolean; serverError?: string }> {
  try {
    await apiFetch(`/products/images/${imageId}`, { method: 'DELETE' });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error deleting image';
    return { serverError: message };
  }
}

export async function getSizeChartAction(productId: number): Promise<SizeChart | null> {
  try {
    return await apiFetch<SizeChart>(`/products/${productId}/size-chart`);
  } catch {
    return null;
  }
}

export async function upsertSizeChartAction(
  productId: number,
  entries: { size: string; measurements: { name: string; value: number; unit: string }[] }[],
): Promise<{ success?: boolean; serverError?: string }> {
  try {
    await apiFetch(`/products/${productId}/size-chart`, {
      method: 'PUT',
      data: { entries },
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error saving size chart';
    return { serverError: message };
  }
}

export async function getMaterialsAction(productId: number): Promise<Material[]> {
  try {
    return await apiFetch<Material[]>(`/products/${productId}/materials`);
  } catch {
    return [];
  }
}

export async function upsertMaterialsAction(
  productId: number,
  materials: { name: string; percentage: number }[],
): Promise<{ success?: boolean; serverError?: string }> {
  try {
    await apiFetch(`/products/${productId}/materials`, {
      method: 'PUT',
      data: { materials },
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error saving materials';
    return { serverError: message };
  }
}
