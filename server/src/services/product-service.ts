import slugify from '@sindresorhus/slugify';

import { prisma } from '../config/db.js';
import { ApiError } from '../middlewares/error-middleware.js';
import type { CreateProductInput, VariantInput } from '../types/product.js';
import uploadService from './upload-service.js';

class ProductService {
  async createProduct(input: CreateProductInput) {
    const { name, description, categoryId, collectionId, variant, images, gender } = input;
    const slug = slugify(name, { lowercase: true });

    const [existingSlug, existingSku] = await Promise.all([
      prisma.product.findUnique({ where: { slug } }),
      prisma.productVariant.findUnique({ where: { sku: variant.sku } }),
    ]);

    if (existingSlug) throw ApiError.BadRequest('Product with this name already exists');
    if (existingSku) throw ApiError.BadRequest('SKU already in use');

    if (categoryId && variant.size) {
      const allowedSize = await prisma.categorySize.findFirst({
        where: { categoryId, size: variant.size },
      });
      if (!allowedSize) {
        throw ApiError.BadRequest(`Size ${variant.size} is not allowed for this category`);
      }
    }

    const uploadedImages = await Promise.all(
      images.map((img) => uploadService.uploadImage(img.buffer)),
    );

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description ?? null,
        category: { connect: { id: categoryId } },
        ...(collectionId && { collection: { connect: { id: collectionId } } }),
        gender: gender ?? 'UNISEX',
        images: {
          create: uploadedImages.map((uploaded, i) => ({
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            isMain: i === 0,
            order: i,
          })),
        },
        variants: {
          create: {
            sku: variant.sku,
            price: variant.price,
            salePrice: variant.salePrice ?? null,
            size: variant.size ?? null,
            ...(variant.colorId && { color: { connect: { id: Number(variant.colorId) } } }),
            stock: variant.stock ?? 0,
          },
        },
      },
      include: {
        category: true,
        collection: true,
        images: true,
        variants: { include: { images: { include: { image: true } } } },
      },
    });

    return product;
  }

  async addVariant(productId: number, variant: VariantInput) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.BadRequest('Product not found');

    const existingSku = await prisma.productVariant.findUnique({ where: { sku: variant.sku } });
    if (existingSku) throw ApiError.BadRequest('SKU already in use');

    return prisma.productVariant.create({
      data: {
        productId,
        sku: variant.sku,
        price: variant.price,
        salePrice: variant.salePrice ?? null,
        size: variant.size ?? null,
        colorId: variant.colorId ?? null,
        stock: variant.stock ?? 0,
      },
      include: { images: { include: { image: true } } },
    });
  }

  async getProductById(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { include: { sizes: true } },
        collection: true,
        images: { orderBy: { order: 'asc' } },
        variants: {
          include: {
            color: true,
            images: { include: { image: true }, orderBy: { order: 'asc' } },
          },
        },
      },
    });

    if (!product) throw ApiError.BadRequest('Product not found');
    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { include: { sizes: true } },
        collection: true,
        images: { orderBy: { order: 'asc' } },
        variants: {
          include: {
            color: true,
            images: { include: { image: true }, orderBy: { order: 'asc' } },
          },
        },
        sizeChart: { include: { entries: { include: { measurements: true } } } },
        materials: true,
      },
    });

    if (!product) throw ApiError.NotFound('Product not found');
    return product;
  }

  async updateProduct(
    id: number,
    data: {
      name?: string;
      description?: string;
      gender?: string;
      collectionId?: number | null;
    },
  ) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw ApiError.BadRequest('Product not found');

    const updateData: any = {};

    if (data.name) {
      updateData.name = data.name;
      updateData.slug = slugify(data.name);

      const existingSlug = await prisma.product.findFirst({
        where: { slug: updateData.slug, NOT: { id } },
      });
      if (existingSlug) throw ApiError.BadRequest('Product with this name already exists');
    }

    if (data.description !== undefined) updateData.description = data.description ?? null;
    if (data.collectionId !== undefined) updateData.collectionId = data.collectionId;
    if (data.gender !== undefined) updateData.gender = data.gender;

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        collection: true,
        images: { orderBy: { order: 'asc' } },
        variants: { include: { images: { include: { image: true } } } },
      },
    });
  }

  async updateVariant(
    variantId: number,
    data: {
      sku?: string;
      price?: number;
      salePrice?: number | null;
      size?: string | null;
      colorId?: number | null;
      stock?: number;
    },
  ) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw ApiError.BadRequest('Variant not found');

    if (data.sku && data.sku !== variant.sku) {
      const existingSku = await prisma.productVariant.findUnique({ where: { sku: data.sku } });
      if (existingSku) throw ApiError.BadRequest('SKU already in use');
    }

    return prisma.productVariant.update({
      where: { id: variantId },
      data,
      include: { color: true, images: { include: { image: true } } },
    });
  }

  async deleteVariant(variantId: number) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw ApiError.BadRequest('Variant not found');
    return prisma.productVariant.delete({ where: { id: variantId } });
  }

  async deleteProduct(id: number) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!product) throw ApiError.BadRequest('Product not found');

    await Promise.all(product.images.map((img) => uploadService.deleteImage(img.publicId)));
    return prisma.product.delete({ where: { id } });
  }

  async deleteImage(imageId: number) {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw ApiError.BadRequest('Image not found');
    if (!image.publicId) throw ApiError.BadRequest('Invalid image URL');

    await uploadService.deleteImage(image.publicId);
    return prisma.productImage.delete({ where: { id: imageId } });
  }

  async getProducts(filters?: {
    search?: string;
    category?: string;
    collection?: string;
    gender?: string;
    size?: string;
    color?: string;
    page?: number;
    limit?: number;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const skip = (page - 1) * limit;

    const priceConditions: any[] = [];
    if (filters?.minPrice !== undefined) {
      priceConditions.push({
        OR: [
          { salePrice: { gte: filters.minPrice } },
          { AND: [{ salePrice: null }, { price: { gte: filters.minPrice } }] },
        ],
      });
    }
    if (filters?.maxPrice !== undefined) {
      priceConditions.push({
        OR: [
          { salePrice: { lte: filters.maxPrice } },
          { AND: [{ salePrice: null }, { price: { lte: filters.maxPrice } }] },
        ],
      });
    }

    const filter = {
      ...(filters?.search
        ? { name: { contains: filters.search, mode: 'insensitive' as const } }
        : {}),
      ...(filters?.category ? { category: { slug: filters.category } } : {}),
      ...(filters?.collection ? { collection: { slug: filters.collection } } : {}),
      ...(filters?.gender
        ? {
            gender: {
              in:
                filters.gender === 'MAN' || filters.gender === 'WOMAN'
                  ? [filters.gender, 'UNISEX']
                  : [filters.gender],
            } as any,
          }
        : {}),
      ...(filters?.size || filters?.color || priceConditions.length > 0
        ? {
            variants: {
              some: {
                AND: [
                  ...(filters?.size ? [{ size: filters.size }] : []),
                  ...(filters?.color ? [{ color: { name: filters.color } }] : []),
                  ...priceConditions,
                ],
              },
            },
          }
        : {}),
    };

    const priceLimitsFilter = {
      ...(filters?.category ? { category: { slug: filters.category } } : {}),
      ...(filters?.collection ? { collection: { slug: filters.collection } } : {}),
      ...(filters?.gender
        ? {
            gender: {
              in:
                filters.gender === 'MAN' || filters.gender === 'WOMAN'
                  ? [filters.gender, 'UNISEX']
                  : [filters.gender],
            } as any,
          }
        : {}),
    };

    const [items, total, priceAggregate] = await Promise.all([
      prisma.product.findMany({
        where: filter,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          collection: true,
          images: { where: { isMain: true }, take: 1 },
          variants: {
            select: {
              id: true,
              price: true,
              salePrice: true,
              stock: true,
              size: true,
              color: { select: { id: true, name: true, hexCode: true } },
              images: {
                select: { imageId: true, order: true, image: { select: { url: true } } },
                take: 1,
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      }),
      prisma.product.count({ where: filter }),
      prisma.productVariant.aggregate({
        where: {
          product: priceLimitsFilter,
        },
        _min: { price: true, salePrice: true },
        _max: { price: true, salePrice: true },
      }),
    ]);

    const globalMin = Math.floor(
      Math.min(
        Number(priceAggregate._min.price ?? 0),
        Number(priceAggregate._min.salePrice ?? priceAggregate._min.price ?? 0),
      ),
    );

    const globalMax = Math.ceil(
      Math.max(
        Number(priceAggregate._max.price ?? 9999),
        Number(priceAggregate._max.salePrice ?? priceAggregate._max.price ?? 9999),
      ),
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      minPriceLimit: globalMin,
      maxPriceLimit: globalMax,
    };
  }

  async addProductImages(productId: number, images: { buffer: Buffer }[]) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.BadRequest('Product not found');

    const uploadedImages = await Promise.all(
      images.map((img) => uploadService.uploadImage(img.buffer)),
    );

    const existingCount = await prisma.productImage.count({ where: { productId } });

    return prisma.product.update({
      where: { id: productId },
      data: {
        images: {
          create: uploadedImages.map((uploaded, i) => ({
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            isMain: existingCount === 0 && i === 0,
            order: existingCount + i,
          })),
        },
      },
      include: { images: { orderBy: { order: 'asc' } } },
    });
  }

  async deleteProductImage(imageId: number) {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) throw ApiError.BadRequest('Image not found');

    await uploadService.deleteImage(image.publicId);
    return prisma.productImage.delete({ where: { id: imageId } });
  }

  async assignImagesToVariant(variantId: number, imageIds: number[]) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) throw ApiError.BadRequest('Variant not found');

    const images = await prisma.productImage.findMany({
      where: { id: { in: imageIds }, productId: variant.productId },
    });
    if (images.length !== imageIds.length) {
      throw ApiError.BadRequest('Some images do not belong to this product');
    }

    await prisma.variantImage.deleteMany({ where: { variantId } });

    await prisma.variantImage.createMany({
      data: imageIds.map((imageId, i) => ({ variantId, imageId, order: i })),
    });

    return prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { images: { include: { image: true }, orderBy: { order: 'asc' } } },
    });
  }
}

export default new ProductService();
