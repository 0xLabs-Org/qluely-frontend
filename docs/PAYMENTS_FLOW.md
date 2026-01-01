# Payments integration — Qluely

**Overview:**
This document describes how payments are initiated, processed, and persisted in the application, which secrets are required to run locally and in production, where webhook schemas live, and the end‑to‑end flow after a payment.

**Primary integration:** Dodo Payments (third‑party provider). Relevant implementation files:
- [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts)
- [lib/webhook-schemas.ts](lib/webhook-schemas.ts)
- [lib/webhook-handlers.ts](lib/webhook-handlers.ts)
- [lib/payments.ts](lib/payments.ts)
- [lib/queue.ts](lib/queue.ts)
- [lib/prisma.ts](lib/prisma.ts)
- [prisma/schema.prisma](prisma/schema.prisma)

**How payments are initiated**
- Checkout pages live under `app/checkout` and use helpers in `lib/payments.ts` to build checkout/return URLs and to create purchase intents with Dodo (server side).
- Client clicks purchase -> server constructs Dodo checkout URL or API request using `DODO_PAYMENTS_API_KEY` and product IDs (from env vars like `DODO_PRODUCT_ID_*`).
- The user completes payment on the Dodo-hosted page (or embedded flow). Dodo then sends asynchronous webhook events back to our webhook endpoint.

**Webhook intake and validation**
- Incoming webhooks are handled in [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts).
- The route validates signatures using the configured `DODO_PAYMENTS_WEBHOOK_KEY` and performs early rate/duplicate checks (`lib/rateLimit.ts` and header/envelope id checks).
- The raw validated payload is persisted immediately to the database as a `WebhookEvent` (`prisma.webhookEvent.create`) for audit and reliability.
- After persisting, the route enqueues the event for background processing by `lib/queue.ts`.

**Schemas and payload validation**
- Zod schemas for incoming webhook payloads live in `lib/webhook-schemas.ts`. Each event type has a schema and the union `EventSchemas` maps event type keys to validators.
- The route uses these schemas to parse and ensure type-safe event data before handing it to handlers.

**Background processing and handlers**
- The worker queue (`lib/queue.ts`) pulls events and calls handlers defined in `lib/webhook-handlers.ts`.
- Handler responsibilities:
  - Idempotently upsert domain models (e.g., `Payment`, `Subscription`, `Invoice`) based on provider IDs present in the webhook (fields like `dodoPaymentId`, `dodoSubId`, `dodoCustomerId` are unique in the DB schema).
  - Create user records or link external customers as needed.
  - Emit internal events, send emails, or update subscription state.

**Database / Prisma models**
- The canonical models touched by payments flows are:
  - `WebhookEvent` — raw persisted webhook payloads and metadata.
  - `Payment` — represents a single payment, persisted with provider id (`dodoPaymentId`) and status.
  - `Subscription` — recurring subscriptions with `dodoSubId`.
  - `Invoice` — invoices generated or reconciled from webhook events.
- See [prisma/schema.prisma](prisma/schema.prisma) and generated models in `generated/prisma/models` for fields and constraints.

**Required environment variables / secrets**
These names are exported from `lib/env.ts` and must be present (in production some are required):
- `DATABASE_URL` — Postgres connection string.
- `REDIS_URL` (or `REDIS_HOST`) — Redis for queueing.
- `DODO_PAYMENTS_API_KEY` — API key used to call Dodo Payments.
- `DODO_PAYMENTS_WEBHOOK_KEY` — secret used to verify incoming webhook signatures.
- `DODO_PAYMENTS_ENVIRONMENT` — environment string (defaults to `test_mode`).
- `DODO_PAYMENTS_RETURN_URL` — optional return URL used by `lib/payments.ts` when building redirect URLs.
- `DODO_PRODUCT_ID_STARTER`, `DODO_PRODUCT_ID_PRO`, `DODO_PRODUCT_ID_PREMIUM`, `DODO_PRODUCT_ID_ENTERPRISE` — product identifiers used to create purchases.
- `AUTH_JWT_SECRET` — auth secret required in production.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — email delivery (optional in development, required for transactional emails).
- `NEXT_PUBLIC_BASE_URL` — public base URL used to build return links.

Runtime checks: in production the app throws if `AUTH_JWT_SECRET`, `DODO_PAYMENTS_API_KEY`, or `DODO_PAYMENTS_WEBHOOK_KEY` are missing.

**End-to-end flow (step-by-step)**
1. User starts checkout on `app/checkout` → server action (or API) calls helper in `lib/payments.ts` to create/obtain Dodo checkout link using `DODO_PAYMENTS_API_KEY` and configured `DODO_PRODUCT_ID_*`.
2. User completes payment on Dodo side. Dodo redirects back to `DODO_PAYMENTS_RETURN_URL`/`NEXT_PUBLIC_BASE_URL` if configured, and also sends webhook(s) to our `/api/webhooks/dodo` route.
3. Webhook route verifies signature with `DODO_PAYMENTS_WEBHOOK_KEY`, persists the raw event to `WebhookEvent`, and enqueues it for processing.
4. Background worker dequeues and calls appropriate handler in `lib/webhook-handlers.ts`.
5. Handler validates payload against Zod schemas (`lib/webhook-schemas.ts`), then upserts `Payment`/`Subscription`/`Invoice` records in the database using provider IDs (ensuring idempotency).
6. Business side-effects: notify user via email, update subscription access, generate receipts, or reconcile accounting — all performed by handlers.
7. The persisted `WebhookEvent` provides an audit log and can be used to replay or debug processing.

**Developer tips & debugging**
- To reproduce flows locally, set `DODO_PAYMENTS_WEBHOOK_KEY` to the signer used by your Dodo test tool and POST signed payloads to `/api/webhooks/dodo`.
- Use Prisma Studio (`npm run db:studio`) to inspect `WebhookEvent`, `Payment`, `Subscription`, and `Invoice` records.
- Check the queue worker logs (wherever `lib/queue.ts` is configured to run) for background handler errors.
- Add a new webhook type: 1) add Zod schema to `lib/webhook-schemas.ts`, 2) add mapping in `lib/webhook-handlers.ts`, 3) update tests.

**Files to inspect first when changing payments behavior**
- [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts)
- [lib/webhook-handlers.ts](lib/webhook-handlers.ts)
- [lib/webhook-schemas.ts](lib/webhook-schemas.ts)
- [lib/payments.ts](lib/payments.ts)
- [lib/queue.ts](lib/queue.ts)

---

If you'd like, I can:
- add short example curl commands for sending a signed webhook to the route,
- expand the `PAYMENTS_FLOW.md` with example payload shapes pulled from `lib/webhook-schemas.ts`, or
- open a PR that wires a local worker runner script to process queued events.
