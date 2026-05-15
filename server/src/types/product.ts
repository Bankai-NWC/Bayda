import { Gender } from '@prisma/client';

export interface CreateProductInput {
  name: string;
  description?: string;
  categoryId?: number;
  collectionId?: number;
  gender: Gender;
  variant: {
    sku: string;
    price: number;
    salePrice?: number;
    size?: string;
    colorId?: number;
    stock?: number;
  };
  images: { buffer: Buffer; isMain: boolean }[];
}

export interface VariantInput {
  sku: string;
  price: number;
  salePrice?: number;
  size?: string;
  colorId?: number;
  stock?: number;
}

export interface Color {
  id: number;
  name: string;
  hesCode: string;
}
