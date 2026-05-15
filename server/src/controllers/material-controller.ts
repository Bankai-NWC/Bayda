import type { NextFunction, Request, Response } from 'express';

import materialService from '../services/material-service.js';

class MaterialController {
  async getMaterials(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id);
      return res.json(await materialService.getMaterials(productId));
    } catch (err) {
      next(err);
    }
  }

  async upsertMaterials(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id);
      const { materials } = req.body;

      if (!Array.isArray(materials)) {
        return res.status(400).json({ message: 'materials must be an array' });
      }

      const result = await materialService.upsertMaterials(productId, materials);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

export default new MaterialController();
