'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { ProductListItem } from '@/types/product';

export function ProductCard({
  product,
  activeColorId,
}: {
  product: ProductListItem;
  activeColorId?: number | null;
}) {
  const colorVariants = product.variants.reduce(
    (acc, variant) => {
      if (!variant.color) return acc;
      if (!acc.find((v) => v.color?.id === variant.color!.id)) {
        acc.push(variant);
      }
      return acc;
    },
    [] as typeof product.variants,
  );

  const hasColors = colorVariants.length > 0;
  const defaultImage = product.images?.[0]?.url;

  const getVariantByColor = (colorId?: number | null) =>
    colorId
      ? (colorVariants.find((v) => v.color?.id === colorId) ?? colorVariants[0])
      : colorVariants[0];

  const [manualColorId, setManualColorId] = useState<number | null>(null);
  const effectiveColorId = manualColorId ?? activeColorId ?? colorVariants[0]?.color?.id ?? null;
  const activeVariant = getVariantByColor(effectiveColorId);
  const activeImage = activeVariant?.images?.[0]?.image?.url || defaultImage;

  function handleColorClick(variant: (typeof product.variants)[0]) {
    if (!variant.color) return;
    setManualColorId(variant.color.id);
  }

  const minPrice = Math.min(...product.variants.map((v) => Number(v.price)));
  const hasSale = product.variants.some((v) => v.salePrice);
  const minSalePrice = hasSale
    ? Math.min(...product.variants.filter((v) => v.salePrice).map((v) => Number(v.salePrice)))
    : null;

  const href = effectiveColorId
    ? `/catalog/${product.slug}?colorId=${effectiveColorId}`
    : `/catalog/${product.slug}`;

  return (
    <Link href={href} className="group block cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 mb-3">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-zinc-200" />
        )}

        {hasColors && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
            <div className="bg-white/30 backdrop-blur-sm border border-white/20 shadow-lg px-3 py-2.5 flex items-center gap-2">
              {colorVariants.map((variant) => (
                <button
                  key={variant.color!.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleColorClick(variant);
                  }}
                  title={variant.color!.name}
                  className={`w-5 h-5 rounded-full border-2 transition-all shrink-0 ${
                    effectiveColorId === variant.color!.id
                      ? 'border-black scale-110'
                      : 'border-transparent hover:border-zinc-400'
                  }`}
                  style={{ backgroundColor: variant.color!.hexCode }}
                />
              ))}
            </div>
          </div>
        )}

        {minSalePrice && (
          <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-0.5 font-medium">
            SALE
          </div>
        )}
      </div>

      <div className="space-y-0.5">
        <p className="text-xs font-light text-zinc-400 uppercase tracking-wide">
          {product.category?.name}
        </p>
        <h2 className="font-medium text-sm uppercase leading-tight">{product.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          {minSalePrice ? (
            <>
              <span className="text-sm font-semibold">{minSalePrice.toFixed(2)} $</span>
              <span className="text-xs text-zinc-400 line-through">{minPrice.toFixed(2)} $</span>
            </>
          ) : (
            <span className="text-sm font-medium">{minPrice.toFixed(2)} $</span>
          )}
        </div>
      </div>
    </Link>
  );
}
