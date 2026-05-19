'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { WishlistItem } from '@/types/wishlist';

import { WishlistButton } from '../../../../../components/ui/WishlistButton/WishlistButton';

export function WishlistClient({ initialItems }: { initialItems: WishlistItem[] }) {
  const [items, setItems] = useState(initialItems);

  function handleRemove(variantId: number) {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-zinc-400 text-lg">Your wishlist is empty</p>
        <Link
          href="/catalog"
          className="inline-block text-sm underline underline-offset-4 hover:text-zinc-600 transition-colors"
        >
          Go to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map((item) => {
        const { variant } = item;
        const { product } = variant;
        const image =
          variant.images?.[0]?.image?.url ||
          product.images?.find((img) => img.isMain)?.url ||
          product.images?.[0]?.url;

        const price = Number(variant.price);
        const salePrice = variant.salePrice ? Number(variant.salePrice) : null;
        const href = variant.color
          ? `/catalog/${product.slug}?color=${variant.color.name}`
          : `/catalog/${product.slug}`;

        return (
          <div key={item.id} className="group relative">
            <div className="absolute top-2 right-2 z-10">
              <WishlistButton
                variantId={variant.id}
                size="sm"
                className="bg-white/80 backdrop-blur-sm p-1.5 rounded-full hover:bg-white"
                onRemove={() => handleRemove(variant.id)}
              />
            </div>

            <Link href={href} className="block">
              {/* Фото */}
              <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 mb-3">
                {image ? (
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-200" />
                )}
                {salePrice && (
                  <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-0.5">
                    SALE
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-xs text-zinc-400 uppercase tracking-wide">
                  {product.category.name}
                </p>
                <h2 className="font-medium text-sm uppercase leading-tight">{product.name}</h2>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  {variant.color && (
                    <span className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full border border-zinc-200 inline-block"
                        style={{ backgroundColor: variant.color.hexCode }}
                      />
                      {variant.color.name}
                    </span>
                  )}
                  {variant.size && (
                    <>
                      {variant.color && <span>·</span>}
                      <span>{variant.size}</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  {salePrice ? (
                    <>
                      <span className="text-sm font-semibold">{salePrice.toFixed(2)} $</span>
                      <span className="text-xs text-zinc-400 line-through">
                        {price.toFixed(2)} $
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium">{price.toFixed(2)} $</span>
                  )}
                </div>

                {variant.stock === 0 && <p className="text-xs text-red-400">Out of stock</p>}
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
