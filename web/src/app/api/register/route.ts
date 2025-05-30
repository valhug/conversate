import { NextRequest, NextResponse } from 'next/server'
import { RegisterRequestSchema } from '@conversate/shared'
import { hash } from 'bcryptjs'
import { userService } from '@/lib/database'
import { syncUserFromRegistration } from '../auth/user-store'

// In production, these would come from environment variables
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
    const existingUser = await userService.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hash(password, SALT_ROUNDS)    // Create new user using database service
    const newUser = await userService.create({
      name,
      email: email.toLowerCase(),
      hashedPassword: passwordHash,
      nativeLanguage,
      targetLanguage: targetLanguages[0] || 'es', // Use first target language as primary
    })    // Update user with learning goals (multiple target languages)
    const updatedUser = await userService.update(newUser.id, {
      learningGoals: targetLanguages,
    })

    // Sync user to Edge Runtime compatible user-store for Auth.js
    syncUserFromRegistration({
      email: updatedUser.email,
      name: updatedUser.name || '',
      hashedPassword: passwordHash,
      nativeLanguage: updatedUser.nativeLanguage,
      targetLanguages: updatedUser.learningGoals,
    })

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        nativeLanguage: updatedUser.nativeLanguage,
        targetLanguages: updatedUser.learningGoals,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
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
