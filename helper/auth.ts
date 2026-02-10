import { AccountType } from '@/lib/types';
import jwt from 'jsonwebtoken';
// Generate JWT
export function generateToken(userId: string, plan: string = AccountType.FREE): string {
  const payload = {
    id: userId,
    accountType: plan,
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '10d' });
}
