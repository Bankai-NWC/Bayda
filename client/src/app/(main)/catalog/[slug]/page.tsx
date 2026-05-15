import { notFound } from 'next/navigation';

import { getProductBySlugAction } from '@/actions/product-actions';

import { ProductPageClient } from './_components/ProductPageClient';

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ colorId?: string }>;
}) {
  const { slug } = await params;
  const { colorId } = await searchParams;

  const product = await getProductBySlugAction(slug).catch(() => null);
  if (!product) notFound();

  return (
    <div className="pt-16">
      <ProductPageClient product={product} initialColorId={colorId ? Number(colorId) : null} />
    </div>
  );
}
