import { NextRequest, NextResponse } from 'next/server'
import { verify } from 'jsonwebtoken'

// JWT secret - should match the one used in auth routes
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

// Define protected routes that require authentication
const protectedRoutes = [
  '/conversation',
  '/progress',
  '/api/conversation',
  '/api/progress',
  // Add more protected routes here as needed
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // If it's not a protected route, allow access
  if (!isProtectedRoute) {
    return NextResponse.next()
  }
  
  // Get token from Authorization header or cookie
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : request.cookies.get('auth_token')?.value
  
  // If no token is found, redirect to login
  if (!token) {
    if (pathname.startsWith('/api/')) {
      // For API routes, return 401 Unauthorized
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    } else {
      // For page routes, redirect to login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  try {
    // Verify the JWT token
    const payload = verify(token, JWT_SECRET) as {
      userId: string
      email: string
      name: string
      iat: number
      exp: number
    }
    
    // Add user info to request headers for use in API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-user-email', payload.email)
    requestHeaders.set('x-user-name', payload.name)
    
    // Continue with the request, passing along user info
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
    
  } catch (error) {
    console.error('JWT verification failed:', error)
    
    if (pathname.startsWith('/api/')) {
      // For API routes, return 401 Unauthorized
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    } else {
      // For page routes, redirect to login
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
