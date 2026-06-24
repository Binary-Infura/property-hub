import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set([
  'signin',
  'register',
  'search',
  'reels',
  'partners',
  'api',
  '_next',
  'favicon.ico',
  'sw.js',
  'manifest.json',
  'apple-icon.png',
  'logo.png',
]);

const ROLE_SLUG_MAP: Record<string, string> = {
  'BUYER': 'buyer',
  'CONSULTANT': 'consultant',
  'PROPERTY_PARTNER': 'property-partner',
  'LOAN_PARTNER': 'loan-partner',
  'CENTRAL_AUTHORITY': 'central-authority',
  'GROWTH_PARTNER': 'growth-partner',
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  // 1. Skip if it's a known public path or asset
  if (firstSegment && PUBLIC_PATHS.has(firstSegment)) {
    return NextResponse.next();
  }

  // 2. Get the role from the cookie or fall back to decoding the JWT token
  let userRole = request.cookies.get('user_role')?.value;

  if (!userRole) {
    const authToken = request.cookies.get('auth_token')?.value;
    if (authToken) {
      try {
        const payloadBase64 = authToken.split('.')[1];
        if (payloadBase64) {
          const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
          const payloadJson = atob(base64);
          const payload = JSON.parse(payloadJson);
          userRole = payload.activeRole;
          console.log(`Middleware: Recovered role "${userRole}" from JWT token`);
        }
      } catch (e) {
        console.error('Middleware: Failed to decode auth_token', e);
      }
    }
  }

  // 3. If no role can be determined, block access to protected areas
  if (!userRole) {
    const isProtectedPath = pathname.startsWith('/dashboard') || 
                            pathname === '/my-dashboards' || 
                            Object.values(ROLE_SLUG_MAP).some(slug => pathname.startsWith(`/${slug}`));
    
    if (isProtectedPath) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    return NextResponse.next();
  }

  // 4. Handle Rewriting for /dashboard
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    
    // Fallback if no role cookie is present - default to BUYER as a graceful fallback
    // This avoids 404s when the role cookie hasn't synced yet.
    const effectiveRole = userRole || 'BUYER';
    
    // Special case for shared pages to avoid 404 and allow cross-role access
    const sharedPaths = ['/dashboard/search', '/dashboard/loan', '/dashboard/saved', '/dashboard/inquiries', '/dashboard/documents', '/dashboard/profile', '/dashboard/organization'];
    const isShared = sharedPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

    // Determine the role slug for internal routing
    // For shared pages, we always use 'shared' as the canonical home
    const roleSlug = isShared ? 'shared' : ROLE_SLUG_MAP[effectiveRole];

    if (roleSlug) {
      // Rewrite /dashboard/:path* to internal structure
      const pathSuffix = pathname.replace('/dashboard', '');
      
      // If pathSuffix is empty, we are at root /dashboard -> serve from /${roleSlug}/dashboard
      // Otherwise (e.g., /reviews), serve from /${roleSlug}/reviews (flattened)
      const internalPath = pathSuffix === '' || pathSuffix === '/'
        ? `/${roleSlug}` 
        : `/${roleSlug}${pathSuffix}`;
      
      console.log(`Middleware: [${effectiveRole}${userRole ? '' : ' (Fallback)'}] Rewriting ${pathname} -> ${internalPath}`);
      return NextResponse.rewrite(new URL(internalPath, request.url));
    } else {
      console.warn(`Middleware: No role slug found for ${effectiveRole}. Path: ${pathname}`);
    }
  }

  // 5. Cleanup: if user manually enters role-specific URLs, redirect to clean URL
  const currentRoleSlug = userRole ? ROLE_SLUG_MAP[userRole] : null;
  if (currentRoleSlug && (pathname.startsWith(`/${currentRoleSlug}/dashboard`) || pathname === `/${currentRoleSlug}`)) {
    const cleanPath = pathname.replace(`/${currentRoleSlug}`, '');
    const finalPath = cleanPath === '' ? '/dashboard' : cleanPath;
    console.log(`Middleware: Redirecting legacy/manual path ${pathname} -> ${finalPath}`);
    return NextResponse.redirect(new URL(finalPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
