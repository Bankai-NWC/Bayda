import { prisma } from '../config/db.js';

class AnalyticsService {
  async getOrderStats() {
    const [
      totalOrders,
      totalRevenue,
      avgOrderValue,
      ordersByStatus,
      recentOrders,
      topProducts,
      ordersLast30Days,
    ] = await Promise.all([
      // Total number of orders
      prisma.order.count(),

      // Total revenue
      prisma.order.aggregate({
        _sum: { totalAmount: true },
      }),

      // Average bill
      prisma.order.aggregate({
        _avg: { totalAmount: true },
      }),

      // Number of orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Last 5 orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, email: true } },
          items: { select: { id: true } },
        },
      }),

      // Top 5 products by sales volume
      prisma.orderItem
        .groupBy({
          by: ['variantId'],
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 5,
        })
        .then(async (items) => {
          const variantIds = items.map((i) => i.variantId);
          const variants = await prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: {
              product: { select: { name: true, slug: true } },
              color: { select: { name: true } },
            },
          });
          return items.map((item) => ({
            variantId: item.variantId,
            totalSold: item._sum.quantity ?? 0,
            variant: variants.find((v) => v.id === item.variantId),
          }));
        }),

      // Orders for the last 30 days (by day)
      prisma.$queryRaw<{ date: string; count: bigint; revenue: number }[]>`
        SELECT
          TO_CHAR(DATE_TRUNC('day', "createdAt"), 'Mon DD') AS date,
          COUNT(*)::bigint                                   AS count,
          COALESCE(SUM("totalAmount"), 0)::float             AS revenue
        FROM "Order"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', "createdAt")
        ORDER BY DATE_TRUNC('day', "createdAt") ASC
      `,
    ]);

    return {
      totalOrders,
      totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
      avgOrderValue: Number(avgOrderValue._avg.totalAmount ?? 0),
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        totalAmount: Number(o.totalAmount),
        status: o.status,
        createdAt: o.createdAt,
        itemsCount: o.items.length,
        user: o.user,
      })),
      topProducts,
      ordersLast30Days: ordersLast30Days.map((d) => ({
        date: d.date,
        count: Number(d.count),
        revenue: d.revenue,
      })),
    };
  }
}

export default new AnalyticsService();
