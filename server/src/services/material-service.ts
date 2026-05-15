import { prisma } from '../config/db.js';
import { ApiError } from '../middlewares/error-middleware.js';

interface MaterialInput {
  name: string;
  percentage: number;
}

class MaterialService {
  async getMaterials(productId: number) {
    return prisma.material.findMany({
      where: { productId },
      orderBy: { percentage: 'desc' },
    });
  }

  async upsertMaterials(productId: number, materials: MaterialInput[]) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.BadRequest('Product not found');

    const total = materials.reduce((sum, m) => sum + m.percentage, 0);
    if (total !== 100) throw ApiError.BadRequest('Materials must total 100%');

    await prisma.material.deleteMany({ where: { productId } });

    return prisma.material.createMany({
      data: materials.map((m) => ({
        productId,
        name: m.name,
        percentage: m.percentage,
      })),
    });
  }
}

export default new MaterialService();
