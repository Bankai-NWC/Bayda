import { DollarSign, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import Link from 'next/link';

import { getOrderStatsAction } from '@/actions/admin-analytics-actions';
import { OrderStatusLabel } from '@/types/order';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
};

export default async function AdminDashboardPage() {
  const { data: stats } = await getOrderStatsAction();

  const statCards = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders ?? 0,
      icon: ShoppingBag,
      format: (v: number) => v.toString(),
    },
    {
      label: 'Total Revenue',
      value: stats?.totalRevenue ?? 0,
      icon: DollarSign,
      format: (v: number) => `${v.toFixed(2)} $`,
    },
    {
      label: 'Avg. Order Value',
      value: stats?.avgOrderValue ?? 0,
      icon: TrendingUp,
      format: (v: number) => `${v.toFixed(2)} $`,
    },
    {
      label: 'Pending Orders',
      value: stats?.ordersByStatus.find((s) => s.status === 'PENDING')?.count ?? 0,
      icon: Package,
      format: (v: number) => v.toString(),
    },
  ];

  return (
    <div className="p-8 pt-0 space-y-8 animate-in fade-in duration-500">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="border bg-white shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between text-zinc-400">
              <p className="text-xs font-semibold uppercase tracking-widest">{card.label}</p>
              <card.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold">{card.format(card.value)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders by status */}
        <div className="border bg-white shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Orders by Status</h2>
          <div className="space-y-2">
            {stats?.ordersByStatus.map((s) => {
              const pct =
                stats.totalOrders > 0 ? Math.round((s.count / stats.totalOrders) * 100) : 0;
              return (
                <div key={s.status} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 border rounded-full ${STATUS_COLORS[s.status]}`}
                    >
                      {OrderStatusLabel[s.status]}
                    </span>
                    <span className="text-zinc-500 text-xs">
                      {s.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-black rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div className="border bg-white shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Top Products</h2>
          {stats?.topProducts.length === 0 ? (
            <p className="text-sm text-zinc-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats?.topProducts.map((item, i) => (
                <div key={item.variantId} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-zinc-300 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {item.variant?.product.name ?? '—'}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {[item.variant?.color?.name, item.variant?.size].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="text-sm font-semibold shrink-0">{item.totalSold} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div className="border bg-white shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-xs text-zinc-400 hover:text-black transition-colors underline underline-offset-2"
            >
              View all
            </Link>
          </div>
          {stats?.recentOrders.length === 0 ? (
            <p className="text-sm text-zinc-400">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats?.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders`}
                  className="flex items-center justify-between group"
                >
                  <div>
                    <p className="text-sm font-medium group-hover:underline">
                      #{order.id} · {order.user.fullName}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''} ·{' '}
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">{order.totalAmount.toFixed(2)} $</p>
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 border rounded-full ${STATUS_COLORS[order.status]}`}
                    >
                      {OrderStatusLabel[order.status]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Orders last 30 days */}
      {stats && stats.ordersLast30Days.length > 0 && (
        <div className="border bg-white shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest">Orders — Last 30 Days</h2>
          <div className="flex items-end gap-1 h-48 overflow-x-auto px-6 pb-1">
            {(() => {
              const maxRevenue = Math.max(...stats.ordersLast30Days.map((d) => d.revenue), 1);
              return stats.ordersLast30Days.map((day) => (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-1 shrink-0 group relative"
                  style={{ minWidth: 20 }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    {day.date}
                    <br />
                    {day.count} orders
                    <br />
                    {day.revenue.toFixed(0)} $
                  </div>
                  <div
                    className="w-4 bg-black rounded-sm transition-all hover:bg-zinc-700"
                    style={{ height: `${Math.max((day.revenue / maxRevenue) * 80, 4)}px` }}
                  />
                  <span className="text-[8px] text-zinc-400 rotate-45 origin-left translate-x-1">
                    {day.date}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
