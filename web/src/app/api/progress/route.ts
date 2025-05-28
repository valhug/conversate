import { NextRequest, NextResponse } from 'next/server';
import { getUserFromHeaders } from '@/lib/jwt-utils';
import { progressTrackingService } from '@/lib/progress-tracking-service';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from middleware headers
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language');
    
    if (!language) {
      return NextResponse.json(
        { error: 'Language parameter is required' },
        { status: 400 }
      );
    }

    // Get user progress for the specified language
    const userProgress = progressTrackingService.getUserProgress(user.userId, language);
    
    if (!userProgress) {
      return NextResponse.json(
        { error: 'No progress found for this user and language' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      progress: userProgress,
      user: {
        id: user.userId,
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user progress' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from middleware headers
    const user = getUserFromHeaders(request.headers);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { language, cefrLevel, topic } = body;
    
    if (!language || !cefrLevel) {
      return NextResponse.json(
        { error: 'Language and CEFR level are required' },
        { status: 400 }
      );
    }

    // Start a new learning session
    const session = progressTrackingService.startSession(
      user.userId,
      language,
      cefrLevel,
      topic || 'general'
    );

    return NextResponse.json({
      success: true,
      session,
      message: 'Learning session started successfully'
    });

  } catch (error) {
    console.error('Progress session start error:', error);
    return NextResponse.json(
      { error: 'Failed to start learning session' },
      { status: 500 }
    );
  }
}
