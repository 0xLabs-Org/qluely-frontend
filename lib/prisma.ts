import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';

// Force Prisma to use the N-API engine to avoid loading the WebAssembly
// query compiler which can fail in some Next.js dev/bundled environments.
process.env.PRISMA_FORCE_NAPI = 'true';

// Preserve TypeScript typings while using `require()` to ensure the
// env var above takes effect before the client module loads.
import type { PrismaClient as PrismaClientType } from '@prisma/client';
type PrismaClientConstructor = new (...args: any[]) => PrismaClientType;
const { PrismaClient } = require('@prisma/client') as { PrismaClient: PrismaClientConstructor };

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma: PrismaClientType = new PrismaClient({ adapter } as any);

export { prisma };
