import { type NextRequest, NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = ['/questions/new', '/questions/*/edit', '/profile', '/admin'];

// Define routes that require specific user types
const roleRestrictedRoutes: Record<string, string[]> = {
  '/questions/new': ['CUSTOMER', 'ANSWERER'],
  '/admin': ['ADMIN'],
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the route requires authentication
  const isProtected = protectedRoutes.some((route) => {
    const routeRegex = new RegExp(`^${route.replace(/\*/g, '[^/]+')}/?$`);
    return routeRegex.test(pathname);
  });

  if (!isProtected) {
    return NextResponse.next();
  }

  // Check for user session
  const authToken = request.cookies.get('sb-auth-token')?.value;

  if (!authToken) {
    // Redirect to login with return URL
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  // If authenticated, allow the request
  return NextResponse.next();
}

// Configure which routes should be processed by middleware
export const config = {
  matcher: [
    // Match all routes except static files and API routes we want to exclude
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
