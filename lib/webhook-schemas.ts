import { z } from 'zod';

// Basic envelope that StandardWebhooks delivers
export const WebhookEnvelopeSchema = z.object({
  id: z.string(),
  type: z.string(),
  // keep data strict to only include object property
  data: z.object({
    object: z.any()
  }).strict()
}).strict();

// payment.succeeded payload (object is the payment object)
export const PaymentSucceededObjectSchema = z
  .object({
    id: z.string(),
    amount: z.union([z.number(), z.string()]),
    currency: z.string().optional(),
    status: z.string().optional(),
    created_at: z.union([z.string(), z.number()]).optional(),
    metadata: z
      .object({
        app_user_id: z.string().optional(),
        plan_slug: z.string().optional(),
        product_id: z.string().optional()
      })
      .optional(),
    subscription_id: z.string().optional(),
    customer_id: z.string().optional()
  })
  .strict();

// subscription.* payloads (object is subscription)
export const SubscriptionObjectSchema = z
  .object({
    id: z.string(),
    status: z.string().optional(),
    current_period_start: z.union([z.number(), z.string()]).optional(),
    current_period_end: z.union([z.number(), z.string()]).optional(),
    amount: z.union([z.number(), z.string()]).optional(),
    customer_id: z.string().optional()
  })
  .strict();

export const EventSchemas: Record<string, z.ZodTypeAny> = {
  'payment.succeeded': PaymentSucceededObjectSchema,
  'subscription.active': SubscriptionObjectSchema,
  'subscription.renewed': SubscriptionObjectSchema,
  'subscription.on_hold': SubscriptionObjectSchema,
  'subscription.cancelled': SubscriptionObjectSchema
};

export type WebhookEnvelope = z.infer<typeof WebhookEnvelopeSchema>;
export type PaymentSucceededObject = z.infer<typeof PaymentSucceededObjectSchema>;
export type SubscriptionObject = z.infer<typeof SubscriptionObjectSchema>;
