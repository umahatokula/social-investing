import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const password = 'Password123';

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log(`User with email ${email} already exists.`);
    return;
  }

  const salt = await bcrypt.genSalt();
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: 'Test',
      lastName: 'User',
      alias: 'testuser',
      role: 'USER',
      status: 'ACTIVE',
    },
  });

  console.log(`Created user with id: ${user.id} and email: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
