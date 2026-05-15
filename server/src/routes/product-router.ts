import { Router } from 'express';

import { ProductRoutes } from '../config/routes.config.js';
import materialController from '../controllers/material-controller.js';
import productController from '../controllers/product-controller.js';
import sizeChartController from '../controllers/size-chart-controller.js';
import { authMiddleware } from '../middlewares/auth-middleware.js';
import { upload } from '../middlewares/upload-middleware.js';

const router = Router();

router.get('/', productController.getProducts);
router.post(
  ProductRoutes.createProduct,
  authMiddleware,
  upload.array('images', 10),
  productController.createProduct,
);

router.get('/slug/:slug', productController.getProductBySlug);
router.delete('/images/:imageId', authMiddleware, productController.deleteProductImage);

router.get('/:id', productController.getProduct);
router.patch('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

router.post(
  '/:id/images',
  authMiddleware,
  upload.array('images', 100),
  productController.addProductImages,
);

router.post(
  ProductRoutes.createVariant,
  authMiddleware,
  upload.array('images', 10),
  productController.addVariant,
);
router.patch('/:id/variants/:variantId', authMiddleware, productController.updateVariant);
router.delete('/:id/variants/:variantId', authMiddleware, productController.deleteVariant);

router.put(
  '/:id/variants/:variantId/images',
  authMiddleware,
  productController.assignImagesToVariant,
);

router.get('/:id/size-chart', sizeChartController.getSizeChart);
router.put('/:id/size-chart', authMiddleware, sizeChartController.upsertSizeChart);
router.delete('/:id/size-chart', authMiddleware, sizeChartController.deleteSizeChart);

router.get('/:id/materials', materialController.getMaterials);
router.put('/:id/materials', authMiddleware, materialController.upsertMaterials);

export default router;
