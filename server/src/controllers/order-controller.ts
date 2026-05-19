import { OrderStatus } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../middlewares/error-middleware.js';
import orderService from '../services/order-service.js';

class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw ApiError.UnauthorizedError();

      const { shippingCity, shippingStreet, shippingHouseNumber, shippingApartment, items } =
        req.body;

      if (!shippingCity || !shippingStreet || !shippingHouseNumber) {
        throw ApiError.BadRequest('Shipping address is required');
      }

      if (!Array.isArray(items) || items.length === 0) {
        throw ApiError.BadRequest('Items are required');
      }

      const order = await orderService.createOrder({
        userId,
        shippingCity,
        shippingStreet,
        shippingHouseNumber,
        shippingApartment,
        items,
      });

      return res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  }

  async getMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw ApiError.UnauthorizedError();

      const { status, page, limit } = req.query;

      const result = await orderService.getOrders({
        userId,
        status: status as OrderStatus | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getMyOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw ApiError.UnauthorizedError();

      const order = await orderService.getOrderById(Number(req.params.id), userId);
      return res.json(order);
    } catch (err) {
      next(err);
    }
  }

  async cancelOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw ApiError.UnauthorizedError();

      await orderService.cancelOrder(Number(req.params.id), userId);
      return res.json({ message: 'Order cancelled' });
    } catch (err) {
      next(err);
    }
  }

  // ── Admin ────────────────────────────────────────────────
  async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;

      const result = await orderService.getOrders({
        status: status as OrderStatus | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getOrderById(Number(req.params.id));
      return res.json(order);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;

      const validStatuses = Object.values(OrderStatus);
      if (!validStatuses.includes(status)) {
        throw ApiError.BadRequest(`Invalid status. Valid: ${validStatuses.join(', ')}`);
      }

      const order = await orderService.updateStatus(Number(req.params.id), status);
      return res.json(order);
    } catch (err) {
      next(err);
    }
  }
}

export default new OrderController();
