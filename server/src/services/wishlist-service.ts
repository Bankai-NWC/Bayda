import { prisma } from '../config/db.js';
import { ApiError } from '../middlewares/error-middleware.js';

class WishlistService {
  async getWishlist(userId: number) {
    return prisma.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        variant: {
          include: {
            color: true,
            product: {
              include: {
                category: true,
                images: { where: { isMain: true }, take: 1 },
              },
            },
            images: {
              include: { image: true },
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
    });
  }

  async addToWishlist(userId: number, variantId: number) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw ApiError.BadRequest('Variant not found');

    const existing = await prisma.wishlist.findUnique({
      where: { userId_variantId: { userId, variantId } },
    });
    if (existing) throw ApiError.BadRequest('Already in wishlist');

    return prisma.wishlist.create({
      data: { userId, variantId },
      include: {
        variant: {
          include: {
            color: true,
            product: {
              include: {
                category: true,
                images: { where: { isMain: true }, take: 1 },
              },
            },
            images: {
              include: { image: true },
              orderBy: { order: 'asc' },
              take: 1,
            },
          },
        },
      },
    });
  }

  async removeFromWishlist(userId: number, variantId: number) {
    const item = await prisma.wishlist.findUnique({
      where: { userId_variantId: { userId, variantId } },
    });
    if (!item) throw ApiError.BadRequest('Item not found in wishlist');

    return prisma.wishlist.delete({
      where: { userId_variantId: { userId, variantId } },
    });
  }

  async isInWishlist(userId: number, variantId: number) {
    const item = await prisma.wishlist.findUnique({
      where: { userId_variantId: { userId, variantId } },
    });
    return !!item;
  }
}

export default new WishlistService();
