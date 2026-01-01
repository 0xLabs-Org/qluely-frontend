# Qluely — End-to-End Application Documentation

This document explains how the Qluely application is organized, how it works end-to-end, the main files and features, and environment variables required to run it locally or in production.

## Quick Summary
- Framework: Next.js (App Router)
- Purpose: Landing site + checkout integration for Qluely (AI meeting assistant)
- Key flows: Download links, Checkout (DodoPayments), Webhook handling

## How it works (high level)

1. User visits the landing site served by the Next.js app. The UI is in the `app` folder and uses client components for interactions.
2. The landing page (`app/page.tsx`) uses `useOS` (`hooks/useOs.ts`) to detect the visitor OS and shows platform-specific download links.
3. When a user chooses a paid plan (Pro), the client calls the internal API endpoint `POST /api/checkout` to create a checkout session with DodoPayments.
4. The server-side route at `app/api/checkout/route.ts` constructs the request to DodoPayments (using `DODO_PAYMENTS_API_KEY`, `DODO_PRO_PRODUCT_ID`, and environment settings) and returns a `checkout_url`.
5. After payment, DodoPayments sends webhook events to `POST /api/webhooks/dodo` which is implemented using `@dodopayments/nextjs` helper. Webhook handlers log events and include TODOs to update your DB or user records.

## Main files and purpose

- [package.json](package.json): project manifest, scripts, and dependencies.
- [next.config.ts](next.config.ts): Next.js configuration (currently minimal).
- [tsconfig.json](tsconfig.json): TypeScript settings and path aliases.
- [README.md](README.md): Starter README with standard Next.js guidance.

- [app/layout.tsx](app/layout.tsx): Root layout and site metadata (title, OG tags, icons, fonts).
- [app/page.tsx](app/page.tsx): Landing page — UI, features list, pricing, download buttons, trial email form, and checkout client call.
- [app/globals.css](app/globals.css): Global styles used across the app.

- [app/api/checkout/route.ts](app/api/checkout/route.ts): Server-side route that creates DodoPayments checkout sessions.
  - Accepts POST JSON { plan: 'pro' }
  - Requires `DODO_PAYMENTS_API_KEY` and optionally `DODO_PRO_PRODUCT_ID` and `DODO_PAYMENTS_ENVIRONMENT`.
  - Returns `{ checkout_url }` on success.

- [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts): Webhook receiver powered by `@dodopayments/nextjs`.
  - Uses `DODO_PAYMENTS_WEBHOOK_KEY` to verify incoming events.
  - Hooks implemented: onPaymentSucceeded, onSubscriptionActive, onSubscriptionOnHold, onSubscriptionRenewed, onSubscriptionCancelled, onSubscriptionFailed, onSubscriptionExpired.
  - Each handler currently logs the payload and includes TODOs to update your application DB.

- [hooks/useOs.ts](hooks/useOs.ts): Client hook to detect the visitor OS and switch the download link/button text accordingly.

- [public/logo.png] and [app/logo.png]: Branding assets used by the layout and open graph.

## Features (extracted from the codebase)

- Live Notes — real-time transcription UI (marketing copy: `Live Notes`).
- Instant Answers — ask questions and get answers without leaving the meeting.
- Undetectable Overlay — a floating, movable overlay intended to remain hidden from screen shares.
- Smart Follow-Ups — generate emails and action items post-meeting.
- Free and Pro pricing paths are baked into `app/page.tsx` with a client-side call to the checkout endpoint for upgrades.

## API details

- Checkout endpoint
  - Route: `POST /api/checkout`
  - Implementation: [app/api/checkout/route.ts](app/api/checkout/route.ts)
  - Request body: JSON — example `{ "plan": "pro" }`
  - Behavior: Validates plan, ensures `DODO_PAYMENTS_API_KEY` exists, constructs `product_cart`, and posts to DodoPayments checkout sessions endpoint. Returns `{ checkout_url }`.

- Webhooks
  - Route: `POST /api/webhooks/dodo`
  - Implementation: [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts)
  - The library `@dodopayments/nextjs` verifies webhook signatures using `DODO_PAYMENTS_WEBHOOK_KEY` and maps events to handler callbacks.

## Environment variables

Set these in `.env.local` (or your platform secrets):

- `DODO_PAYMENTS_API_KEY` — API key used for calling DodoPayments (required for checkout).
- `DODO_PAYMENTS_ENVIRONMENT` — set to `live_mode` for production, otherwise test endpoints are used.
- `DODO_PRO_PRODUCT_ID` — optional product id for the Pro plan (fallback placeholder used if missing).
- `DODO_PAYMENTS_RETURN_URL` — URL where users are redirected after checkout (defaults to `http://localhost:3000/checkout/success`).
- `DODO_PAYMENTS_WEBHOOK_KEY` — webhook signing key used to verify incoming webhook events.

Important: Never commit secrets to source control. Use your deployment platform's secret manager for production.

## Local development & deployment

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
npm start
```

Notes:
- The project uses Next 16 (App Router) and React 19.
- Tailwind / PostCSS dependencies are included; update `globals.css` if you need to change styling.

## To-do & recommended next steps

- Implement server-side DB integration in the webhook handlers to persist subscription/payment states.
- Add input validation and server-side rate limiting for `POST /api/checkout`.
- Add unit / integration tests for API routes.
- Harden error handling and user-friendly error responses for checkout failures.
- Add a secure admin UI to view webhook events and subscriptions (optional).

## Where to look in the code

- Landing UI: [app/page.tsx](app/page.tsx)
- App shell & metadata: [app/layout.tsx](app/layout.tsx)
- Checkout flow: [app/api/checkout/route.ts](app/api/checkout/route.ts)
- Webhooks: [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts)
- OS detection: [hooks/useOs.ts](hooks/useOs.ts)

---

If you'd like, I can:
- Expand any section into a developer-runbook with step-by-step deployment instructions for Vercel or another host.
- Implement webhook DB persistence scaffolding (example using Prisma or a simple JSON store).
- Add tests for the checkout route and webhook handlers.

Tell me which follow-up you'd like and I'll continue.
