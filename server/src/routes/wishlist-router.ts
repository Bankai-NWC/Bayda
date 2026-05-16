import { Router } from 'express';

import wishlistController from '../controllers/wishlist-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';

const router = Router();

// Все роуты требуют авторизации
router.use(authMiddleware);

router.get('/', wishlistController.getWishlist);
router.post('/:variantId', wishlistController.addToWishlist);
router.delete('/:variantId', wishlistController.removeFromWishlist);
router.get('/:variantId/check', wishlistController.checkWishlist);

export default router;
