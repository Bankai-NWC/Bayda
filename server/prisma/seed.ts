// import { prisma } from '../src/config/db.js';
// import {
//   adminData,
//   categoriesData,
//   collectionsData,
//   colorsData,
//   productsData,
//   userData,
// } from './seed-data.js';

// function shuffle<T>(array: T[]): T[] {
//   const arr = [...array];
//   for (let i = arr.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     const temp = arr[i] as T;
//     arr[i] = arr[j] as T;
//     arr[j] = temp;
//   }
//   return arr;
// }

// async function main() {
//   console.log('Starting data import...');

//   const shuffledProducts = shuffle(productsData);

//   await prisma.product.deleteMany({});
//   await prisma.category.deleteMany({});
//   await prisma.collection.deleteMany({});
//   await prisma.color.deleteMany({});

//   await prisma.user.upsert({
//     where: { email: adminData.email },
//     update: {},
//     create: adminData,
//   });
//   await prisma.user.upsert({
//     where: { email: userData.email },
//     update: {},
//     create: userData,
//   });
//   console.log('Admin verified/created.');

//   const colorMap: Record<string, number> = {};
//   for (const color of colorsData) {
//     const created = await prisma.color.upsert({
//       where: { name: color.name },
//       update: {},
//       create: color,
//     });
//     colorMap[color.name] = created.id;
//   }
//   console.log('Colors loaded.');

//   const collectionMap: Record<string, number> = {};
//   for (const col of collectionsData) {
//     const created = await prisma.collection.upsert({
//       where: { slug: col.slug },
//       update: {},
//       create: col,
//     });
//     collectionMap[col.slug] = created.id;
//   }
//   console.log('Collections loaded.');

//   const categoryMap: Record<string, number> = {};
//   for (const cat of categoriesData) {
//     const created = await prisma.category.upsert({
//       where: { slug: cat.slug },
//       update: {},
//       create: {
//         name: cat.name,
//         slug: cat.slug,
//         sizes: {
//           create: cat.sizes.map((s) => ({ size: s })),
//         },
//       },
//     });
//     categoryMap[cat.slug] = created.id;
//   }
//   console.log('Categories created.');

//   for (const p of shuffledProducts) {
//     const categoryId = categoryMap[p.categorySlug];
//     const collectionId = p.collectionSlug ? collectionMap[p.collectionSlug] : null;

//     if (!categoryId) {
//       console.error(`Missing item "${p.name}": category "${p.categorySlug}" not found.`);
//       continue;
//     }

//     const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
//     if (existing) {
//       console.log(`Product already exists, skipping: ${p.name}`);
//       continue;
//     }

//     const createdProduct = await prisma.product.create({
//       data: {
//         name: p.name,
//         slug: p.slug,
//         description: p.description,
//         gender: p.gender,
//         categoryId,
//         collectionId,

//         images: {
//           create: p.images,
//         },

//         materials: {
//           create: p.materials,
//         },

//         sizeChart: {
//           create: {
//             entries: {
//               create: p.sizeChartEntries.map((entry) => ({
//                 size: entry.size,
//                 measurements: {
//                   create: entry.measurements,
//                 },
//               })),
//             },
//           },
//         },
//       },
//       include: { images: true },
//     });

//     for (const v of p.variants) {
//       const variant = await prisma.productVariant.create({
//         data: {
//           productId: createdProduct.id,
//           size: v.size,
//           price: v.price,
//           salePrice: v.salePrice ?? null,
//           sku: v.sku,
//           stock: v.stock,
//           colorId: colorMap[v.colorName] ?? null,
//         },
//       });

//       if (v.imageIndexes && v.imageIndexes.length > 0) {
//         await prisma.variantImage.createMany({
//           data: v.imageIndexes.flatMap((imgIndex, order) => {
//             const image = createdProduct.images[imgIndex];
//             if (!image) {
//               console.warn(`imageIndex ${imgIndex} not found for variant ${v.sku}`);
//               return [];
//             }
//             return [{ variantId: variant.id, imageId: image.id, order }];
//           }),
//         });
//       }
//     }

//     console.log(`Product added: ${p.name}`);
//   }

//   console.log('✅ All data imported successfully!');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Error seeding data:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

import { OrderStatus } from '@prisma/client';

import { prisma } from '../src/config/db.js';
import { ordersSeedConfig, shippingAddresses } from './seed-data.js';
import {
  adminData,
  categoriesData,
  collectionsData,
  colorsData,
  productsData,
  userData,
} from './seed-data.js';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i] as T;
    arr[i] = arr[j] as T;
    arr[j] = temp;
  }
  return arr;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function randomDateWithinDays(days: number): Date {
  const now = Date.now();
  const from = now - days * 24 * 60 * 60 * 1000;
  return new Date(from + Math.random() * (now - from));
}

async function main() {
  console.log('Starting data import...');

  const shuffledProducts = shuffle(productsData);

  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.collection.deleteMany({});
  await prisma.color.deleteMany({});

  // ── 1. Users/Admins ───────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: adminData.email },
    update: {},
    create: adminData,
  });

  const user = await prisma.user.upsert({
    where: { email: userData.email },
    update: {},
    create: userData,
  });

  console.log('Users verified/created.');

  // ── 2. Colors ─────────────────────────────────────────────
  const colorMap: Record<string, number> = {};
  for (const color of colorsData) {
    const created = await prisma.color.upsert({
      where: { name: color.name },
      update: {},
      create: color,
    });
    colorMap[color.name] = created.id;
  }
  console.log('Colors loaded.');

  // ── 3. Collections ─────────────────────────────────────────
  const collectionMap: Record<string, number> = {};
  for (const col of collectionsData) {
    const created = await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {},
      create: col,
    });
    collectionMap[col.slug] = created.id;
  }
  console.log('Collections loaded.');

  // ── 4. Categories ─────────────────────────────────────────
  const categoryMap: Record<string, number> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        sizes: { create: cat.sizes.map((s) => ({ size: s })) },
      },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log('Categories created.');

  // ── 5. Products/Variants ───────────────────────────────
  const createdVariantIds: number[] = [];

  for (const p of shuffledProducts) {
    const categoryId = categoryMap[p.categorySlug];
    const collectionId = p.collectionSlug ? collectionMap[p.collectionSlug] : null;

    if (!categoryId) {
      console.error(`Missing item "${p.name}": category "${p.categorySlug}" not found.`);
      continue;
    }

    const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`Product already exists, skipping: ${p.name}`);
      continue;
    }

    const createdProduct = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        gender: p.gender,
        categoryId,
        collectionId,
        images: { create: p.images },
        materials: { create: p.materials },
        sizeChart: {
          create: {
            entries: {
              create: p.sizeChartEntries.map((entry) => ({
                size: entry.size,
                measurements: { create: entry.measurements },
              })),
            },
          },
        },
      },
      include: { images: true },
    });

    for (const v of p.variants) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: createdProduct.id,
          size: v.size,
          price: v.price,
          salePrice: v.salePrice ?? null,
          sku: v.sku,
          stock: v.stock,
          colorId: colorMap[v.colorName] ?? null,
        },
      });

      createdVariantIds.push(variant.id);

      if (v.imageIndexes && v.imageIndexes.length > 0) {
        await prisma.variantImage.createMany({
          data: v.imageIndexes.flatMap((imgIndex, order) => {
            const image = createdProduct.images[imgIndex];
            if (!image) {
              console.warn(`imageIndex ${imgIndex} not found for variant ${v.sku}`);
              return [];
            }
            return [{ variantId: variant.id, imageId: image.id, order }];
          }),
        });
      }
    }

    console.log(`Product added: ${p.name}`);
  }

  // ── 6. Orders ────────────────────────────────────────────
  if (createdVariantIds.length === 0) {
    console.log('No variants found, skipping orders.');
  } else {
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: createdVariantIds } },
      select: { id: true, price: true, salePrice: true },
    });

    let ordersCreated = 0;

    for (const [status, count] of Object.entries(ordersSeedConfig) as [OrderStatus, number][]) {
      for (let i = 0; i < count; i++) {
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const pickedVariants = shuffle(variants).slice(0, itemCount);
        const address = pick(shippingAddresses);

        const items = pickedVariants.map((v) => ({
          variantId: v.id,
          quantity: Math.floor(Math.random() * 2) + 1,
          priceAtPurchase: Number(v.salePrice ?? v.price),
        }));

        const totalAmount = items.reduce(
          (sum, item) => sum + item.priceAtPurchase * item.quantity,
          0,
        );

        // DELIVERED - up to 90 days ago, others - up to 30 days ago
        const daysBack = status === OrderStatus.DELIVERED ? 90 : 30;
        const createdAt = randomDateWithinDays(daysBack);

        await prisma.order.create({
          data: {
            userId: user.id,
            shippingCity: address.city,
            shippingStreet: address.street,
            shippingHouseNumber: address.houseNumber,
            shippingApartment: address.apartment,
            totalAmount,
            status,
            createdAt,
            items: { create: items },
          },
        });

        ordersCreated++;
      }
    }

    console.log(`Orders created: ${ordersCreated}`);
  }

  console.log('✅ All data imported successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
