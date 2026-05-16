import type { NextFunction, Request, Response } from 'express';

import wishlistService from '../services/wishlist-service.js';

class WishlistController {
  async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const wishlist = await wishlistService.getWishlist(userId);
      return res.json(wishlist);
    } catch (err) {
      next(err);
    }
  }

  async addToWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const variantId = Number(req.params.variantId);
      const item = await wishlistService.addToWishlist(userId, variantId);
      return res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async removeFromWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const variantId = Number(req.params.variantId);
      await wishlistService.removeFromWishlist(userId, variantId);
      return res.json({ message: 'Removed from wishlist' });
    } catch (err) {
      next(err);
    }
  }

  async checkWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const variantId = Number(req.params.variantId);
      const inWishlist = await wishlistService.isInWishlist(userId, variantId);
      return res.json({ inWishlist });
    } catch (err) {
      next(err);
    }
  }
}

export default new WishlistController();
