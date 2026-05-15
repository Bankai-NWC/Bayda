import type { NextFunction, Request, Response } from 'express';

import sizeChartService from '../services/size-chart-service.js';

class SizeChartController {
  async getSizeChart(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id);
      const chart = await sizeChartService.getSizeChart(productId);
      return res.json(chart);
    } catch (err) {
      next(err);
    }
  }

  async upsertSizeChart(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id);
      const { entries } = req.body;

      if (!Array.isArray(entries)) {
        return res.status(400).json({ message: 'entries must be an array' });
      }

      const chart = await sizeChartService.upsertSizeChart(productId, entries);
      return res.json(chart);
    } catch (err) {
      next(err);
    }
  }

  async deleteSizeChart(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id);
      await sizeChartService.deleteSizeChart(productId);
      return res.json({ message: 'Size chart deleted' });
    } catch (err) {
      next(err);
    }
  }
}

export default new SizeChartController();
