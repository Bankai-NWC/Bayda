import { Plus } from 'lucide-react';
import Link from 'next/link';

import { getCategoriesAction, getCollectionsAction } from '@/actions/catalog-actions';
import { getProductsAction } from '@/actions/product-actions';
import { Button } from '@/components/ui/button';

import { Pagination } from '../../../../components/ui/Pagination/Pagination';
import { ProductFilters } from './_components/ProductFilters';
import { ProductTable } from './_components/ProductTable';

interface Props {
  searchParams: Promise<{
    search?: string;
    category?: string;
    collection?: string;
    gender?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const filters = await searchParams;

  const [{ items: products, total, page, totalPages }, categories, collections] = await Promise.all(
    [getProductsAction(filters), getCategoriesAction(), getCollectionsAction()],
  );

  return (
    <div className="p-8 pt-0 space-y-6  animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products ({total})</h1>
        <Button asChild>
          <Link href="/admin/products/create-product">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Link>
        </Button>
      </div>

      <ProductFilters collections={collections} categories={categories} filters={filters} />

      <ProductTable products={products} />

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Showing {products.length} of {total} products
        </p>
        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  );
}
