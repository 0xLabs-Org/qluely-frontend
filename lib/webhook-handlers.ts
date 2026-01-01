// lib/webhook-handlers.ts
import { prisma } from './prisma';
import { sendEmail } from './email';
import { logInfo, logError } from './logger';
import { PaymentSucceededObjectSchema, SubscriptionObjectSchema, PaymentSucceededObject, SubscriptionObject } from './webhook-schemas';

function parseDateMaybe(value: any) {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isNaN(n)) {
    // if likely seconds epoch (less than 1e12), convert to ms
    return new Date(n < 1e12 ? n * 1000 : n);
  }
  return new Date(value);
}

function parseAmountToCents(amount: any) {
  if (amount == null) return 0;
  if (typeof amount === 'string') {
    const trimmed = amount.trim();
    if (trimmed.includes('.')) {
      const f = parseFloat(trimmed);
      if (Number.isFinite(f)) return Math.round(f * 100);
    }
    const n = Number(trimmed);
    if (!Number.isNaN(n)) return Math.round(n);
    return 0;
  }
  if (typeof amount === 'number') {
    if (!Number.isInteger(amount)) return Math.round(amount * 100);
    if (Math.abs(amount) < 1000) return Math.round(amount * 100);
    return Math.round(amount);
  }
  const n = Number(amount);
  return Number.isNaN(n) ? 0 : Math.round(n);
}

export const webhookHandlers: Record<string, (payload: any) => Promise<any>> = {
  'payment.succeeded': handlePaymentSucceeded,
  'subscription.active': handleSubscriptionActive,
  'subscription.renewed': handleSubscriptionRenewed,
  'subscription.on_hold': handleSubscriptionOnHold,
  'subscription.cancelled': handleSubscriptionCancelled
};

export async function handlePaymentSucceeded(payload: any) {
  // validate payload shape
  const parsed = PaymentSucceededObjectSchema.parse(payload) as PaymentSucceededObject;
  const { id, amount, currency, metadata, customer_id, subscription_id } = parsed;
  const amountCents = parseAmountToCents(amount);
  if (Number.isNaN(amountCents) || amountCents < 0) {
    throw new Error(`Invalid payment amount: ${amount}`);
  }

  try {
    // Prefer metadata.app_user_id, fallback to mapping via customer id if present
    let userId = metadata?.app_user_id;
    if (!userId && customer_id) {
      const acct = await prisma.account.findUnique({ where: { customerId: customer_id } });
      userId = acct?.userId;
    }
    if (!userId) throw new Error('Missing app_user_id in metadata and no matching account found');

    // Ensure account exists for the user (userId is unique on Account)
    const account = await prisma.account.upsert({
      where: { userId },
      create: {
        userId,
        customerId: customer_id || undefined,
        planSlug: metadata?.plan_slug || undefined
      },
      update: {
        customerId: customer_id || undefined,
        planSlug: metadata?.plan_slug || undefined
      }
    });

    // Create or update payment (idempotent by externalId)
    const payment = await prisma.payment.upsert({
      where: { externalId: id },
      create: {
        userId,
        accountId: account.id,
        externalId: id,
        amount: amountCents,
        status: 'succeeded',
        processedAt: new Date()
      },
      update: {
        status: 'succeeded',
        amount: amountCents,
        processedAt: new Date()
      }
    });

    // If subscription payment, attach subscription id to account
    if (subscription_id) {
      await prisma.account.update({
        where: { id: account.id },
        data: {
          subscriptionId: subscription_id,
          planSlug: metadata?.plan_slug || account.planSlug
        }
      });
    }

    // Send email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email) {
      await sendEmail({
        to: user.email,
        template: 'payment_succeeded',
        data: { amount: (amountCents / 100).toFixed(2) }
      });
    }

    logInfo('Payment succeeded:', id);
    return { success: true };

  } catch (error) {
    logError('Error in handlePaymentSucceeded:', error);
    throw error;
  }
}

export async function handleSubscriptionActive(payload: any) {
  const parsed = SubscriptionObjectSchema.parse(payload) as SubscriptionObject;
  const { id, current_period_start, current_period_end } = parsed;

  try {
    const account = await prisma.account.findUnique({ where: { subscriptionId: id } });

    if (!account) throw new Error(`Subscription (account) not found for id: ${id}`);

    await prisma.account.update({
      where: { id: account.id },
      data: {
        status: 'active',
        startedAt: parseDateMaybe(current_period_start) || undefined,
        nextBillingDate: parseDateMaybe(current_period_end) || undefined
      }
    });

    // Send email
    const user = await prisma.user.findUnique({ where: { id: account.userId } });
    if (user?.email) {
      await sendEmail({
        to: user.email,
        template: 'subscription_activated',
        data: { plan: account.planSlug }
      });
    }

    logInfo('Subscription (account) activated:', id);
    return { success: true };

  } catch (error) {
    logError('Error in handleSubscriptionActive:', error);
    throw error;
  }
}

export async function handleSubscriptionRenewed(payload: any) {
  const parsed = SubscriptionObjectSchema.parse(payload) as SubscriptionObject;
  const { id, current_period_start, current_period_end, amount } = parsed;

  try {
    const account = await prisma.account.findUnique({ where: { subscriptionId: id } });
    if (!account) throw new Error(`Subscription (account) not found for id: ${id}`);

    await prisma.account.update({
      where: { id: account.id },
      data: {
        nextBillingDate: parseDateMaybe(current_period_end) || undefined
      }
    });

    // Create invoice (schema uses totalAmount in cents)
    const totalAmount = parseAmountToCents(amount);
    await prisma.invoice.create({
      data: {
        userId: account.userId,
        accountId: account.id,
        invoiceNumber: `INV-${Date.now()}`,
        totalAmount: totalAmount || 0,
        status: 'paid',
        paidAt: new Date()
      }
    });

    logInfo('Subscription (account) renewed:', id);
    return { success: true };

  } catch (error) {
    logError('Error in handleSubscriptionRenewed:', error);
    throw error;
  }
}

export async function handleSubscriptionOnHold(payload: any) {
  const parsed = SubscriptionObjectSchema.parse(payload) as SubscriptionObject;
  const { id } = parsed;

  try {
    const account = await prisma.account.findUnique({ where: { subscriptionId: id } });
    if (!account) throw new Error(`Subscription (account) not found for id: ${id}`);

    await prisma.account.update({ where: { id: account.id }, data: { status: 'on_hold' } });

    logInfo('Subscription (account) on hold:', id);
    return { success: true };

  } catch (error) {
    logError('Error in handleSubscriptionOnHold:', error);
    throw error;
  }
}

export async function handleSubscriptionCancelled(payload: any) {
  const parsed = SubscriptionObjectSchema.parse(payload) as SubscriptionObject;
  const { id } = parsed;

  try {
    const account = await prisma.account.findUnique({ where: { subscriptionId: id } });
    if (!account) throw new Error(`Subscription (account) not found for id: ${id}`);

    await prisma.account.update({
      where: { id: account.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        planSlug: null,
        type: 'FREE'
      }
    });

    logInfo('Subscription (account) cancelled:', id);
    return { success: true };

  } catch (error) {
    logError('Error in handleSubscriptionCancelled:', error);
    throw error;
  }
}