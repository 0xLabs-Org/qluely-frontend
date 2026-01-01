// lib/logger.ts
export function logInfo(message: string, data?: any) {
  const out = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message,
    data: data ?? null
  };
  try {
    console.log(JSON.stringify(out));
  } catch (err) {
    console.log(out);
  }
}

export function logError(message: string, error?: any) {
  const out = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message,
    error: error instanceof Error ? { message: error.message, stack: error.stack } : error
  };
  try {
    console.error(JSON.stringify(out));
  } catch (err) {
    console.error(out);
  }
}