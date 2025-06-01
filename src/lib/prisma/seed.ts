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
    email: 'yo@toolkits.gg',
    emailVerified: false,
  },
];

const userProfiles = [
  {
    displayName: 'Toolkit Admin',
    bio: 'Toolkit Admin bio here',
    avatarUrl: undefined,
  },
  {
    displayName: 'Toolkit User',
    bio: 'Toolkit User bio here',
    avatarUrl: undefined,
  },
];

const seed = async () => {
  const t0 = performance.now();
  console.log('DB Seed: Started ...');

  await prisma.user.deleteMany();

  const passwordHash = await hash('useruser!');

  const createdUsers = await prisma.user.createManyAndReturn({
    data: users.map((user) => ({
      ...user,
      passwordHash,
    })),
  });

  await prisma.userProfile.createMany({
    data: userProfiles.map((profile, index) => ({
      ...profile,
      userId: createdUsers[index].id,
    })),
  });

  const t1 = performance.now();
  console.log(`DB Seed: Finished (${t1 - t0}ms)`);
};

seed();
