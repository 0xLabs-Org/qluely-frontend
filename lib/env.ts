import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Auth
  AUTH_JWT_SECRET: z.string().optional(),

  // Dodo payments
  DODO_PAYMENTS_API_KEY: z.string().optional(),
  DODO_PAYMENTS_WEBHOOK_KEY: z.string().optional(),
  DODO_PAYMENTS_ENVIRONMENT: z.string().default('test_mode'),
  DODO_PAYMENTS_RETURN_URL: z.string().optional(),

  // Product ids
  DODO_PRODUCT_ID_STARTER: z.string().optional(),
  DODO_PRODUCT_ID_PRO: z.string().optional(),
  DODO_PRODUCT_ID_PREMIUM: z.string().optional(),
  DODO_PRODUCT_ID_ENTERPRISE: z.string().optional(),

  // Redis
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().optional(),

  // Database
  DATABASE_URL: z.string().optional(),

  // SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // General
  NEXT_PUBLIC_BASE_URL: z.string().optional()
});

// parse and validate
const _env = envSchema.parse(process.env);

// runtime checks for required secrets in production
if (_env.NODE_ENV === 'production') {
  if (!_env.AUTH_JWT_SECRET) {
    throw new Error('AUTH_JWT_SECRET must be set in production');
  }
  if (!_env.DODO_PAYMENTS_API_KEY) {
    throw new Error('DODO_PAYMENTS_API_KEY must be set in production');
  }
  if (!_env.DODO_PAYMENTS_WEBHOOK_KEY) {
    throw new Error('DODO_PAYMENTS_WEBHOOK_KEY must be set in production');
  }
}

/* exported env is defined lower as `_exportedEnv` to ensure consistent typing */
export type Env = {
  NODE_ENV: 'development' | 'production' | 'test';
  AUTH_JWT_SECRET?: string;
  DODO_PAYMENTS_API_KEY?: string;
  DODO_PAYMENTS_WEBHOOK_KEY?: string;
  DODO_PAYMENTS_ENVIRONMENT: string;
  DODO_PAYMENTS_RETURN_URL?: string;
  DODO_PRODUCT_ID_STARTER?: string;
  DODO_PRODUCT_ID_PRO?: string;
  DODO_PRODUCT_ID_PREMIUM?: string;
  DODO_PRODUCT_ID_ENTERPRISE?: string;
  REDIS_URL?: string;
  DATABASE_URL?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  SMTP_FROM?: string;
  NEXT_PUBLIC_BASE_URL?: string;
};

// Ensure exported `env` conforms to the `Env` type for reliable imports
export const _exportedEnv: Env = {
  NODE_ENV: _env.NODE_ENV,
  AUTH_JWT_SECRET: _env.AUTH_JWT_SECRET,
  DODO_PAYMENTS_API_KEY: _env.DODO_PAYMENTS_API_KEY,
  DODO_PAYMENTS_WEBHOOK_KEY: _env.DODO_PAYMENTS_WEBHOOK_KEY,
  DODO_PAYMENTS_ENVIRONMENT: _env.DODO_PAYMENTS_ENVIRONMENT,
  DODO_PAYMENTS_RETURN_URL: _env.DODO_PAYMENTS_RETURN_URL,
  DODO_PRODUCT_ID_STARTER: _env.DODO_PRODUCT_ID_STARTER,
  DODO_PRODUCT_ID_PRO: _env.DODO_PRODUCT_ID_PRO,
  DODO_PRODUCT_ID_PREMIUM: _env.DODO_PRODUCT_ID_PREMIUM,
  DODO_PRODUCT_ID_ENTERPRISE: _env.DODO_PRODUCT_ID_ENTERPRISE,
  REDIS_URL: _env.REDIS_URL || _env.REDIS_HOST,
  DATABASE_URL: _env.DATABASE_URL,
  SMTP_HOST: _env.SMTP_HOST,
  SMTP_PORT: _env.SMTP_PORT,
  SMTP_USER: _env.SMTP_USER,
  SMTP_PASS: _env.SMTP_PASS,
  SMTP_FROM: _env.SMTP_FROM,
  NEXT_PUBLIC_BASE_URL: _env.NEXT_PUBLIC_BASE_URL
};

export const env = _exportedEnv;
// lib/env.ts
export function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

export function getOptionalEnv(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

export function ensureEnvPresent(names: string[]) {
  const missing = names.filter((n) => !process.env[n]);
  if (missing.length) {
    const msg = `Missing required env vars: ${missing.join(', ')}`;
    // In non-production, warn; in production throw
    if (process.env.NODE_ENV === 'production') {
      throw new Error(msg);
    } else {
      console.warn(msg);
    }
  }
}
