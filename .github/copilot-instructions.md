<!-- GitHub Copilot / AI agent guidance for the qluely repo -->
# Qluely — Copilot Instructions

Purpose: short, focused guidance so an AI coding agent can be productive immediately in this repo.

- **Big picture**: This is a Next.js app (app directory) that integrates with a third‑party payments provider (Dodo Payments). Webhooks arrive at [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts), are validated and persisted to `WebhookEvent` (see `prisma/schema.prisma`), then queued for async processing by the worker queue (`lib/queue.ts`) which invokes handlers in `lib/webhook-handlers.ts`.

- **Data layer**: Prisma is the single source of truth. See [prisma/schema.prisma](prisma/schema.prisma). The generated client is output to `generated/prisma` (see `generator client` in schema). Use the exported `prisma` from [lib/prisma.ts](lib/prisma.ts), which also supports runtime `DATABASE_URL` override.

- **Key integration points**:
  - Webhooks: [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts) -> `prisma.webhookEvent.create` -> enqueue -> `lib/webhook-handlers.ts`.
  - Payments return flow: `lib/payments.ts` builds return URLs; checkout pages live under `app/checkout`.
  - Authentication helpers: `lib/auth.ts`.

- **Validation & safety patterns**:
  - Payloads are validated with Zod schemas in [lib/webhook-schemas.ts](lib/webhook-schemas.ts).
  - Webhook signing/verification is enforced using `standardwebhooks` in the route.
  - Webhook handling is idempotent: DB models use provider IDs (fields like `dodoPaymentId`, `dodoSubId`, `dodoCustomerId`) marked unique.
  - Rate limiting and duplicate checks happen early in the webhook route (`lib/rateLimit.ts`, checks by header id and payload id).

- **Conventions to follow**:
  - Prefer upsert by provider id for idempotency (see `handlePaymentSucceeded`).
  - When adding new webhook types, add the Zod schema in `lib/webhook-schemas.ts`, wire it into `EventSchemas`, then add mapping in `lib/webhook-handlers.ts`.
  - Use `env` from `lib/env.ts` and check `.env.example` for required variables.
  - Logging uses `logInfo` / `logError` from `lib/logger.ts` — keep messages machine‑parsable where helpful.

- **Developer workflows & commands** (from package.json):
  - Dev server: `npm run dev` (Next.js app)
  - Prisma: `npm run db:generate`, `npm run db:push`, `npm run db:migrate`, `npm run db:studio`
  - Lint: `npm run lint`

- **Env & local setup**: copy `.env.example` -> `.env.local` and populate `DATABASE_URL`, `REDIS_URL`, `DODO_PAYMENTS_*`, `SMTP_*`, `NEXT_PUBLIC_BASE_URL`, `SESSION_SECRET`.

- **Debugging tips**:
  - To reproduce webhook flows locally: run the app, ensure `DODO_PAYMENTS_WEBHOOK_KEY` matches the signer used by your test tool, and POST signed payloads to `/api/webhooks/dodo` with the required headers shown in the route.
  - Use `prisma studio` (`npm run db:studio`) to inspect `WebhookEvent`, `Payment`, `Subscription`, `Invoice` state.
  - Check the queue implementation in `lib/queue.ts` and worker logs for background processing errors.

- **What to avoid / common pitfalls**:
  - Do not rely solely on header id for uniqueness; canonical id comes from the webhook envelope (`envelope.data.id`). Code already checks both.
  - Avoid writing raw SQL; prefer Prisma client and models defined in `prisma/schema.prisma`.

- **Files to inspect first when asked to modify payments or subscription flows**:
  - [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts)
  - [lib/webhook-handlers.ts](lib/webhook-handlers.ts)
  - [lib/webhook-schemas.ts](lib/webhook-schemas.ts)
  - [lib/prisma.ts](lib/prisma.ts)
  - [prisma/schema.prisma](prisma/schema.prisma)

If anything here is unclear or you want the instructions to call out other hotspots (tests, CI, or deploy specifics), tell me which area to expand. 
