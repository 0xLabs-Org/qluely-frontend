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
