import { prisma } from '../config/db.js';
import { ApiError } from '../middlewares/error-middleware.js';

export class ColorService {
  async createColor(name: string, hexCode: string) {
    const existingColor = await prisma.color.findUnique({
      where: { name },
    });
    if (existingColor) {
      throw new ApiError(400, 'Color with this name already exists');
    }

    const color = await prisma.color.create({
      data: { name, hexCode },
    });
    return color;
  }

  async getColors() {
    const colors = await prisma.color.findMany({
      orderBy: {
        name: 'asc',
      },
    });
    return colors;
  }

  async getColorById(id: number) {
    const color = await prisma.color.findUnique({
      where: { id },
    });
    if (!color) {
      throw new ApiError(404, 'Color not found');
    }
    return color;
  }

  async getColorsPaginated(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.color.findMany({
        skip: skip,
        take: limit,
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.color.count(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateColor(id: number, name: string, hexCode: string) {
    const existingColor = await prisma.color.findUnique({
      where: { id },
    });
    if (!existingColor) {
      throw new ApiError(404, 'Color not found');
    }

    const updatedColor = await prisma.color.update({
      where: { id },
      data: { name, hexCode },
    });
    return updatedColor;
  }

  async deleteColor(id: number) {
    const existingColor = await prisma.color.findUnique({
      where: { id },
    });
    if (!existingColor) {
      throw new ApiError(404, 'Color not found');
    }

    await prisma.color.delete({
      where: { id },
    });
  }
}

export default new ColorService();
