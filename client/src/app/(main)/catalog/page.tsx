import { Suspense } from 'react';

import { getCategoriesAction, getCollectionsAction } from '@/actions/catalog-actions';
import { getProductsAction } from '@/actions/product-actions';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { ProductCard } from '@/components/ui/ProductCard/ProductCard';

import { CatalogFilters } from './[slug]/_components/CatalogFilters';

interface Props {
  searchParams: Promise<{
    categoryId?: string;
    collectionId?: string;
    size?: string;
    colorId?: string;
    page?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const filters = await searchParams;

  const [data, categories, collections] = await Promise.all([
    getProductsAction(filters),
    getCategoriesAction(),
    getCollectionsAction(),
  ]);
  const activeColorId = filters.colorId ? Number(filters.colorId) : null;

  return (
    <main className="container mx-auto px-4 py-24">
      <div className="mb-8">
        <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Home / Catalog</p>
        <h1 className="text-4xl font-black uppercase tracking-tight">All Products</h1>
      </div>

      <div className="flex gap-10">
        <Suspense>
          <CatalogFilters
            products={data.items}
            categories={Array.isArray(categories) ? categories : []}
            collections={collections}
          />
        </Suspense>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-zinc-400 uppercase tracking-widest">Found: {data.total}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.length > 0 ? (
              data.items.map((product) => (
                <ProductCard key={product.id} product={product} activeColorId={activeColorId} />
              ))
            ) : (
              <p className="text-zinc-400 col-span-full text-center py-16">No products found</p>
            )}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-10">
              <p className="text-sm text-zinc-500">
                Showing {data.items.length} of {data.total}
              </p>
              <Pagination page={data.page} totalPages={data.totalPages} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
