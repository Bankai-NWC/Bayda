'use client';

import { Pencil, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { deleteProductAction } from '@/actions/product-actions';
import { Button } from '@/components/ui/button';
import { ProductListItem } from '@/types/product';

export function ProductTable({ products }: { products: ProductListItem[] }) {
  const router = useRouter();

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;

    const result = await deleteProductAction(id);
    if (result.success) {
      router.refresh();
    } else {
      alert('Failed to delete product');
    }
  };

  return (
    <div className="border overflow-hidden bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-zinc-50 border-b">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Product</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Category</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Collection</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Variants</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Stock</th>
            <th className="text-left px-4 py-3 font-medium text-zinc-500">Price</th>
            <th className="text-left text-right px-4 py-3 font-medium text-zinc-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((product) => {
            const mainImage =
              product.images?.[0]?.url || product.variants?.[0]?.images?.[0]?.image?.url;
            const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
            const minPrice = Math.min(...product.variants.map((v) => Number(v.price)));

            return (
              <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-md overflow-hidden bg-zinc-100 flex-shrink-0">
                      {mainImage ? (
                        <Image src={mainImage} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-200" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium leading-tight">{product.name}</p>
                      <p className="text-zinc-400 text-xs">{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {product?.category?.name ?? <span className="text-zinc-300">—</span>}
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {product.collection?.name ?? <span className="text-zinc-300">—</span>}
                </td>
                <td className="px-4 py-3 text-zinc-600">{product.variants.length}</td>
                <td className="px-4 py-3">
                  <span className={totalStock === 0 ? 'text-red-500' : 'text-zinc-600'}>
                    {totalStock}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-600">
                  {product.variants.length > 0 ? `from $${minPrice.toFixed(2)}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/products/${product.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}

          {products.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-zinc-400">
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
