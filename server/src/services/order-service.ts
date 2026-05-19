import { OrderStatus } from '@prisma/client';

import { prisma } from '../config/db.js';
import { ApiError } from '../middlewares/error-middleware.js';

interface CreateOrderInput {
  userId: number;
  shippingCity: string;
  shippingStreet: string;
  shippingHouseNumber: string;
  shippingApartment?: string;
  items: {
    variantId: number;
    quantity: number;
  }[];
}

const ORDER_INCLUDE = {
  items: {
    include: {
      productVariant: {
        include: {
          product: { select: { name: true, slug: true } },
          color: { select: { name: true, hexCode: true } },
          images: {
            include: { image: { select: { url: true } } },
            orderBy: { order: 'asc' as const },
            take: 1,
          },
        },
      },
    },
  },
} as const;

class OrderService {
  async createOrder(input: CreateOrderInput) {
    const { userId, shippingCity, shippingStreet, shippingHouseNumber, shippingApartment, items } =
      input;

    if (!items.length) throw ApiError.BadRequest('Order must contain at least one item');

    const variantIds = items.map((i) => i.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
    });

    if (variants.length !== variantIds.length) {
      throw ApiError.BadRequest('One or more variants not found');
    }

    let totalAmount = 0;

    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId)!;

      if (variant.stock < item.quantity) {
        throw ApiError.BadRequest(
          `Not enough stock for variant ${variant.sku}. Available: ${variant.stock}`,
        );
      }

      const price = Number(variant.salePrice ?? variant.price);
      totalAmount += price * item.quantity;
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          shippingCity,
          shippingStreet,
          shippingHouseNumber,
          shippingApartment: shippingApartment ?? null,
          totalAmount,
          items: {
            create: items.map((item) => {
              const variant = variants.find((v) => v.id === item.variantId)!;
              const priceAtPurchase = Number(variant.salePrice ?? variant.price);
              return {
                variantId: item.variantId,
                quantity: item.quantity,
                priceAtPurchase,
              };
            }),
          },
        },
        include: ORDER_INCLUDE,
      });

      await Promise.all(
        items.map((item) =>
          tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      );

      return created;
    });

    return order;
  }

  async getOrders(filters?: {
    userId?: number;
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters?.userId ? { userId: filters.userId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: ORDER_INCLUDE,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrderById(id: number, userId?: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: ORDER_INCLUDE,
    });

    if (!order) throw ApiError.NotFound('Order not found');

    if (userId && order.userId !== userId) {
      throw ApiError.Forbidden('Access denied');
    }

    return order;
  }

  async updateStatus(id: number, status: OrderStatus) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw ApiError.NotFound('Order not found');

    return prisma.order.update({
      where: { id },
      data: { status },
      include: ORDER_INCLUDE,
    });
  }

  async cancelOrder(id: number, userId: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) throw ApiError.NotFound('Order not found');
    if (order.userId !== userId) throw ApiError.Forbidden('Access denied');

    if (order.status !== 'PENDING') {
      throw ApiError.BadRequest('Only PENDING orders can be cancelled');
    }

    const cancelled = await prisma.$transaction(async (tx) => {
      await Promise.all(
        order.items.map((item) =>
          tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          }),
        ),
      );

      return tx.order.delete({ where: { id } });
    });

    return cancelled;
  }
}

export default new OrderService();
