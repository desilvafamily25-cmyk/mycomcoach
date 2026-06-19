import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Route Handlers CAN write Set-Cookie response headers, unlike Server Components.
// The middleware redirects here when it detects an expired access token so the
// refreshed tokens (new access_token + rotated refresh_token) are actually saved.
export async function GET(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next') ?? '/dashboard';
  const redirectTo = NextResponse.redirect(new URL(next, request.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Write refreshed tokens onto the redirect response so the browser stores them
          redirectTo.cookies.set(name, value, options as Parameters<typeof redirectTo.cookies.set>[2]);
        },
        remove(name: string, options: CookieOptions) {
          redirectTo.cookies.set(name, '', { ...(options as object), maxAge: 0 } as Parameters<typeof redirectTo.cookies.set>[2]);
        },
      },
    }
  );

  // getSession() triggers _callRefreshToken() internally when the access token is
  // expired. The set() callback above saves the new tokens onto redirectTo.
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) {
    // Refresh failed (e.g. refresh token revoked) — send to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return redirectTo;
}
