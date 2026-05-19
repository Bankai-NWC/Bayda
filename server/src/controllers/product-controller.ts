import type { NextFunction, Request, Response } from 'express';

import { ApiError } from '../middlewares/error-middleware.js';
import productService from '../services/product-service.js';

class ProductController {
  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        description,
        categoryId,
        collectionId,
        sku,
        price,
        salePrice,
        size,
        colorId,
        stock,
        gender,
      } = req.body;

      const files = (req.files as Express.Multer.File[]) ?? [];
      if (!files.length) throw ApiError.BadRequest('At least one image is required');

      const images = files.map((file, i) => ({
        buffer: file.buffer,
        isMain: i === 0,
      }));

      const product = await productService.createProduct({
        name,
        description,
        categoryId: categoryId && categoryId !== 'none' ? Number(categoryId) : undefined,
        collectionId: collectionId && collectionId !== 'none' ? Number(collectionId) : undefined,
        gender,
        variant: {
          sku,
          price: Number(price),
          salePrice: salePrice ? Number(salePrice) : undefined,
          size: size || undefined,
          colorId: colorId || undefined,
          stock: stock ? Number(stock) : 0,
        },
        images,
      });

      return res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  async addVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id);
      const { sku, price, salePrice, size, colorId, stock } = req.body;

      const variant = await productService.addVariant(productId, {
        sku,
        price: Number(price),
        salePrice: salePrice ? Number(salePrice) : undefined,
        size: size || undefined,
        colorId: colorId ? Number(colorId) : undefined,
        stock: Number(stock),
      });

      return res.status(201).json(variant);
    } catch (err) {
      next(err);
    }
  }

  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({
          message: `Invalid product ID: ${req.params.id}`,
        });
      }
      console.log('id:', id, typeof id);
      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      return res.json(product);
    } catch (err) {
      next(err);
    }
  }

  async getProductBySlug(req: Request<{ slug: string }>, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const product = await productService.getProductBySlug(slug);
      return res.json(product);
    } catch (err) {
      next(err);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { name, description, collectionId, gender } = req.body;

      const product = await productService.updateProduct(id, {
        name,
        description,
        collectionId: collectionId ? Number(collectionId) : null,
        gender,
      });

      return res.json(product);
    } catch (err) {
      next(err);
    }
  }

  async updateVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const variantId = Number(req.params.variantId);
      const { sku, price, salePrice, size, colorId, stock } = req.body;

      const data: {
        sku?: string;
        price?: number;
        salePrice?: number | null;
        size?: string | null;
        colorId?: number | null;
        stock?: number;
      } = {};

      if (sku !== undefined) data.sku = sku;
      if (price !== undefined) data.price = Number(price);
      if (salePrice !== undefined) data.salePrice = salePrice ? Number(salePrice) : null;
      if (size !== undefined) data.size = size || null;
      if (colorId !== undefined) data.colorId = colorId || null;
      if (stock !== undefined) data.stock = Number(stock);

      const variant = await productService.updateVariant(variantId, data);
      return res.json(variant);
    } catch (err) {
      next(err);
    }
  }

  async deleteVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const variantId = Number(req.params.variantId);
      await productService.deleteVariant(variantId);
      return res.json({ message: 'Variant deleted' });
    } catch (err) {
      next(err);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await productService.deleteProduct(id);
      return res.json({ message: 'Product deleted' });
    } catch (err) {
      next(err);
    }
  }

  async assignImagesToVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const variantId = Number(req.params.variantId);
      const { imageIds } = req.body; // массив id изображений продукта

      const variant = await productService.assignImagesToVariant(variantId, imageIds);
      return res.json(variant);
    } catch (err) {
      next(err);
    }
  }

  async deleteProductImage(req: Request, res: Response, next: NextFunction) {
    try {
      await productService.deleteProductImage(Number(req.params.imageId));
      return res.json({ message: 'Image deleted' });
    } catch (err) {
      next(err);
    }
  }

  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const imageId = Number(req.params.imageId);
      await productService.deleteImage(imageId);
      return res.json({ message: 'Image deleted' });
    } catch (err) {
      next(err);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, collection, category, gender, size, color, page, limit, minPrice, maxPrice } =
        req.query;
      const products = await productService.getProducts({
        search: search as string | undefined,
        collection: collection as string | undefined,
        category: category as string | undefined,
        gender: gender as string | undefined,
        size: size as string | undefined,
        color: color as string | undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
      return res.json(products);
    } catch (err) {
      next(err);
    }
  }

  async addProductImages(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = Number(req.params.id);
      const files = req.files as Express.Multer.File[];
      if (!files.length) throw ApiError.BadRequest('At least one image is required');

      const images = files.map((file, i) => ({
        buffer: file.buffer,
        isMain: i === 0,
      }));

      const product = await productService.addProductImages(productId, images);
      return res.json(product);
    } catch (err) {
      next(err);
    }
  }
}

export default new ProductController();
