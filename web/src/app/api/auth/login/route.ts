import { NextRequest, NextResponse } from 'next/server'
import { LoginRequest, LoginRequestSchema } from '@conversate/shared'
import { compare } from 'bcryptjs'
import { generateToken } from '@/lib/jwt-utils'
import { findUserByEmail, updateUser } from '../user-store'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validationResult = LoginRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }    const { email, password } = validationResult.data

    // Find user by email
    const user = findUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await compare(password, user.passwordHash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }    // Generate JWT token
    const token = generateToken({
      userId: user.id, 
      email: user.email,
      name: user.name,
      nativeLanguage: user.nativeLanguage,
      targetLanguages: user.targetLanguages
    })

    // Update last login time
    updateUser(user.id, { updatedAt: new Date() })    // Return success response (exclude password hash)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userResponse } = user
    
    return NextResponse.json({
      success: true,
      user: userResponse,
      token,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
