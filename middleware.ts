import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/offline') ||
    pathname.startsWith('/icons') ||
    pathname === '/manifest.json' ||
    isAuthPage;

  const cookieBase = 'sb-okdywevzuljdjxejnetw-auth-token';

  // Read the raw session value — single cookie or first chunk of a chunked session
  const rawSession =
    request.cookies.get(cookieBase)?.value ??
    request.cookies.get(`${cookieBase}.0`)?.value;

  const hasSession = !!rawSession;

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // For protected routes with a session cookie, check whether the access token
  // has expired. If it has, redirect through the refresh route handler which
  // CAN write Set-Cookie response headers (unlike server components).
  // This prevents the broken cycle where server-side refresh succeeds but the
  // new tokens are silently dropped because cookies().set() throws in RSCs.
  if (hasSession && !isPublic && rawSession) {
    try {
      let expiresAt: number | undefined;

      try {
        // Most sessions fit in one cookie — parse directly
        const session = JSON.parse(rawSession) as { expires_at?: number };
        expiresAt = session.expires_at;
      } catch {
        // Chunked session: first chunk is partial JSON, use regex to find expires_at
        // (expires_at is a small number that appears early in the JSON, before the user object)
        const match = rawSession.match(/"expires_at"\s*:\s*(\d+)/);
        if (match) expiresAt = parseInt(match[1], 10);
      }

      if (expiresAt !== undefined) {
        const secondsUntilExpiry = expiresAt - Date.now() / 1000;
        // Refresh 60 seconds before expiry (same margin auth-js uses internally)
        if (secondsUntilExpiry < 60) {
          const refreshUrl = new URL('/api/auth/refresh', request.url);
          refreshUrl.searchParams.set('next', pathname);
          return NextResponse.redirect(refreshUrl);
        }
      }
    } catch {
      // Cannot determine expiry — pass through and let server component handle it
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
