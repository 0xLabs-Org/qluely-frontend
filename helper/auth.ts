import { AccountType } from '@/lib/types';
import jwt from 'jsonwebtoken';
// Generate JWT
export function generateToken(id: string, accountType: AccountType = AccountType.FREE): string {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error(
      'JWT_SECRET environment variable is not configured. Please set JWT_SECRET in your environment variables.',
    );
  }

  return jwt.sign({ id, accountType }, jwtSecret, { expiresIn: '28d' });
}
