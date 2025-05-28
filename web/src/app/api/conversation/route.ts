import { NextRequest, NextResponse } from 'next/server';
import { conversationService } from '@/lib/conversation-service';
import { claudeConversationService } from '@/lib/claude-conversation-service';
import { mockConversationService } from '@/lib/mock-conversation-service';
import { progressTrackingService } from '@/lib/progress-tracking-service';
import { getUserFromHeaders } from '@/lib/jwt-utils';
import { ConversationRequest, ConversationMessage } from '@conversate/shared';

// Service availability checks
const hasClaudeKey = process.env.ANTHROPIC_API_KEY && 
                    process.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here';

const hasOpenAIKey = process.env.OPENAI_API_KEY && 
                    process.env.OPENAI_API_KEY !== 'your_actual_openai_api_key_here' &&
                    process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';

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

    const body: ConversationRequest = await request.json();
    
    // Validate required fields
    if (!body.message || !body.language || !body.cefrLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: message, language, or cefrLevel' },
        { status: 400 }
      );
    }

    let response;
    let serviceName = '';
    
    // Try services in priority order: Claude > OpenAI > Mock
    if (hasClaudeKey) {
      try {
        console.log('Attempting Claude conversation service...');
        response = await claudeConversationService.generateResponse(body);
        serviceName = 'Claude';
      } catch (error) {
        console.warn('Claude service failed, trying OpenAI:', error);
        
        if (hasOpenAIKey) {
          try {
            response = await conversationService.generateResponse(body);
            serviceName = 'OpenAI';
          } catch (openAIError) {
            console.warn('OpenAI service failed, falling back to mock:', openAIError);
            response = await mockConversationService.generateResponse(body);
            serviceName = 'Mock';
          }
        } else {
          response = await mockConversationService.generateResponse(body);
          serviceName = 'Mock';
        }
      }
    } else if (hasOpenAIKey) {
      try {
        console.log('Attempting OpenAI conversation service...');
        response = await conversationService.generateResponse(body);
        serviceName = 'OpenAI';
      } catch (error) {
        console.warn('OpenAI service failed, falling back to mock:', error);
        response = await mockConversationService.generateResponse(body);
        serviceName = 'Mock';
      }    } else {
      // No API keys available, use mock service
      console.log('No API keys available, using mock service');
      response = await mockConversationService.generateResponse(body);
      serviceName = 'Mock';
    }
    
    console.log(`Conversation handled by: ${serviceName}`);
      // Track progress after successful conversation
    try {
      // Use authenticated user ID from middleware
      const userId = user.userId;
      const topic = body.topic || 'daily_life'; // Default topic if not provided
      
      // Always try to start session (it will handle duplicates internally)
      const session = progressTrackingService.startSession(
        userId,
        body.language,
        body.cefrLevel,
        topic
      );// Track the user message
      const userMessage: ConversationMessage = {
        id: `msg_${Date.now()}_user`,
        sessionId: body.sessionId || session.id,
        speaker: 'user' as const,
        content: body.message,
        timestamp: new Date()
      };
      progressTrackingService.addMessage(session.id, userMessage);
      
      // Track the AI response
      const aiMessage: ConversationMessage = {
        id: `msg_${Date.now()}_ai`,
        sessionId: body.sessionId || session.id,
        speaker: 'ai' as const,
        content: response.message,
        timestamp: new Date()
      };
      progressTrackingService.addMessage(session.id, aiMessage);
      
    } catch (progressError) {
      console.warn('Progress tracking failed:', progressError);
      // Don't fail the main conversation if progress tracking fails
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Conversation API error:', error);
    return NextResponse.json(
      { error: 'Failed to process conversation request' },
      { status: 500 }
    );
  }
}

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
    const conversationId = searchParams.get('conversationId');
    const sessionId = searchParams.get('sessionId');
    
    if (!conversationId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameters: conversationId or sessionId' },
        { status: 400 }
      );
    }

    // Get history from the appropriate service (priority: Claude > OpenAI > Mock)
    let service;
    if (hasClaudeKey) {
      service = claudeConversationService;
    } else if (hasOpenAIKey) {
      service = conversationService;
    } else {
      service = mockConversationService;
    }
    
    const history = service.getConversationHistory(conversationId, sessionId);
    
    return NextResponse.json({ history });
  } catch (error) {
    console.error('Conversation history API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conversation history' },
      { status: 500 }
    );
  }
}
