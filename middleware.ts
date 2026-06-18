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

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
