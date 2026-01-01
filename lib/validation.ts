// lib/validation.ts
import { z } from 'zod';

const checkoutRequestSchema = z.object({
  plan: z.enum(['starter', 'pro', 'premium', 'enterprise']),
  // Accept any string for userId so local/dev testing with placeholders works.
  // In production, user IDs should be validated against your auth system.
  // Make `userId` optional: the server will obtain the authenticated user
  // from the session token, so clients don't need to send it.
  userId: z.string().optional()
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;

export type ValidateCheckoutResult =
  | { success: true; data: CheckoutRequest }
  | { success: false; error: string };

export function validateCheckoutRequest(data: unknown): ValidateCheckoutResult {
  try {
    const validated = checkoutRequestSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    // Include zod error messages in development to aid debugging.
    if (process.env.NODE_ENV !== 'production' && error && (error as any).errors) {
      return { success: false, error: JSON.stringify((error as any).errors) };
    }
    return { success: false, error: 'Invalid request' };
  }
}