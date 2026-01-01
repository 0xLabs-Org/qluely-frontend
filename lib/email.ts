// lib/email.ts
import nodemailer from 'nodemailer';
import pRetry from 'p-retry';
import { logError, logInfo } from './logger';

import { env } from './env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: parseInt(env.SMTP_PORT || '587'),
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

export async function sendEmail({
  to,
  template,
  data
}: {
  to: string;
  template: string;
  data: any;
}) {
  const templates: Record<string, any> = {
    payment_succeeded: {
      subject: 'Payment Received ✓',
      html: `<p>Thank you! Your payment of ₹${data.amount} has been received.</p>`
    },
    subscription_activated: {
      subject: `Welcome to ${data.plan} Plan!`,
      html: `<p>Your subscription to the ${data.plan} plan is now active.</p>`
    },
    subscription_renewed: {
      subject: 'Subscription Renewed',
      html: '<p>Your subscription has been renewed successfully.</p>'
    }
  };

  const template_ = templates[template];
  if (!template_) return;

  try {
    await pRetry(
      () =>
        transporter.sendMail({
          from: env.SMTP_FROM,
          to,
          subject: template_.subject,
          html: template_.html
        }),
      {
        retries: 3,
        onFailedAttempt: (err) => {
          logError(`Email send attempt failed (attempt ${err.attemptNumber}):`, err);
        }
      }
    );
    logInfo('Email sent', { to, template });
  } catch (err) {
    logError('Failed to send email after retries', err);
  }
}