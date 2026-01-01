import { env } from './env';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from './prisma';
import argon2 from 'argon2';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = env.AUTH_JWT_SECRET ?? (env.NODE_ENV === 'production' ? undefined : 'dev_secret_change_me');
const COOKIE_NAME = 'qluely_token';

function ensureSecret() {
  if (!SECRET) throw new Error('AUTH_JWT_SECRET is not configured');
}

export async function hashPassword(password: string) {
  return argon2.hash(password);
}

export async function verifyPassword(password: string, hash: string) {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
}

export async function createSessionToken(payload: object) {
  ensureSecret();
  const alg = 'HS256';
  const encoder = new TextEncoder();
  const jwt = await new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encoder.encode(SECRET as string));
  return jwt;
}

export async function verifySessionToken(token: string) {
  if (!SECRET) return null;
  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder.encode(SECRET as string));
    return payload as any;
  } catch (err) {
    return null;
  }
}

// Backwards-compatible aliases
export const signToken = createSessionToken;
export async function verifyToken(token: string) {
  return verifySessionToken(token);
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
    return req.cookies?.get && req.cookies.get(COOKIE_NAME)?.value ? req.cookies.get(COOKIE_NAME)?.value : (req.cookies && req.cookies[COOKIE_NAME]) || null;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(req: NextRequest | Request | any) {
  const token = getTokenFromReq(req);
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload || !payload.sessionId || !payload.userId) return null;

  // Validate session exists and not expired
  const session = await prisma.session.findUnique({ where: { token } });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) return null;

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  return user;
}

export async function signUp(email: string, username: string | null, password: string, res?: NextResponse) {
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, name: username || null, passwordHash } });

  // create session record
  const sessionToken = await createSessionToken({ userId: user.id, sessionId: `sess_${Date.now()}_${user.id}` });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId: user.id, token: sessionToken, expiresAt } });

  if (res) setAuthCookie(res, sessionToken);
  return { user, token: sessionToken };
}

export async function signIn(email: string, password: string, res?: NextResponse) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Invalid credentials');
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');

  const sessionToken = await createSessionToken({ userId: user.id, sessionId: `sess_${Date.now()}_${user.id}` });
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.session.create({ data: { userId: user.id, token: sessionToken, expiresAt } });

  if (res) setAuthCookie(res, sessionToken);
  return { user, token: sessionToken };
}

export async function signOut(req: NextRequest | any, res?: NextResponse) {
  const token = getTokenFromReq(req);
  if (token) {
    // delete session record
    await prisma.session.deleteMany({ where: { token } });
  }
  if (res) clearAuthCookie(res);
  return { success: true };
}
