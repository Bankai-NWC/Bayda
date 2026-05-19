import { Router } from 'express';

import cartController from '../controllers/cart-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', cartController.getCart);
router.post('/:variantId', cartController.addItem);
router.patch('/:variantId', cartController.updateItem);
router.delete('/:variantId', cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
