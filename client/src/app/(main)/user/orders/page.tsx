import Link from 'next/link';

import { getMyOrdersAction } from '@/actions/order-actions';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import { OrderStatusLabel } from '@/types/order';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const { data } = await getMyOrdersAction(page ? Number(page) : 1);

  const orders = data?.items ?? [];

  return (
    <main className="container mx-auto px-4 max-w-5xl">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-10">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <p className="text-zinc-400">You have no orders yet</p>
          <Link
            href="/catalog"
            className="inline-block text-sm font-semibold uppercase tracking-widest underline underline-offset-4 hover:text-zinc-500 transition-colors"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/user/orders/${order.id}`}
              className="block border border-zinc-200 p-5 hover:border-black transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold">Order #{order.id}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
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

              <div className="text-xs text-zinc-500 space-y-0.5 mb-3">
                <p>
                  {order.shippingCity}, {order.shippingStreet} {order.shippingHouseNumber}
                </p>
                <p>
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{Number(order.totalAmount).toFixed(2)} $</p>
                <span className="text-xs text-zinc-400 underline underline-offset-2">
                  View details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-10 mb-12">
          <Pagination page={data.page} totalPages={data.totalPages} />
        </div>
      )}
    </main>
  );
}
