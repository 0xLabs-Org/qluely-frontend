import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';
import { env } from '@/lib/env';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // form submissions
      const form = await request.formData();
      body.email = form.get('email');
      body.password = form.get('password');
      body.return_to = form.get('return_to') || form.get('returnUrl');
    }

    const email = (body.email || '').toString().trim().toLowerCase();
    const password = (body.password || '').toString();
    const returnTo = (body.return_to || '/').toString();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    try {
      // Find existing user
      let user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        // verify password
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      } else {
        // create user with hashed password
        const hashed = await bcrypt.hash(password, 10);
        user = await prisma.user.create({ data: { email, passwordHash: hashed } });
      }

      const token = signToken({ sub: user.id, email: user.email });
      const res = NextResponse.redirect(new URL(returnTo, env.NEXT_PUBLIC_BASE_URL).toString());
      setAuthCookie(res, token);
      return res;

    } catch (dbErr: any) {
      const msg = dbErr?.message || String(dbErr);
      if (msg.includes('localhost') || msg.includes('connect') || msg.includes('ECONNREFUSED')) {
        return NextResponse.json({ error: 'Database unreachable. Ensure your Postgres is running and DATABASE_URL is set.' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Login failed (db error)' , details: msg }, { status: 500 });
    }

  } catch (err) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
