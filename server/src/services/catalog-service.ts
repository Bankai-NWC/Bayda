import { prisma } from '../config/db.js';
import { ApiError } from '../middlewares/error-middleware.js';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

class CatalogService {
  async getCollections() {
    return prisma.collection.findMany({ orderBy: { name: 'asc' } });
  }

  async createCollection(name: string) {
    const slug = slugify(name);
    const existing = await prisma.collection.findUnique({ where: { slug } });
    if (existing) throw ApiError.BadRequest('Collection already exists');

    return prisma.collection.create({ data: { name, slug } });
  }

  async deleteCollection(id: number) {
    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection) throw ApiError.BadRequest('Collection not found');
    return prisma.collection.delete({ where: { id } });
  }

  async getCategories() {
    return prisma.category.findMany({ orderBy: { name: 'asc' }, include: { sizes: true } });
  }

  async createCategory(name: string) {
    const slug = slugify(name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw ApiError.BadRequest('Category already exists');

    return prisma.category.create({ data: { name, slug } });
  }

  async deleteCategory(id: number) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw ApiError.BadRequest('Category not found');
    return prisma.category.delete({ where: { id } });
  }

  async getCategoryWithSizes(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { sizes: { orderBy: { size: 'asc' } } },
    });
    if (!category) throw ApiError.BadRequest('Category not found');
    return category;
  }

  async setCategorySizes(categoryId: number, sizes: string[]) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw ApiError.BadRequest('Category not found');

    await prisma.categorySize.deleteMany({ where: { categoryId } });

    await prisma.categorySize.createMany({
      data: sizes.map((size) => ({ categoryId, size: size.toUpperCase() })),
    });

    return prisma.category.findUnique({
      where: { id: categoryId },
      include: { sizes: true },
    });
  }
}

export default new CatalogService();
