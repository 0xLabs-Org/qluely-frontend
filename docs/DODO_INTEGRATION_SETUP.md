# Qluely DodoPayments Integration - Setup Guide

## ✅ Completed Setup

The DodoPayments integration has been successfully implemented! Here's what's been added:

### 📁 New Files Created
- [prisma/schema.prisma](prisma/schema.prisma) - Database schema for users, subscriptions, payments, webhooks
- [lib/prisma.ts](lib/prisma.ts) - Database client connection
- [lib/queue.ts](lib/queue.ts) - BullMQ webhook queue processing
- [lib/webhook-handlers.ts](lib/webhook-handlers.ts) - Webhook event handlers
- [lib/validation.ts](lib/validation.ts) - Request validation with Zod
- [lib/email.ts](lib/email.ts) - Email notification system
- [lib/logger.ts](lib/logger.ts) - Logging utilities
- [app/checkout/success/page.tsx](app/checkout/success/page.tsx) - Payment success page
- [app/dashboard/page.tsx](app/dashboard/page.tsx) - User dashboard

### 🔧 Updated Files
- [package.json](package.json) - Added new dependencies and scripts
- [app/api/checkout/route.ts](app/api/checkout/route.ts) - Enhanced with database integration
- [app/api/webhooks/dodo/route.ts](app/api/webhooks/dodo/route.ts) - Enhanced with queue processing
- [app/page.tsx](app/page.tsx) - Updated checkout call to include userId
- [.env.local](.env.local) - Added required environment variables

## 🚀 Next Steps to Complete Setup

### 1. Database Setup
```bash
# Install PostgreSQL locally or set up cloud database
# Update DATABASE_URL in .env.local with your database credentials

# Run Prisma migrations
npx prisma migrate dev --name init_dodopayments
npx prisma generate
```

### 2. Redis Setup (for Queue Processing)
```bash
# Install Redis locally or use cloud Redis
# Update REDIS_URL in .env.local

# For macOS with Homebrew:
brew install redis
brew services start redis
```

### 3. DodoPayments Configuration
1. Get your API keys from [DodoPayments Dashboard](https://app.dodopayments.com)
2. Create products for each plan (starter, pro, premium, enterprise)
3. Update .env.local with your actual product IDs:
   ```
   DODO_PRODUCT_ID_STARTER=your_actual_starter_product_id
   DODO_PRODUCT_ID_PRO=your_actual_pro_product_id
   DODO_PRODUCT_ID_PREMIUM=your_actual_premium_product_id
   DODO_PRODUCT_ID_ENTERPRISE=your_actual_enterprise_product_id
   ```

### 4. Email Configuration (Optional)
Update .env.local with your SMTP settings:
```
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 5. Webhook URL Setup
1. In DodoPayments dashboard, set webhook URL to:
   - Local: `http://localhost:3000/api/webhooks/dodo`
   - Production: `https://yourdomain.com/api/webhooks/dodo`

### 6. User Authentication (TODO)
The current implementation uses a placeholder userId (`user_123`). You'll need to:
- Implement user authentication (NextAuth.js, Supabase Auth, etc.)
- Create user records in database
- Update checkout flow to use real user IDs

### 7. Start Development
```bash
npm run dev
```

## 🧪 Testing the Integration

### Test Checkout Flow
1. Start the development server: `npm run dev`
2. Go to homepage and click "Start Pro Plan"
3. Complete checkout with test payment
4. Verify webhook processing in logs
5. Check database for created records

### Test Webhook Processing
1. Use DodoPayments dashboard to trigger test webhooks
2. Monitor console logs for webhook processing
3. Check database for webhook events and status

## 📊 Database Schema Overview

The integration includes these main models:
- **User** - User accounts with subscription tiers
- **DodoCustomer** - Links users to DodoPayments customers
- **Subscription** - Subscription details and status
- **Payment** - Payment records and status
- **Invoice** - Invoice history
- **WebhookEvent** - Webhook processing log
- **CheckoutSession** - Checkout session tracking

## 🔍 Key Features Implemented

- ✅ Multi-plan support (starter, pro, premium, enterprise)
- ✅ Webhook signature verification
- ✅ Async webhook processing with queues
- ✅ Database persistence for all events
- ✅ Email notifications for payment events
- ✅ Error handling and logging
- ✅ Idempotent webhook processing
- ✅ Checkout session tracking

## 🚨 Important Notes

1. **Database First**: Create and migrate database before testing
2. **Environment Variables**: Update all placeholder values in .env.local
3. **Product IDs**: Create actual products in DodoPayments dashboard
4. **Webhook Verification**: Uses StandardWebhooks for secure verification
5. **Queue Processing**: BullMQ handles webhook processing reliably
6. **Authentication**: Implement real user auth before production

## 🐛 Troubleshooting

### Common Issues:
1. **Database Connection Error**: Verify DATABASE_URL is correct
2. **Redis Connection Error**: Ensure Redis is running
3. **Webhook Signature Failed**: Check DODO_PAYMENTS_WEBHOOK_KEY
4. **Checkout Creation Failed**: Verify API key and product IDs
5. **Email Not Sending**: Configure SMTP settings

### Debug Commands:
```bash
# Check database connection
npx prisma db push

# View database
npx prisma studio

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

The integration is now ready for development and testing! 🎉