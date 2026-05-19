import { Color, ProductImage, VariantImage } from './product';

export interface CartVariant {
  id: number;
  sku: string;
  price: number;
  salePrice: number | null;
  size: string | null;
  stock: number;
  color: Color | null;
  images: VariantImage[];
  product: {
    id: number;
    name: string;
    slug: string;
    images: ProductImage[];
  };
}

export interface CartItem {
  id: number;
  cartId: number;
  variantId: number;
  quantity: number;
  variant: CartVariant;
}

export interface Cart {
  id: number;
  userId: number | null;
  sessionId: string | null;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}
