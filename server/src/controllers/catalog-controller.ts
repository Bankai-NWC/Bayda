import type { NextFunction, Request, Response } from 'express';

import catalogService from '../services/catalog-service.js';

class CatalogController {
  async getCollections(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(await catalogService.getCollections());
    } catch (err) {
      next(err);
    }
  }

  async createCollection(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      return res.status(201).json(await catalogService.createCollection(name));
    } catch (err) {
      next(err);
    }
  }

  async deleteCollection(req: Request, res: Response, next: NextFunction) {
    try {
      await catalogService.deleteCollection(Number(req.params.id));
      return res.json({ message: 'Collection deleted' });
    } catch (err) {
      next(err);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      return res.json(await catalogService.getCategories());
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      return res.status(201).json(await catalogService.createCategory(name));
    } catch (err) {
      next(err);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await catalogService.deleteCategory(Number(id));
      return res.json({ message: 'Category deleted' });
    } catch (err) {
      next(err);
    }
  }

  async getCategoryWithSizes(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      return res.json(await catalogService.getCategoryWithSizes(Number(id)));
    } catch (err) {
      next(err);
    }
  }

  async setCategorySizes(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { sizes } = req.body;
      return res.json(await catalogService.setCategorySizes(Number(id), sizes));
    } catch (err) {
      next(err);
    }
  }
}

export default new CatalogController();
