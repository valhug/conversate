import { ApiClient } from '@conversate/shared'
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@conversate/shared'

class AuthService {
  private apiClient: ApiClient

  constructor() {
    // Initialize API client with base URL
    const baseURL = process.env.NEXT_PUBLIC_API_URL || (
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    )
    this.apiClient = new ApiClient(`${baseURL}/api`)
  }

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<{
        success: boolean
        user: User
        token: string
        message: string
      }>('/auth/register', data)

      if (response.success && response.data) {
        // Store the auth token
        this.setAuthToken(response.data.token)
        
        return {
          success: true,
          user: response.data.user,
          accessToken: response.data.token,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          error: response.error || 'Registration failed'
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: 'Network error during registration'
      }
    }
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<{
        success: boolean
        user: User
        token: string
        message: string
      }>('/auth/login', data)

      if (response.success && response.data) {
        // Store the auth token
        this.setAuthToken(response.data.token)
        
        return {
          success: true,
          user: response.data.user,
          accessToken: response.data.token,
          message: response.data.message
        }
      } else {
        return {
          success: false,
          error: response.error || 'Login failed'
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: 'Network error during login'
      }
    }
  }

  /**
   * Logout user
   */
  logout(): void {
    this.removeAuthToken()
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login'
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getAuthToken() !== null
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  /**
   * Set auth token
   */
  private setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  /**
   * Remove auth token
   */
  private removeAuthToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  /**
   * Get current user from token (decode JWT)
   */
  getCurrentUser(): User | null {
    const token = this.getAuthToken()
    if (!token) return null

    try {
      // Decode JWT token (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        this.removeAuthToken()
        return null
      }

      return {
        id: payload.userId,
        email: payload.email,
        username: payload.name,
        nativeLanguage: payload.nativeLanguage,
        targetLanguages: payload.targetLanguages,
        subscriptionTier: 'free', // Default tier
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } catch (error) {
      console.error('Error decoding token:', error)
      this.removeAuthToken()
      return null
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService
