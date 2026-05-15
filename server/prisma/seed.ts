import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { prisma } from '../src/config/db.js';

async function main() {
  console.log('Start filling the database...');

  await prisma.session.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.color.deleteMany();

  const passwordHash = await bcrypt.hash('Admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@bayda.com' },
    update: {},
    create: {
      email: 'admin@bayda.com',
      fullName: 'Heorhii Admin',
      passwordHash: passwordHash,
      phone: '380504519037',
      role: Role.ADMIN,
      activationLink: 'is-activated-account',
      isActivated: true,
    },
  });
  await prisma.color.create({
    data: {
      name: 'Red',
      hexCode: '#FF0000',
    },
  });

  console.log('[Success] The database has been successfully populated!');
}

main()
  .catch((e) => {
    console.error('[Error] Error occurred while populating the database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
