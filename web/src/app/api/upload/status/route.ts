import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID required' },
        { status: 400 }
      );
    }

    // In production, this would query from database
    // For demo, return mock processing status
    const mockStatuses = ['processing', 'completed', 'failed'];
    const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];

    return NextResponse.json({
      fileId,
      processingStatus: randomStatus,
      progress: randomStatus === 'processing' ? Math.floor(Math.random() * 100) : 100,
      conversations: randomStatus === 'completed' ? [
        {
          id: 'conv_1',
          title: 'Introduction Segment',
          content: 'Hello, welcome to our conversation practice. Today we will discuss various topics to help you improve your language skills.',
          difficulty: 2,
          vocabulary: ['welcome', 'conversation', 'practice', 'improve', 'skills']
        },
        {
          id: 'conv_2', 
          title: 'Discussion Segment',
          content: 'Language learning requires consistent practice and exposure to different contexts. What are your favorite methods for practicing?',
          difficulty: 3,
          vocabulary: ['requires', 'consistent', 'exposure', 'contexts', 'methods']
        }
      ] : [],
      message: `File ${randomStatus}`,
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check processing status' },
      { status: 500 }
    );
  }
}
