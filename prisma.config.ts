import path from 'node:path';

import dotenv from 'dotenv';
import { defineConfig, env } from 'prisma/config';

dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: path.join('prisma'),
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? env('DATABASE_URL'),
  },
});
