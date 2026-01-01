import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
// Avoid importing Node-only auth helpers here because middleware runs in the
// Edge runtime which doesn't support Node's crypto module. Instead perform a
// lightweight presence check for the session cookie and let server routes do
// full token verification.

const PROTECTED_ROUTES = ['/checkout', '/dashboard', '/profile'];
const PUBLIC_PREFIXES = ['/', '/signin', '/signup', '/api/webhooks', '/api/auth'];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // allow public prefixes
  for (const p of PUBLIC_PREFIXES) {
    if (pathname === p || pathname.startsWith(p)) return NextResponse.next();
  }

  // protect routes
  for (const route of PROTECTED_ROUTES) {
    if (pathname === route || pathname.startsWith(route)) {
      const tokenCookie = req.cookies.get && req.cookies.get('qluely_token')?.value;
      if (!tokenCookie) {
        const callback = encodeURIComponent(pathname + search);
        return NextResponse.redirect(new URL(`/signin?callbackUrl=${callback}`, req.url));
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/checkout/:path*', '/dashboard/:path*', '/profile/:path*'],
};
