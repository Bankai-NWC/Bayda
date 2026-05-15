import { prisma } from '../config/db.js';
import { ApiError } from '../middlewares/error-middleware.js';

class CartService {
  async getOrCreateCart(userId?: number, sessionId?: string) {
    if (userId) {
      return prisma.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
        include: {
          items: {
            include: {
              variant: { include: { color: true, product: { include: { images: true } } } },
            },
          },
        },
      });
    }

    if (sessionId) {
      return prisma.cart.upsert({
        where: { sessionId },
        create: { sessionId },
        update: {},
        include: {
          items: {
            include: {
              variant: { include: { color: true, product: { include: { images: true } } } },
            },
          },
        },
      });
    }

    throw ApiError.BadRequest('userId or sessionId required');
  }

  async addItem(cartId: number, variantId: number, quantity: number = 1) {
    return prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId, variantId } },
      update: { quantity: { increment: quantity } },
      create: { cartId, variantId, quantity },
    });
  }

  async updateItem(cartId: number, variantId: number, quantity: number) {
    if (quantity <= 0) {
      return prisma.cartItem.delete({
        where: { cartId_variantId: { cartId, variantId } },
      });
    }

    return prisma.cartItem.update({
      where: { cartId_variantId: { cartId, variantId } },
      data: { quantity },
    });
  }

  async removeItem(cartId: number, variantId: number) {
    return prisma.cartItem.delete({
      where: { cartId_variantId: { cartId, variantId } },
    });
  }

  async clearCart(cartId: number) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  }

  async mergeCarts(sessionId: string, userId: number) {
    const anonymousCart = await prisma.cart.findUnique({
      where: { sessionId },
      include: { items: true },
    });

    if (!anonymousCart || anonymousCart.items.length === 0) return;

    const userCart = await prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: { items: true },
    });

    for (const item of anonymousCart.items) {
      await prisma.cartItem.upsert({
        where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
        update: { quantity: { increment: item.quantity } },
        create: { cartId: userCart.id, variantId: item.variantId, quantity: item.quantity },
      });
    }

    await prisma.cart.delete({ where: { id: anonymousCart.id } });
  }
}

export default new CartService();
