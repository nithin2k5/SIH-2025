import { NextResponse } from 'next/server';
import { USER_ROLES } from './types/index.js';

// Protected routes and their required roles
const protectedRoutes = {
  '/dashboard': [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.HOSTEL_WARDEN, USER_ROLES.STUDENT],
  '/admin': [USER_ROLES.ADMIN],
  '/admissions': [USER_ROLES.ADMIN, USER_ROLES.STAFF],
  '/fees': [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.STUDENT],
  '/hostel': [USER_ROLES.ADMIN, USER_ROLES.HOSTEL_WARDEN, USER_ROLES.STUDENT],
  '/exams': [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.STUDENT],
  '/staff': [USER_ROLES.STAFF],
  '/debug': [USER_ROLES.ADMIN, USER_ROLES.STAFF, USER_ROLES.HOSTEL_WARDEN, USER_ROLES.STUDENT]
};

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow access to auth pages and root page
  if (pathname.startsWith('/auth/') || pathname === '/') {
    return NextResponse.next();
  }

  // Check if the route is protected
  const requiredRoles = Object.entries(protectedRoutes).find(([route]) =>
    pathname.startsWith(route)
  )?.[1];

  if (requiredRoles) {
    // For development, we'll be more permissive and rely on client-side auth
    // In production, you'd verify JWT tokens here
    const userCookie = request.cookies.get('erp-user');

    // If no user cookie, redirect to login
    if (!userCookie) {
      console.log(`Redirecting to login: no cookie found for ${pathname}`);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      // Decode the cookie value (it might be URL encoded)
      const decodedValue = decodeURIComponent(userCookie.value);
      const user = JSON.parse(decodedValue);
      console.log(`User found in cookie: ${user.email} (${user.role})`);

      // If user doesn't have required role, redirect to login (not to their dashboard to avoid loops)
      if (!requiredRoles.includes(user.role)) {
        console.log(`User role ${user.role} not authorized for ${pathname}, redirecting to login`);
        return NextResponse.redirect(new URL('/auth/login', request.url));
      }

      console.log(`Access granted to ${pathname} for user ${user.email}`);
    } catch (error) {
      // If cookie is invalid, redirect to login
      console.error('Invalid user cookie:', error);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

function getRoleDashboard(role) {
  switch (role) {
    case USER_ROLES.ADMIN:
      return '/admin';
    case USER_ROLES.STAFF:
      return '/staff';
    case USER_ROLES.HOSTEL_WARDEN:
      return '/hostel';
    case USER_ROLES.STUDENT:
      return '/dashboard';
    default:
      return '/auth/login';
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/admissions/:path*',
    '/fees/:path*',
    '/hostel/:path*',
    '/exams/:path*',
    '/staff/:path*',
    '/debug/:path*'
  ]
};
