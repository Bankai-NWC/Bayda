export enum Gender {
  MAN = 'MAN',
  WOMAN = 'WOMAN',
  UNISEX = 'UNISEX',
}

export interface Color {
  id: number;
  name: string;
  hexCode: string;
}

export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  category: Category;
  collection: Collection | null;
  images: ProductImage[];
  variants: {
    id: number;
    price: number;
    salePrice: number | null;
    color: Color | null;
    size: string | null;
    stock: number;
    images: VariantImage[];
  }[];
  createdAt: string;
}

export interface ProductImage {
  id: number;
  url: string;
  publicId: string;
  isMain: boolean;
  order: number;
}

export interface VariantImage {
  id: number;
  imageId: number;
  variantId: number;
  order: number;
  image: ProductImage;
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  salePrice: number | null;
  size: string | null;
  color: Color | null;
  stock: number;
  images: VariantImage[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  gender: Gender;
  categoryId: number;
  category: Category;
  collectionId: number | null;
  collection: Collection | null;
  variants: ProductVariant[];
  images: ProductImage[];
  sizeChart: SizeChart | null;
  materials: Material[];
  createdAt: string;
}

export interface ProductsResponse {
  items: ProductListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type CreateProductFormState = {
  errors?: {
    name?: string[];
    description?: string[];
    sku?: string[];
    price?: string[];
    salePrice?: string[];
    size?: string[];
    color?: string[];
    stock?: string[];
    images?: string[];
  };
  serverError?: string;
  success?: boolean;
  product?: Product;
};

export interface Category {
  id: number;
  name: string;
  slug: string;
  sizes: CategorySizeItem[];
}

export interface CategorySizeItem {
  id: number;
  size: string;
  categoryId: number;
}

export interface Collection {
  id: number;
  name: string;
  slug: string;
}

export const GenderLabel: Record<Gender, string> = {
  [Gender.MAN]: 'Man',
  [Gender.WOMAN]: 'Woman',
  [Gender.UNISEX]: 'Unisex',
};

export interface Measurement {
  id: number;
  name: string;
  value: number;
  unit: string;
}

export interface SizeEntry {
  id: number;
  size: string;
  measurements: Measurement[];
}

export interface SizeChart {
  id: number;
  productId: number;
  entries: SizeEntry[];
}

export interface Material {
  id: number;
  name: string;
  percentage: number;
}

export interface PaginatedColors {
  items: Color[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type GetColorsResponse<T> = T extends number ? PaginatedColors : Color[];
