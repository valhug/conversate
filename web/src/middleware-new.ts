import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Define protected routes that require authentication
const protectedRoutes = [
  '/conversation',
  '/progress',
  '/api/conversation',
  '/api/progress',
]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  )

  // If it's not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // If accessing a protected route without authentication
  if (!isLoggedIn) {
    if (nextUrl.pathname.startsWith('/api/')) {
      // For API routes, return 401 Unauthorized
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    } else {
      // For page routes, redirect to login
      const loginUrl = new URL('/auth/login', nextUrl.origin)
      loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // User is authenticated, allow access
  return NextResponse.next()
})

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api/auth (Auth.js routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
}
