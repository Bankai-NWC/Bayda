import type { NextFunction, Request, Response } from 'express';

import cartService from '../services/cart-service.js';

class CartController {
  async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const cart = await cartService.getOrCreateCart(userId);
      return res.json(cart);
    } catch (err) {
      next(err);
    }
  }

  async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const variantId = Number(req.params.variantId);
      const quantity = Number(req.body.quantity) || 1;

      const cart = await cartService.getOrCreateCart(userId);
      await cartService.addItem(cart.id, variantId, quantity);

      const updated = await cartService.getOrCreateCart(userId);
      return res.status(201).json(updated);
    } catch (err) {
      next(err);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const variantId = Number(req.params.variantId);
      const quantity = Number(req.body.quantity);

      const cart = await cartService.getOrCreateCart(userId);
      await cartService.updateItem(cart.id, variantId, quantity);

      const updated = await cartService.getOrCreateCart(userId);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const variantId = Number(req.params.variantId);

      const cart = await cartService.getOrCreateCart(userId);
      await cartService.removeItem(cart.id, variantId);

      const updated = await cartService.getOrCreateCart(userId);
      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async clearCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const cart = await cartService.getOrCreateCart(userId);
      await cartService.clearCart(cart.id);
      return res.json({ message: 'Cart cleared' });
    } catch (err) {
      next(err);
    }
  }
}

export default new CartController();
