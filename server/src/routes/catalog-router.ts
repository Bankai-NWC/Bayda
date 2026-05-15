import { Router } from 'express';

import catalogController from '../controllers/catalog-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

const router = Router();

router.get('/collections', catalogController.getCollections);
router.post('/collections', authMiddleware, catalogController.createCollection);
router.delete('/collections/:id', authMiddleware, catalogController.deleteCollection);

router.get('/categories', catalogController.getCategories);
router.post('/categories', authMiddleware, catalogController.createCategory);
router.delete('/categories/:id', authMiddleware, catalogController.deleteCategory);
router.get('/categories/:id/sizes', catalogController.getCategoryWithSizes);
router.post('/categories/:id/sizes', authMiddleware, catalogController.setCategorySizes);

export default router;
