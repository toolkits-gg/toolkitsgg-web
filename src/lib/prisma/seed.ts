import { hash } from '@node-rs/argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const users = [
  {
    username: 'admin',
    email: 'admin@toolkits.gg',
    emailVerified: true,
  },
  {
    username: 'tk',
    // use your own email here
    email: 'yo@toolkits.gg',
    emailVerified: false,
  },
];

const seed = async () => {
  const t0 = performance.now();
  console.log('DB Seed: Started ...');

  await prisma.user.deleteMany();

  const passwordHash = await hash('geheimnis');

  const dbUsers = await prisma.user.createManyAndReturn({
    data: users.map((user) => ({
      ...user,
      passwordHash,
    })),
  });

  const t1 = performance.now();
  console.log(`DB Seed: Finished (${t1 - t0}ms)`);
};

seed();
