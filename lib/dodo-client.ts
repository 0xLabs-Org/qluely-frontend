import DodoPayments from 'dodopayments';
import { env } from './env';

// Initialize singleton DodoPayments client
export const dodoClient = new DodoPayments({
  bearerToken: env.DODO_PAYMENTS_API_KEY || '',
  environment: env.DODO_PAYMENTS_ENVIRONMENT
});

export default dodoClient;
