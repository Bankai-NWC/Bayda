'use client';

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Minus,
  Plus,
  Ruler,
  ShoppingBag,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';

import {
  addToCartAction,
  getCartItemQuantityAction,
  updateCartItemAction,
} from '@/actions/cart-actions';
import { WishlistButton } from '@/components/ui/WishlistButton/WishlistButton';
import { GenderLabel, Product } from '@/types/product';

import { ProductBreadcrumbs } from './ProductBreadcrumbs';
import { SizeChartModal } from './SizeChartModal';

export function ProductPageClient({
  product,
  initialColorId,
}: {
  product: Product;
  initialColorId?: number | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [cartQuantity, setCartQuantity] = useState(0);
  const [isCartLoading, setIsCartLoading] = useState(true);

  const uniqueColors = useMemo(() => {
    const seen = new Set<number>();
    return product.variants
      .filter((v) => {
        if (!v.color) return false;
        if (seen.has(v.color.id)) return false;
        seen.add(v.color.id);
        return true;
      })
      .map((v) => v.color!);
  }, [product.variants]);

  const hasColors = uniqueColors.length > 0;

  const initialColor = initialColorId
    ? (uniqueColors.find((c) => c.id === initialColorId) ?? uniqueColors[0])
    : uniqueColors[0];

  const [activeColorId, setActiveColorId] = useState<number | null>(initialColor?.id ?? null);

  const variantsForColor = useMemo(
    () =>
      activeColorId
        ? product.variants.filter((v) => v.color?.id === activeColorId)
        : product.variants.filter((v) => !v.color),
    [product.variants, activeColorId],
  );

  const [activeVariantId, setActiveVariantId] = useState<number>(
    variantsForColor[0]?.id ?? product.variants[0]?.id,
  );

  const activeVariant =
    product.variants.find((v) => v.id === activeVariantId) ?? product.variants[0];

  function handleColorChange(colorId: number) {
    setActiveColorId(colorId);
    const first = product.variants.find((v) => v.color?.id === colorId);
    if (first) setActiveVariantId(first.id);

    const colorName = uniqueColors.find((c) => c.id === colorId)?.name;
    const params = new URLSearchParams(searchParams.toString());
    if (colorName) {
      params.set('color', colorName);
    } else {
      params.delete('color');
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function handleVariantChange(variantId: number) {
    setActiveVariantId(variantId);
    setActiveImageIndex(0);
  }

  useEffect(() => {
    getCartItemQuantityAction(activeVariant.id).then((qty) => {
      setCartQuantity(qty);
      setIsCartLoading(false);
    });
  }, [activeVariant.id]);

  async function handleAddToCart() {
    startTransition(async () => {
      const res = await addToCartAction(activeVariant.id, 1);
      if (res.success) setCartQuantity(1);
    });
  }

  async function handleQuantityChange(delta: number) {
    const newQty = cartQuantity + delta;
    startTransition(async () => {
      const res = await updateCartItemAction(activeVariant.id, newQty);
      if (res.success) setCartQuantity(newQty);
    });
  }

  const images = useMemo(() => {
    const variantImgs = activeVariant?.images.map((vi) => vi.image) ?? [];
    return variantImgs.length > 0 ? variantImgs : product.images;
  }, [activeVariant, product.images]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = images[activeImageIndex] ?? images[0];

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showMaterials, setShowMaterials] = useState(false);

  const price = Number(activeVariant?.price ?? 0);
  const salePrice = activeVariant?.salePrice ? Number(activeVariant.salePrice) : null;
  const inStock = (activeVariant?.stock ?? 0) > 0;

  return (
    <>
      {showSizeChart && product.sizeChart && (
        <SizeChartModal sizeChart={product.sizeChart} onClose={() => setShowSizeChart(false)} />
      )}

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <ProductBreadcrumbs product={product} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-3">
            <div className="relative group aspect-[3/4] overflow-hidden bg-zinc-100">
              {activeImage ? (
                <Image
                  key={activeImage.url}
                  src={activeImage.url}
                  alt={product.name}
                  fill
                  className="object-cover transition-opacity duration-300"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-zinc-200" />
              )}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      prevImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      nextImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/20 backdrop-blur-md px-2 py-1 rounded-full text-[10px] text-white font-medium">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
              {salePrice && (
                <div className="absolute top-3 left-3 bg-black text-white text-xs uppercase px-2 py-1 font-medium tracking-wide">
                  SALE
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-800">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative w-16 h-20 shrink-0 overflow-hidden border-2 transition-all ${
                      activeImageIndex === i
                        ? 'border-black'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="text-xs text-zinc-400 uppercase tracking-wide">
              {product.category.name}
              {product.collection && <span> / {product.collection.name}</span>}
            </div>

            <div>
              <div className="flex flex-row justify-between items-center">
                <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">{product.name}</h1>
                <WishlistButton
                  variantId={activeVariant.id}
                  className="p-2 border border-zinc-200 hover:border-black"
                />
              </div>
              <div className="flex items-center gap-3">
                {salePrice ? (
                  <>
                    <span className="text-xl font-semibold">{salePrice.toFixed(2)} $</span>
                    <span className="text-base text-zinc-400 line-through">
                      {price.toFixed(2)} $
                    </span>
                  </>
                ) : (
                  <span className="text-xl font-semibold">{price.toFixed(2)} $</span>
                )}
              </div>
            </div>

            {hasColors && (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Color:{' '}
                  <span className="font-normal text-zinc-500">
                    {uniqueColors.find((c) => c.id === activeColorId)?.name}
                  </span>
                </p>
                <div className="flex gap-2">
                  {uniqueColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorChange(color.id)}
                      title={color.name}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        activeColorId === color.id
                          ? 'border-black scale-110'
                          : 'border-zinc-200 hover:border-zinc-400'
                      }`}
                      style={{ backgroundColor: color.hexCode }}
                    />
                  ))}
                </div>
              </div>
            )}

            {variantsForColor.some((v) => v.size) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Size</p>
                  {product.sizeChart && (
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="flex items-center gap-1 text-xs text-zinc-500 hover:text-black transition-colors"
                    >
                      <Ruler className="w-3 h-3" />
                      Size guide
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {variantsForColor.map((variant) => {
                    const outOfStock = variant.stock === 0;
                    const isActive = variant.id === activeVariantId;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => !outOfStock && handleVariantChange(variant.id)}
                        disabled={outOfStock}
                        className={`min-w-[44px] px-3 py-2 text-sm border transition-all relative ${
                          isActive
                            ? 'border-black bg-black text-white'
                            : outOfStock
                              ? 'border-zinc-200 text-zinc-300 cursor-not-allowed'
                              : 'border-zinc-200 hover:border-black'
                        }`}
                      >
                        {variant.size}
                        {outOfStock && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="w-full h-px bg-zinc-300 rotate-45 absolute" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              {isCartLoading ? (
                <div className="flex-1 h-14 bg-zinc-100 animate-pulse" />
              ) : cartQuantity > 0 ? (
                <div className="flex-1 flex items-center border border-zinc-200">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={isPending}
                    className="px-4 h-14 text-lg hover:bg-zinc-50 transition-colors disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="flex-1 text-center text-sm font-semibold">{cartQuantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={isPending || cartQuantity >= (activeVariant?.stock ?? 0)}
                    className="px-4 h-14 text-lg hover:bg-zinc-50 transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || isPending}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold uppercase tracking-widest transition-colors ${
                    inStock
                      ? 'bg-black text-white hover:bg-zinc-800'
                      : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  {isPending ? 'Adding...' : inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-zinc-600 leading-relaxed border-t pt-6">
                {product.description}
              </p>
            )}

            {product.materials && product.materials.length > 0 && (
              <div className="border-t pt-6">
                <button
                  onClick={() => setShowMaterials((p) => !p)}
                  className="flex items-center justify-between w-full text-sm font-medium"
                >
                  <span>Materials</span>
                  {showMaterials ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showMaterials && (
                  <ul className="mt-3 space-y-1">
                    {product.materials.map((m) => (
                      <li key={m.id} className="flex justify-between text-sm text-zinc-600">
                        <span className="capitalize">{m.name}</span>
                        <span>{m.percentage}%</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="border-t pt-4 space-y-1 text-xs text-zinc-400">
              <p>SKU: {activeVariant?.sku}</p>
              <p>Gender: {GenderLabel[product.gender]}</p>
              {activeVariant?.stock !== undefined && inStock && (
                <p>{activeVariant.stock} in stock</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
