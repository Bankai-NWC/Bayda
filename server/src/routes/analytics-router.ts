import { Router } from 'express';

import analyticsController from '../controllers/analytics-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import { roleMiddleware } from '../middlewares/role-middlware.js';

const router = Router();

router.get('/orders', authMiddleware, roleMiddleware('ADMIN'), analyticsController.getOrderStats);

export default router;
