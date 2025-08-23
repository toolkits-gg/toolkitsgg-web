import { hash } from '@node-rs/argon2';
import { PrismaClient } from '@prisma/client';
import { coe33Items } from '@/games/coe33/items/all-items';
import type { COE33ItemType } from '@/games/coe33/items/types';

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

  // Clear existing tables of data
  await prisma.user.deleteMany();
  await prisma.cOE33Item.deleteMany();

  // Password for the seeded user accounts
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

  // Create items for each gam

  await Promise.all([
    prisma.cOE33Item.createMany({
      data: (coe33Items as COE33ItemType[]).map((item) => ({
        slug: item.slug,
        name: item.name,
        description:
          typeof item.description === 'string'
            ? item.description
            : item.description.join(' '),
        imageUrl: item.imageUrl,
        category: item.category,
        internalSlug: item.internalSlug,
      })),
    }),
  ]);

  // Wrapping up
  const t1 = performance.now();
  console.log(`DB Seed: Finished (${t1 - t0}ms)`);
};

seed();
