import { verify, sign } from 'jsonwebtoken'

// JWT secret - should match the one used in auth routes
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'

export interface JWTPayload {
  userId: string
  email: string
  name: string
  nativeLanguage: string
  targetLanguages: string[]
  iat?: number
  exp?: number
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return sign(payload, JWT_SECRET, { expiresIn: '24h' })
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload {
  return verify(token, JWT_SECRET) as JWTPayload
}

/**
 * Extract user ID from request headers (set by middleware)
 */
export function getUserFromHeaders(headers: Headers): {
  userId: string
  email: string
  name: string
} | null {
  const userId = headers.get('x-user-id')
  const email = headers.get('x-user-email')
  const name = headers.get('x-user-name')
  
  if (!userId || !email || !name) {
    return null
  }
  
  return { userId, email, name }
}

/**
 * Check if a token is expired (client-side helper)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp && payload.exp < Date.now() / 1000
  } catch {
    return true
  }
}
