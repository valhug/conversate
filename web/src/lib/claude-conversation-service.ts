import Anthropic from '@anthropic-ai/sdk';
import { ConversationRequest, ConversationResponse, ConversationMessage, LanguageCode, VocabularyWord } from '@conversate/shared';
import { v4 as uuidv4 } from 'uuid';
import { conversationService as dbConversationService, messageService } from './database';

class ClaudeConversationService {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async generateResponse(request: ConversationRequest, userId?: string): Promise<ConversationResponse> {
    try {
      const sessionId = request.sessionId || uuidv4();
      let conversationId = request.conversationId;
      
      // Create or get conversation from database
      if (!conversationId && userId) {
        const conversation = await dbConversationService.create(userId, {
          title: request.topic || 'New Conversation',
          language: request.language,
          level: request.cefrLevel,
          aiProvider: 'anthropic'
        });
        conversationId = conversation.id;
      }
      
      // Get conversation history from database
      const history = conversationId ? await messageService.findByConversationId(conversationId) : [];
      
      // Add user message to database
      if (conversationId) {
        await messageService.create(conversationId, {
          role: 'USER',
          content: request.message,
        });
      }
      
      // Create system prompt based on language level and topic
      const systemPrompt = this.createSystemPrompt(request.language, request.cefrLevel, request.topic);
        // Prepare messages for Claude
      const messages: Anthropic.Messages.MessageParam[] = [
        ...history.slice(-10).map(msg => ({
          role: (msg.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: request.message,
        }
      ];

      // Generate AI response
      const completion = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        temperature: 0.7,
        system: systemPrompt,
        messages,
      });      const aiResponseContent = completion.content[0]?.type === 'text'
        ? completion.content[0].text 
        : 'I apologize, but I couldn\'t generate a response. Please try again.';
      
      // Add AI response to database
      if (conversationId) {
        await messageService.create(conversationId, {
          role: 'ASSISTANT',
          content: aiResponseContent,
        });
      }
      
      // Extract vocabulary words
      const vocabularyWords = this.extractVocabulary(aiResponseContent);
        return {
        message: aiResponseContent,
        conversationId: conversationId || uuidv4(),
        sessionId,
        vocabularyWords,
        suggestions: this.generateSuggestions(request.cefrLevel),
      };
    } catch (error) {
      console.error('Error generating Claude conversation response:', error);
      throw error; // Re-throw to allow fallback handling
    }
  }

  private createSystemPrompt(language: LanguageCode, level: string, topic?: string): string {
    const languageMap: Record<LanguageCode, string> = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'tl': 'Tagalog',
    };

    const languageName = languageMap[language] || 'English';
    const topicContext = topic ? ` about ${topic.replace('-', ' ')}` : '';
    
    return `You are a friendly and encouraging language learning assistant. You're having a conversation in ${languageName} with a student at ${level} level${topicContext}. 

Guidelines:
- Keep your responses appropriate for ${level} level learners
- Use simple, clear language for A1-A2, gradually increase complexity for higher levels
- Be encouraging and patient
- Ask follow-up questions to keep the conversation flowing
- Correct mistakes gently when necessary
- Stay in character as a helpful conversation partner
- Keep responses to 1-2 sentences for A1-A2, up to 3-4 sentences for higher levels
- Use vocabulary appropriate for the student's level
- Focus on helping the student practice speaking naturally
- Be culturally aware and sensitive when discussing topics`;
  }

  private extractVocabulary(text: string): VocabularyWord[] {
    // Enhanced vocabulary extraction for Claude
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = [...new Set(words)];
    
    // Return potentially useful words for language learning
    return uniqueWords
      .filter(word => word.length > 4 && word.length < 12) // Focus on medium-length words
      .filter(word => !/^(the|and|for|are|but|not|you|all|can|had|her|was|one|our|out|day|get|has|him|his|how|its|may|new|now|old|see|two|way|who|boy|did|use|first|good|just|like|long|make|many|over|such|take|than|them|well|were)$/.test(word)) // Filter common words
      .slice(0, 3)
      .map(word => ({
        word,
        translation: '', // Would be filled by translation service
        context: text,
        difficulty: 'medium',
        partOfSpeech: 'unknown',
      }));
  }

  private generateSuggestions(level: string): string[] {
    const suggestions: Record<string, string[]> = {
      'A1': [
        'Tell me about your family',
        'What do you like to eat?',
        'Where are you from?',
        'What is your hobby?',
      ],
      'A2': [
        'Describe your typical day',
        'What did you do last weekend?',
        'Tell me about your job or studies',
        'What are your plans for the future?',
      ],
      'B1': [
        'What do you think about this topic?',
        'Can you explain your opinion in more detail?',
        'How does this compare to your country?',
        'What would you do in this situation?',
      ],
      'B2': [
        'Let\'s discuss the pros and cons',
        'How has this changed over time?',
        'What are the implications of this?',
        'Can you analyze this from different perspectives?',
      ],
      'C1': [
        'Let\'s explore the nuances of this issue',
        'How would you argue for the opposing view?',
        'What are the underlying assumptions here?',
        'Can you elaborate on the complexities involved?',
      ],
      'C2': [
        'Let\'s examine the philosophical implications',
        'How does this reflect broader societal trends?',
        'What are the subtle distinctions we should consider?',
        'Can you articulate the most sophisticated counterargument?',
      ],
    };

    return suggestions[level] || suggestions['A1'];
  }
  async getConversationHistory(conversationId: string): Promise<ConversationMessage[]> {
    try {
      const messages = await messageService.findByConversationId(conversationId);
      return messages.map(msg => ({
        id: msg.id,
        sessionId: conversationId, // Use conversationId as sessionId for compatibility
        speaker: msg.role === 'USER' ? 'user' : 'ai',
        content: msg.content,
        timestamp: msg.timestamp,
      }));
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return [];
    }
  }

  async clearConversationHistory(conversationId: string): Promise<void> {
    try {
      await messageService.deleteByConversationId(conversationId);
    } catch (error) {
      console.error('Error clearing conversation history:', error);
    }
  }
}

export const claudeConversationService = new ClaudeConversationService();