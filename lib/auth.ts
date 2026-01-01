import jwt from 'jsonwebtoken';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from './env';

const SECRET = env.AUTH_JWT_SECRET ?? (env.NODE_ENV === 'production' ? undefined : 'dev_secret_change_me');
const COOKIE_NAME = 'qluely_token';

export function signToken(payload: object, opts?: jwt.SignOptions) {
  if (!SECRET) {
    throw new Error('Cannot sign token: AUTH_JWT_SECRET is not configured');
  }
  return jwt.sign(payload, SECRET, { expiresIn: '7d', ...(opts || {}) });
}

export function verifyToken(token: string) {
  if (!SECRET) return null;
  try {
    return jwt.verify(token, SECRET) as { [key: string]: any } | null;
  } catch (err) {
    return null;
  }
}

export function setAuthCookie(res: NextResponse, token: string) {
  const secure = env.NODE_ENV === 'production';
  res.cookies.set({ name: COOKIE_NAME, value: token, httpOnly: true, path: '/', secure, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7 });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set({ name: COOKIE_NAME, value: '', httpOnly: true, path: '/', expires: new Date(0) });
}

export function getTokenFromReq(req: NextRequest | any) {
  try {
    // NextRequest.cookies is a getter map
    return req.cookies?.get && req.cookies.get(COOKIE_NAME)?.value ? req.cookies.get(COOKIE_NAME)?.value : (req.cookies && req.cookies[COOKIE_NAME]) || null;
  } catch (err) {
    return null;
  }
}
