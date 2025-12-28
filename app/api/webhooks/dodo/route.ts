// app/api/webhooks/dodo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { prisma } from '@/lib/prisma';
import { getWebhookQueue } from '@/lib/queue';
import { logError, logInfo } from '@/lib/logger';
import { checkRateLimit } from '@/lib/rateLimit';

const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_KEY!);

export async function POST(request: NextRequest) {
  try {
    // 1. Get headers & body
    const rawPayload = await request.text();
    const headerId = request.headers.get('webhook-id');
    const headerSig = request.headers.get('webhook-signature');
    const headerTs = request.headers.get('webhook-timestamp');

    const securityHeaders = {
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none';",
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer'
    };

    if (!headerId || !headerSig || !headerTs) {
      logError('Webhook missing required headers', { headerId, headerSigPresent: !!headerSig, headerTs });
      return NextResponse.json({ error: 'Missing webhook headers' }, { status: 400, headers: securityHeaders });
    }

    // rate limit webhooks per headerId to protect against replay storms
    const rl = checkRateLimit(`webhook:${headerId}`, 30, 60_000);
    if (rl.limited) {
      logError('Webhook rate limit exceeded', { headerId });
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: securityHeaders });
    }

    // 2. Quick duplicate check using header id to avoid expensive signature work for duplicates
    const dup = await prisma.webhookEvent.findUnique({ where: { dodoWebhookId: headerId } });
    if (dup) {
      logInfo('Webhook already processed (by header):', headerId);
      return NextResponse.json({ received: true }, { headers: securityHeaders });
    }

    // 3. Verify signature
    let payload: any;
    try {
      payload = webhook.verify(rawPayload, {
        'webhook-id': headerId,
        'webhook-signature': headerSig,
        'webhook-timestamp': headerTs
      });
    } catch (error) {
      logError('Webhook signature verification failed:', error);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 4. Store webhook event (id from payload)
    const event = await prisma.webhookEvent.create({
      data: {
        dodoWebhookId: payload.id || headerId,
        eventType: payload.type || 'unknown',
        status: 'received',
        payload: payload.data?.object || {}
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