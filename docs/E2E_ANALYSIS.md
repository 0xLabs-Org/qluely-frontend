# Qluely — End-to-End Analysis

**Purpose**
This document explains what the application is, how it works end-to-end, and enumerates key components, flows, files, and dev/run/testing instructions.

**Overview**
- Qluely is a Next.js app (app directory) integrating with the Dodo Payments provider for checkout, webhooks, subscriptions, and invoices.
- Prisma is used as the single source of truth for persistence.
- Webhooks are validated, persisted, and processed asynchronously by a worker queue.

**High-level architecture**
- Frontend: Next.js (App Router) pages for checkout, signin, and dashboard.
- Backend serverless routes: API routes under `app/api/*` handling auth, checkout, webhooks, health checks.
- Data layer: Prisma client (generated) is used via `lib/prisma.ts`.
- Background processing: `lib/queue.ts` queues webhook events to be processed by handlers in `lib/webhook-handlers.ts`.
- External integration: Dodo Payments client wrapper in `lib/dodo-client.ts` and payment helpers in `lib/payments.ts`.

**Key end-to-end flows**
1. Checkout -> Payment -> Return
   - Client requests a checkout route (`app/checkout`), `lib/payments.ts` constructs a checkout session / return URLs and redirects to the provider.
   - After payment the provider redirects back to `NEXT_PUBLIC_BASE_URL` return paths under `app/checkout/*`.
   - The app verifies and records the payment state via provider webhooks and/or provider return parameters.

2. Webhook processing (core E2E flow)
   - Provider posts signed webhook to `/api/webhooks/dodo`.
   - `app/api/webhooks/dodo/route.ts` verifies signature (via `standardwebhooks` usage), rate-limits, validates payloads with Zod schemas in `lib/webhook-schemas.ts`, and persists the raw `WebhookEvent` record via Prisma.
   - The route enqueues the event using `lib/queue.ts`.
   - Worker (queue consumer) calls handlers in `lib/webhook-handlers.ts` which perform idempotent upserts/updates to `Payment`, `Subscription`, `Invoice`, and related models.
   - Handlers log events via `lib/logger.ts` and send any necessary emails via `lib/email.ts`.

3. Idempotency & Validation
   - Handlers use provider IDs (fields like `dodoPaymentId`, `dodoSubId`, `dodoCustomerId`) marked unique in Prisma schema to ensure idempotency.
   - Zod schemas in `lib/webhook-schemas.ts` enforce expected payload structure before processing.

**Important files & where to look**
- Webhook route: [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts)
- Webhook schemas: [lib/webhook-schemas.ts](lib/webhook-schemas.ts)
- Webhook handlers: [lib/webhook-handlers.ts](lib/webhook-handlers.ts)
- Queue implementation: [lib/queue.ts](lib/queue.ts)
- Prisma setup: [lib/prisma.ts](lib/prisma.ts) and [prisma/schema.prisma](prisma/schema.prisma)
- Payments helpers: [lib/payments.ts](lib/payments.ts)
- Dodo client wrapper: [lib/dodo-client.ts](lib/dodo-client.ts)
- Auth helpers: [lib/auth.ts](lib/auth.ts)
- Logging: [lib/logger.ts](lib/logger.ts)

**Database models (summary)**
- `Payment`, `Subscription`, `Invoice`, `User`, `WebhookEvent`, `DodoCustomer`, `CheckoutSession` are represented in Prisma (see `prisma/schema.prisma` and generated client under `generated/prisma`).
- Webhooks persist raw events (for auditing) and then canonical records store provider IDs with unique constraints.

**Environment & secrets**
- Use `lib/env.ts` to access `env` settings. Important env variables:
  - `DATABASE_URL` (Prisma)
  - `REDIS_URL` (queue)
  - `DODO_PAYMENTS_*` (API keys, webhook key)
  - `NEXT_PUBLIC_BASE_URL`, `SESSION_SECRET`, `SMTP_*` for email
- Copy `.env.example` -> `.env.local` when running locally.

**Local dev / E2E testing steps**
1. Start dev server

```bash
npm run dev
```

2. Populate `.env.local` from `.env.example` and set `DATABASE_URL`, `REDIS_URL`, `DODO_PAYMENTS_WEBHOOK_KEY` (test signer), `NEXT_PUBLIC_BASE_URL`.

3. Recreate DB client if schema changed

```bash
npm run db:generate
npm run db:push
```

4. Simulate a webhook (example using curl):
- In production, webhooks are signed; locally you can either use the same signer or bypass signature checks for testing. Preferred: sign payload with the same key used by `DODO_PAYMENTS_WEBHOOK_KEY` in `.env.local`. The route expects the standard headers used by the provider; see [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts).

5. Inspect DB with Prisma Studio

```bash
npm run db:studio
```

**How to reproduce an E2E payment+webhook locally**
- Open checkout page at `/checkout` and start a test session.
- Use the test provider UI to complete checkout and trigger a webhook to `http://localhost:3000/api/webhooks/dodo` (or use a tunnel like ngrok and point provider test webhooks there).
- Confirm `WebhookEvent` is created and processed; check `Payment` / `Subscription` records in Prisma Studio.

**Troubleshooting & common pitfalls**
- Duplicate webhooks: the route checks header id and envelope id — handler logic should upsert by provider id to avoid duplicate processing.
- Signature mismatch: ensure `DODO_PAYMENTS_WEBHOOK_KEY` used to sign test payloads matches `.env.local` value.
- Queue / Redis not available: background processing requires Redis; ensure `REDIS_URL` is set and reachable.

**Testing & validation**
- Unit: validate Zod schemas in `lib/webhook-schemas.ts`.
- Integration: run the app locally, trigger provider test webhooks and verify DB and email side effects.
- E2E: simulate a full user checkout flow with test payment and webhook delivery (via tunnel if needed).

**Next steps & recommendations**
- Add a small e2e test script (Playwright or Cypress) to automate checkout -> webhook -> DB verification.
- Add example curl scripts and a signed webhook generator to `scripts/` to simplify local testing.
- Document exact webhook header signing algorithm (copy from `app/api/webhooks/dodo/route.ts`) into `docs/` for developer ease.

**References**
- Integration setup / payflow docs: [docs/DODO_INTEGRATION_SETUP.md](docs/DODO_INTEGRATION_SETUP.md)
- Existing end-to-end doc: [docs/END_TO_END.md](docs/END_TO_END.md)

---

Created by the dev assistant on request. If you'd like, I can:
- add a signed webhook generator script under `scripts/`
- add a Playwright test that runs the checkout flow
- expand any section with more concrete examples or copies of relevant code snippets

