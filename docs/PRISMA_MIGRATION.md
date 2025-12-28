Prisma 7 migration guidance
===========================

Context
-------
The project currently contains `prisma/schema.prisma` using `url = env("DATABASE_URL")` in the datasource. If your environment uses Prisma 7, the datasource `url` property in the schema is deprecated and some CLI behaviors changed.

What I changed in this repo
---------------------------
- Added sensible indexes for `WebhookEvent.eventType`, `Payment.status`, `Invoice.status`, and `CheckoutSession.status`.
- Changed `onDelete` behavior for `Payment`, `Invoice`, and `CheckoutSession` relations to `Restrict` so deleting users won't cascade-drop financial records.

Recommended migration steps (if moving to Prisma 7)
--------------------------------------------------
1. Install Prisma 7 CLI and client if you intend to upgrade:

   ```bash
   npm install prisma@latest @prisma/client@latest --save-dev
   ```

2. Create `prisma.config.ts` at the project root with datasource configuration for the Migrate tool. Example (replace values as needed):

   ```ts
   // prisma.config.ts
   import { defineConfig } from 'prisma';

   export default defineConfig({
     schema: './prisma/schema.prisma',
     datasources: {
       db: {
         provider: 'postgresql',
         url: process.env.DATABASE_URL
       }
     }
   });
   ```

   See Prisma docs for the exact config API for your installed Prisma version.

3. Update any runtime `PrismaClient` initialization to pass an `adapter`/`accelerateUrl` option if required by your Prisma runtime configuration. Example:

   ```ts
   import { PrismaClient } from '@prisma/client';

   export const prisma = new PrismaClient({
     // adapter: ..., // if using an external adapter
     log: ['error', 'warn']
   });
   ```

4. Run `npx prisma generate` and `npx prisma migrate dev` (careful on production databases).

Notes
-----
- Upgrading Prisma major versions can introduce breaking changes. Test migrations in a staging environment first.
- If you do not plan to upgrade Prisma now, keep your current `prisma` package versions consistent (the repo currently references `prisma` and `@prisma/client` in package.json). If `npx prisma` reports an error about `url` being deprecated, follow the migration docs linked from the CLI error.
