'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useTransition } from 'react';

import {
  clearCartAction,
  removeFromCartAction,
  updateCartItemAction,
} from '@/actions/cart-actions';
import { Cart, CartItem } from '@/types/cart';

export function CartClient({ initialCart }: { initialCart: Cart | null }) {
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [isPending, startTransition] = useTransition();

  function handleUpdate(res: { success: boolean; cart?: Cart | null }) {
    if (res.success && res.cart) setCart(res.cart);
  }

  function handleQuantityChange(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    startTransition(async () => {
      const res = await updateCartItemAction(item.variantId, newQty);
      handleUpdate(res);
    });
  }

  function handleRemove(variantId: number) {
    startTransition(async () => {
      const res = await removeFromCartAction(variantId);
      handleUpdate(res);
    });
  }

  function handleClear() {
    startTransition(async () => {
      await clearCartAction();
      setCart(null);
    });
  }

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => {
    const price = Number(item.variant.salePrice ?? item.variant.price);
    return sum + price * item.quantity;
  }, 0);

  if (!items.length) {
    return (
      <div className="text-center py-24 space-y-4">
        <p className="text-zinc-400 text-lg">Your cart is empty</p>
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
    <div className="flex flex-col lg:flex-row gap-10">
      <div className="flex-1 space-y-4">
        {items.map((item) => {
          const price = Number(item.variant.salePrice ?? item.variant.price);
          const originalPrice = item.variant.salePrice ? Number(item.variant.price) : null;
          const image =
            item.variant.images?.[0]?.image?.url ?? item.variant.product.images?.[0]?.url;
          const colorParam = item.variant.color
            ? `?color=${encodeURIComponent(item.variant.color.name)}`
            : '';
          const productHref = `/catalog/${item.variant.product.slug}${colorParam}`;

          return (
            <div key={item.id} className="flex gap-4 border-b border-zinc-100 pb-4">
              <Link href={productHref} className="shrink-0">
                <div className="relative w-24 h-32 bg-zinc-100 overflow-hidden">
                  {image ? (
                    <Image
                      src={image}
                      alt={item.variant.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-200" />
                  )}
                </div>
              </Link>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <Link
                    href={productHref}
                    className="text-sm font-semibold uppercase hover:underline"
                  >
                    {item.variant.product.name}
                  </Link>
                  <div className="mt-1 text-xs text-zinc-400 space-y-0.5">
                    {item.variant.color && <p>Color: {item.variant.color.name}</p>}
                    {item.variant.size && <p>Size: {item.variant.size}</p>}
                    <p>SKU: {item.variant.sku}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-zinc-200">
                    <button
                      onClick={() => handleQuantityChange(item, -1)}
                      disabled={isPending}
                      className="p-2 hover:bg-zinc-50 transition-colors disabled:opacity-40"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-4 text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item, 1)}
                      disabled={isPending || item.quantity >= item.variant.stock}
                      className="p-2 hover:bg-zinc-50 transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold">{(price * item.quantity).toFixed(2)} $</p>
                    {originalPrice && (
                      <p className="text-xs text-zinc-400 line-through">
                        {(originalPrice * item.quantity).toFixed(2)} $
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemove(item.variantId)}
                    disabled={isPending}
                    className="p-1.5 text-zinc-400 hover:text-black transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={handleClear}
          disabled={isPending}
          className="text-xs text-zinc-400 hover:text-black transition-colors underline underline-offset-2 mb-12 disabled:opacity-40"
        >
          Clear cart
        </button>
      </div>

      <div className="lg:w-72 shrink-0">
        <div className="border border-zinc-200 p-6 space-y-4 sticky top-24">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Order summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-500">
              <span>Items ({items.reduce((s, i) => s + i.quantity, 0)})</span>
              <span>{total.toFixed(2)} $</span>
            </div>
            <div className="flex justify-between text-zinc-500">
              <span>Shipping</span>
              <span>—</span>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>{total.toFixed(2)} $</span>
          </div>

          <Link
            href="/checkout"
            className="block w-full py-4 bg-black text-white text-sm font-semibold uppercase tracking-widest text-center hover:bg-zinc-800 transition-colors"
          >
            Checkout
          </Link>

          <Link
            href="/catalog"
            className="block text-center text-xs text-zinc-400 hover:text-black transition-colors underline underline-offset-2"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
