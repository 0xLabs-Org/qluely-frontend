// lib/prisma.ts
// Set Prisma engine type to client for serverless databases
process.env.PRISMA_CLIENT_ENGINE_TYPE = "client";
console.log('PRISMA_CLIENT_ENGINE_TYPE set to:', process.env.PRISMA_CLIENT_ENGINE_TYPE);

import { env } from "./env";

// Validate important envs at startup (warn in dev, throw in prod)
if (env.NODE_ENV === "production" && !env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be provided in production");
}

const globalForPrisma = globalThis as unknown as { prisma: any };

const prismaOptions: ConstructorParameters<typeof PrismaClient>[0] = {
  log: ["error", "warn"],
};

if (env.DATABASE_URL) {
  // Provide runtime DATABASE_URL for Prisma to pick up at client construction.
  process.env.DATABASE_URL = env.DATABASE_URL;
}

// Load the PostgreSQL adapter for client engine
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaPg } = require('@prisma/adapter-pg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Pool } = require('pg');

const connectionString = env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

prismaOptions.adapter = adapter;

// Require PrismaClient after env vars are set
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require("@prisma/client");

export const prisma =
  globalForPrisma.prisma || new PrismaClient(prismaOptions as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
