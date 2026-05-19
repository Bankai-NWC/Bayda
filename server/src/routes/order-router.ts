import { Router } from 'express';

import orderController from '../controllers/order-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import { roleMiddleware } from '../middlewares/role-middlware.js';

const router = Router();

router.post('/', authMiddleware, orderController.createOrder);
router.get('/my', authMiddleware, orderController.getMyOrders);
router.get('/my/:id', authMiddleware, orderController.getMyOrder);
router.delete('/my/:id', authMiddleware, orderController.cancelOrder);

// ── Admins ───────────────────────────────────────
router.get('/', authMiddleware, roleMiddleware('ADMIN'), orderController.getAllOrders);
router.get('/:id', authMiddleware, roleMiddleware('ADMIN'), orderController.getOrderById);
router.patch('/:id/status', authMiddleware, roleMiddleware('ADMIN'), orderController.updateStatus);

export default router;
