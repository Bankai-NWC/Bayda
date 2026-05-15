import { Router } from 'express';

import colorController from '../controllers/color-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

const router = Router();

router.get('/colors', colorController.getColors);
router.post('/colors', authMiddleware, colorController.createColor);
router.get('/colors/:id', colorController.getColorById);
router.put('/colors/:id', authMiddleware, colorController.updateColor);
router.delete('/colors/:id', authMiddleware, colorController.deleteColor);

export default router;
