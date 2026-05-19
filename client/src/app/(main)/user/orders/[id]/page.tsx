import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getMyOrderAction } from '@/actions/order-actions';
import { OrderStatusLabel } from '@/types/order';

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;

  const { order } = await getMyOrderAction(Number(id));
  if (!order) notFound();

  return (
    <main className="container mx-auto px-4 max-w-5xl">
      {success && (
        <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 px-6 py-4 mb-8">
          <CheckCircle className="w-5 h-5 text-black shrink-0" />
          <div>
            <p className="text-sm font-semibold">Order placed successfully!</p>
            <p className="text-xs text-zinc-500">We will notify you when it ships.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Order #{order.id}</h1>
          <p className="text-xs text-zinc-400 mt-1">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-widest border border-zinc-200 px-3 py-1.5">
          {OrderStatusLabel[order.status]}
        </span>
      </div>

      <div className="space-y-4 mb-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest">Items</h2>
        {order.items.map((item) => {
          const image = item.productVariant.images?.[0]?.image?.url;
          return (
            <div key={item.id} className="flex gap-4 border-b border-zinc-100 pb-4">
              <Link href={`/catalog/${item.productVariant.product.slug}`} className="shrink-0">
                <div className="relative w-20 h-28 bg-zinc-100 overflow-hidden">
                  {image ? (
                    <Image
                      src={image}
                      alt={item.productVariant.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-200" />
                  )}
                </div>
              </Link>
              <div className="flex-1">
                <Link
                  href={`/catalog/${item.productVariant.product.slug}`}
                  className="text-sm font-semibold uppercase hover:underline"
                >
                  {item.productVariant.product.name}
                </Link>
                <div className="text-xs text-zinc-400 space-y-0.5 mt-1">
                  {item.productVariant.color && <p>Color: {item.productVariant.color.name}</p>}
                  {item.productVariant.size && <p>Size: {item.productVariant.size}</p>}
                  <p>Qty: {item.quantity}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold">
                  {(Number(item.priceAtPurchase) * item.quantity).toFixed(2)} $
                </p>
                <p className="text-xs text-zinc-400">
                  {Number(item.priceAtPurchase).toFixed(2)} $ each
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Delivery address</h2>
          <div className="text-sm text-zinc-600 space-y-0.5">
            <p>{order.shippingCity}</p>
            <p>
              {order.shippingStreet}, {order.shippingHouseNumber}
              {order.shippingApartment && `, apt. ${order.shippingApartment}`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Total</h2>
          <p className="text-2xl font-bold">{Number(order.totalAmount).toFixed(2)} $</p>
        </div>
      </div>

      <div className="mt-10 mb-12 flex gap-4">
        <Link
          href="/user/orders"
          className="text-sm underline underline-offset-4 text-zinc-500 hover:text-black transition-colors"
        >
          All orders
        </Link>
        <Link
          href="/catalog"
          className="text-sm underline underline-offset-4 text-zinc-500 hover:text-black transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}
