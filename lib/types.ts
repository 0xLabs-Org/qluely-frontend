export enum AccountType {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PRO = 'PRO',
  UNLIMITED = 'UNLIMITED',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface UserDetails {
  plan: AccountType;
  period: BillingCycle | null;
  planStartedAt: Date | null;
  planExpiresAt: Date | null;
  creditsRemaining: number;
  creditsUsed: number;
  imageCredits: number;
  audioCredits: number;
}

export interface UserDetailsResponse {
  success: boolean;
  error: boolean;
  message: string;
  data: UserDetails | null;
}

export const STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;
