// app/api/webhooks/dodo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { prisma } from '@/lib/prisma';
import { getWebhookQueue } from '@/lib/queue';
import { logError, logInfo } from '@/lib/logger';

const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_KEY!);

export async function POST(request: NextRequest) {
  try {
    // 1. Get headers & body
    const rawPayload = await request.text();
    const headers = {
      'webhook-id': request.headers.get('webhook-id')!,
      'webhook-signature': request.headers.get('webhook-signature')!,
      'webhook-timestamp': request.headers.get('webhook-timestamp')!
    };

    // 2. Verify signature
    let payload: any;
    try {
      payload = webhook.verify(rawPayload, headers);
    } catch (error) {
      logError('Webhook signature verification failed:', error);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 3. Check for duplicate
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { dodoWebhookId: payload.id }
    });

    if (existingEvent) {
      logInfo('Webhook already processed:', payload.id);
      return NextResponse.json({ received: true });
    }

    // 4. Store webhook event
    const event = await prisma.webhookEvent.create({
      data: {
        dodoWebhookId: payload.id,
        eventType: payload.type,
        status: 'received',
        payload: payload.data.object || {}
      }
    });

    // 5. Queue for async processing
    const webhookQueue = getWebhookQueue();
    await webhookQueue.add(
      'process',
      {
        eventId: event.id,
        eventType: payload.type,
        payload: payload.data.object
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    );

    logInfo('Webhook queued for processing:', payload.id);

    return NextResponse.json({ received: true });

  } catch (error) {
    logError('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
}