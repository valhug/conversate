import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { progressTrackingService } from '@/lib/progress-tracking-service';
import { LanguageCode } from '@conversate/shared';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Auth.js session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') as LanguageCode;
    
    if (!language) {
      return NextResponse.json(
        { error: 'Language parameter is required' },
        { status: 400 }
      );
    }    // Get user progress for the specified language
    const userProgress = progressTrackingService.getUserProgress(session.user.id, language);
    
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
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
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
    // Get authenticated user from Auth.js session
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }    const body = await request.json();
    const { language, cefrLevel, topic } = body;
    
    if (!language || !cefrLevel) {
      return NextResponse.json(
        { error: 'Language and CEFR level are required' },
        { status: 400 }
      );
    }

    // Start a new learning session
    const learningSession = progressTrackingService.startSession(
      session.user.id,
      language as LanguageCode,
      cefrLevel,
      topic || 'general'
    );

    return NextResponse.json({
      success: true,
      session: learningSession,
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
