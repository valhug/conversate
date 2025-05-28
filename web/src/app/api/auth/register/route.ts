import { NextRequest, NextResponse } from 'next/server'
import { RegisterRequest, RegisterRequestSchema } from '@conversate/shared'
import { hash } from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import { User, findUserByEmail, addUser } from '../user-store'

// In production, these would come from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const SALT_ROUNDS = 12

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request data
    const validationResult = RegisterRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }    const { name, email, password, nativeLanguage, targetLanguages } = validationResult.data

    // Check if user already exists
    const existingUser = findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hash(password, SALT_ROUNDS)

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email: email.toLowerCase(),
      passwordHash,
      nativeLanguage,
      targetLanguages,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Store user (in production, save to database)
    addUser(newUser)

    // Generate JWT token
    const token = sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        name: newUser.name,
        nativeLanguage: newUser.nativeLanguage,
        targetLanguages: newUser.targetLanguages
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Return success response (exclude password hash)
    const { passwordHash: _, ...userResponse } = newUser
    
    return NextResponse.json({
      success: true,
      user: userResponse,
      token,
      message: 'Registration successful'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
