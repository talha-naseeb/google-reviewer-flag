import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('app_session')?.value;
  const { pathname } = request.nextUrl;

  // Static files and internal Next.js paths
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Public authentication routes
  const isPublicAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password') ||
    pathname.startsWith('/api/auth');

  // If user is NOT authenticated
  if (!session) {
    // If accessing API route, return 401 JSON
    if (pathname.startsWith('/api/') && !isPublicAuthRoute) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Authentication required.' },
        { status: 401 }
      );
    }

    // If accessing any protected page, redirect to /login
    if (!isPublicAuthRoute) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user IS authenticated and trying to access auth pages, redirect to dashboard
  if (
    session &&
    (pathname === '/login' ||
      pathname === '/forgot-password' ||
      pathname === '/reset-password')
  ) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
