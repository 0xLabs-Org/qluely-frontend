// lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { ensureEnvPresent } from './env';

// Validate important envs at startup (warn in dev, throw in prod)
try {
  ensureEnvPresent([
    // DATABASE_URL may be optional in local dev if you use sqlite; keep it recommended
    'DATABASE_URL'
  ]);
} catch (err) {
  // Re-throw in production
  if (process.env.NODE_ENV === 'production') throw err;
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn']
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;