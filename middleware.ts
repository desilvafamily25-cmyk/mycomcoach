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

  // Read the Supabase session cookie set by the browser client after login
  // Project ref hardcoded to avoid runtime env-var split errors in Edge Runtime
  const cookieBase = 'sb-okdywevzuljdjxejnetw-auth-token';
  const hasSession = request.cookies.has(cookieBase) || request.cookies.has(`${cookieBase}.0`);

  // Only block unauthenticated users from protected routes.
  // Do NOT redirect authenticated users from /login → /dashboard here:
  // if server-side session reading fails, that creates an infinite redirect loop.
  // The login page handles the "already signed in" redirect client-side instead.
  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
