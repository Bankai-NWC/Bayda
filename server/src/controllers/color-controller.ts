import type { NextFunction, Request, Response } from 'express';

import colorService from '../services/color-service.js';

class ColorController {
  async getColors(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit } = req.query;

      if (page || limit) {
        const result = await colorService.getColorsPaginated(
          Number(page) || 1,
          Number(limit) || 10,
        );
        return res.json(result);
      }

      const colors = await colorService.getColors();
      return res.json(colors);
    } catch (err) {
      next(err);
    }
  }

  async getColorById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      return res.json(await colorService.getColorById(Number(id)));
    } catch (err) {
      next(err);
    }
  }

  async getColorsPaginated(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '10' } = req.query;
      return res.json(await colorService.getColorsPaginated(Number(page), Number(limit)));
    } catch (err) {
      next(err);
    }
  }

  async createColor(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, hexCode } = req.body;
      return res.status(201).json(await colorService.createColor(name, hexCode));
    } catch (err) {
      next(err);
    }
  }

  async updateColor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, hexCode } = req.body;
      return res.json(await colorService.updateColor(Number(id), name, hexCode));
    } catch (err) {
      next(err);
    }
  }

  async deleteColor(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await colorService.deleteColor(Number(id));
      return res.json({ message: 'Color deleted' });
    } catch (err) {
      next(err);
    }
  }
}

export default new ColorController();
