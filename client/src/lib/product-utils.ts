import { Product, ProductImage, ProductVariant } from '@/types/product';

export function getVariantImages(variant: ProductVariant, product: Product): ProductImage[] {
  if (variant.images.length > 0) {
    return variant.images.map((vi) => vi.image);
  }
  return product.images;
}
