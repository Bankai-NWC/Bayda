'use client';

import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

import { getAdminOrdersAction, updateOrderStatusAction } from '@/actions/admin-order-actions';
import { Pagination } from '@/components/ui/Pagination/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Order, OrderStatus, OrderStatusLabel } from '@/types/order';

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PROCESSING: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-purple-50 text-purple-700 border-purple-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
};

export default function AdminOrdersPage() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const statusFilter = searchParams.get('status') ?? 'all';

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const fetchOrders = useCallback(async (page: number, status: string) => {
    setIsLoading(true);
    try {
      const res = await getAdminOrdersAction({
        status: status !== 'all' ? status : undefined,
        page,
        limit: 15,
      });
      if (res.success && res.data) {
        setOrders(res.data.items);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage, statusFilter);
  }, [currentPage, statusFilter, fetchOrders]);

  function handleStatusFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all') {
      params.delete('status');
    } else {
      params.set('status', value);
    }
    params.delete('page');
    window.history.pushState(null, '', `?${params.toString()}`);
    fetchOrders(1, value);
  }

  async function handleStatusChange(orderId: number, status: OrderStatus) {
    setUpdatingId(orderId);
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, status);
      if (res.success) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      }
      setUpdatingId(null);
    });
  }

  return (
    <div className="p-8 pt-0 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between h-10">
        <h1 className="text-2xl font-bold">Orders ({total})</h1>

        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-44 bg-white">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.values(OrderStatus).map((s) => (
              <SelectItem key={s} value={s}>
                {OrderStatusLabel[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b text-muted-foreground uppercase text-[11px]">
            <tr>
              <th className="p-4 text-left font-semibold">Order</th>
              <th className="p-4 text-left font-semibold">Customer</th>
              <th className="p-4 text-left font-semibold">Address</th>
              <th className="p-4 text-left font-semibold">Items</th>
              <th className="p-4 text-left font-semibold">Total</th>
              <th className="p-4 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y relative">
            {isLoading && (
              <tr className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                <td className="border-none flex items-center justify-center w-full h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
                </td>
              </tr>
            )}

            {orders.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-zinc-400">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-semibold">#{order.id}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </td>

                  <td className="p-4 text-zinc-600">#{order.userId}</td>

                  <td className="p-4 text-zinc-500 text-xs max-w-[180px]">
                    <p>{order.shippingCity}</p>
                    <p>
                      {order.shippingStreet}, {order.shippingHouseNumber}
                      {order.shippingApartment && `, apt. ${order.shippingApartment}`}
                    </p>
                  </td>

                  <td className="p-4 text-zinc-600">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </td>

                  <td className="p-4 font-semibold">{Number(order.totalAmount).toFixed(2)} $</td>

                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {updatingId === order.id && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400 shrink-0" />
                      )}
                      <Select
                        value={order.status}
                        onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}
                        disabled={updatingId === order.id}
                      >
                        <SelectTrigger
                          className={`h-7 text-xs font-semibold border px-2 w-36 ${STATUS_COLORS[order.status]}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(OrderStatus).map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {OrderStatusLabel[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          Showing {orders.length} of {total} orders
        </p>
        <Pagination page={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
