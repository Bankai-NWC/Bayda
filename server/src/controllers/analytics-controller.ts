import type { NextFunction, Request, Response } from 'express';

import analyticsService from '../services/analytics-service.js';

class AnalyticsController {
  async getOrderStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await analyticsService.getOrderStats();
      return res.json(stats);
    } catch (err) {
      next(err);
    }
  }
}

export default new AnalyticsController();
