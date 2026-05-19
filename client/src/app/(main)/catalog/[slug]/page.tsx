import { notFound } from 'next/navigation';

import { getProductBySlugAction } from '@/actions/product-actions';

import { ProductPageClient } from './_components/ProductPageClient';

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ color?: string }>;
}) {
  const { slug } = await params;
  const { color } = await searchParams;

  const product = await getProductBySlugAction(slug).catch(() => null);
  if (!product) notFound();

  const initialColorId = color
    ? (product.variants.find((v) => v.color?.name === color)?.color?.id ?? null)
    : null;

  return (
    <div className="pt-16">
      <ProductPageClient product={product} initialColorId={initialColorId} />
    </div>
  );
}
