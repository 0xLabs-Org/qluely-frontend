import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

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
      body.return_to = form.get('return_to') || form.get('returnUrl');
    }

    const email = (body.email || '').toString().trim().toLowerCase();
    const returnTo = (body.return_to || '/').toString();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find or create user
    let user;
    try {
      user = await prisma.user.upsert({
        where: { email },
        update: { email },
        create: { email }
      });
    } catch (dbErr: any) {
      const msg = dbErr?.message || String(dbErr);
      // If database isn't reachable, return a clear error to the client
      if (msg.includes('localhost') || msg.includes('connect') || msg.includes('ECONNREFUSED')) {
        return NextResponse.json({ error: 'Database unreachable. Ensure your Postgres is running and DATABASE_URL is set.' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Login failed (db error)' , details: msg }, { status: 500 });
    }

    const token = signToken({ sub: user.id, email: user.email });

    const res = NextResponse.redirect(returnTo);
    setAuthCookie(res, token);
    return res;

  } catch (err) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
