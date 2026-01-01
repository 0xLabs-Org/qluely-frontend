// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Validate important envs at startup (warn in dev, throw in prod)
if (env.NODE_ENV === 'production' && !env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be provided in production');
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prismaOptions: ConstructorParameters<typeof PrismaClient>[0] = {
  log: ['error', 'warn']
};

if (env.DATABASE_URL) {
  // Provide runtime datasource URL when present (Prisma 7+ requires moving URLs out of schema)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - allow passing runtime datasource override
  prismaOptions.datasources = { db: { url: env.DATABASE_URL } };
}

export const prisma = globalForPrisma.prisma || new PrismaClient(prismaOptions as any);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;