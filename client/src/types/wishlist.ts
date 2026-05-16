export interface WishlistItem {
  id: number;
  variantId: number;
  createdAt: string;
  variant: {
    id: number;
    sku: string;
    price: number;
    salePrice: number | null;
    size: string | null;
    stock: number;
    color: { id: number; name: string; hexCode: string } | null;
    product: {
      id: number;
      name: string;
      slug: string;
      category: { name: string };
      images: { url: string; isMain: boolean }[];
    };
    images: {
      id: number;
      order: number;
      image: { url: string };
    }[];
  };
}
