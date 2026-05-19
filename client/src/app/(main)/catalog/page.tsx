import { Suspense } from 'react';

import { getCategoriesAction, getCollectionsAction } from '@/actions/catalog-actions';
import { getProductsAction } from '@/actions/product-actions';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { ProductCard } from '@/components/ui/ProductCard/ProductCard';

import CatalogBreadcrumb from './[slug]/_components/CatalogBreadcrumb';
import { CatalogFilters } from './[slug]/_components/CatalogFilters';

interface Props {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    size?: string;
    color?: string;
    page?: string;
    limit?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;

  const filters = {
    ...params,
    limit: params.limit ?? '12',
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
  };

  const [data, categories, collections] = await Promise.all([
    getProductsAction(filters),
    getCategoriesAction(),
    getCollectionsAction(),
  ]);

  const categoriesList = Array.isArray(categories) ? categories : [];

  const currentCategory = categoriesList.find((cat) => cat.slug === filters.category);

  const pageTitle = currentCategory ? currentCategory.name : 'All Products';

  const activeColorName = filters.color ?? null;

  return (
    <main className="container mx-auto px-4 py-24">
      <div className="mb-8">
        <CatalogBreadcrumb />
        <h1 className="text-4xl font-black uppercase tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex gap-10">
        <Suspense>
          <CatalogFilters
            products={data.items}
            categories={Array.isArray(categories) ? categories : []}
            collections={collections}
            minPriceLimit={data.minPriceLimit}
            maxPriceLimit={data.maxPriceLimit}
          />
        </Suspense>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs text-zinc-400 uppercase tracking-widest">Found: {data.total}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.length > 0 ? (
              data.items.map((product) => (
                <ProductCard key={product.id} product={product} activeColorName={activeColorName} />
              ))
            ) : (
              <p className="text-zinc-400 col-span-full text-center py-16">No products found</p>
            )}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-center mt-10">
              <Pagination page={data.page} totalPages={data.totalPages} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
