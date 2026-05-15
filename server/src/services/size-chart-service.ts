import { prisma } from '../config/db.js';
import { ApiError } from '../middlewares/error-middleware.js';

interface MeasurementInput {
  name: string;
  value: number;
  unit?: string;
}

interface SizeEntryInput {
  size: string;
  measurements: MeasurementInput[];
}

class SizeChartService {
  async getSizeChart(productId: number) {
    return prisma.sizeChart.findUnique({
      where: { productId },
      include: {
        entries: {
          include: { measurements: true },
          orderBy: { size: 'asc' },
        },
      },
    });
  }

  async upsertSizeChart(productId: number, entries: SizeEntryInput[]) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.BadRequest('Product not found');

    await prisma.sizeChart.deleteMany({ where: { productId } });

    return prisma.sizeChart.create({
      data: {
        productId,
        entries: {
          create: entries.map((entry) => ({
            size: entry.size,
            measurements: {
              create: entry.measurements.map((m) => ({
                name: m.name,
                value: m.value,
                unit: m.unit ?? 'cm',
              })),
            },
          })),
        },
      },
      include: {
        entries: {
          include: { measurements: true },
        },
      },
    });
  }

  async deleteSizeChart(productId: number) {
    return prisma.sizeChart.deleteMany({ where: { productId } });
  }
}

export default new SizeChartService();
