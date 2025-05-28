import OpenAI from 'openai';
import { ConversationRequest, ConversationResponse, ConversationMessage, LanguageCode, VocabularyWord } from '@conversate/shared';
import { v4 as uuidv4 } from 'uuid';

class ConversationService {
  private openai: OpenAI;
  private conversationHistory: Map<string, ConversationMessage[]> = new Map();

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(request: ConversationRequest): Promise<ConversationResponse> {
    try {
      const sessionId = request.sessionId || uuidv4();
      const conversationId = request.conversationId || uuidv4();
      
      // Get conversation history
      const historyKey = `${conversationId}-${sessionId}`;
      const history = this.conversationHistory.get(historyKey) || [];
        // Add user message to history
      const userMessage: ConversationMessage = {
        id: uuidv4(),
        sessionId: sessionId,
        speaker: 'user',
        content: request.message,
        timestamp: new Date(),
      };
      history.push(userMessage);
      
      // Create system prompt based on language level and topic
      const systemPrompt = this.createSystemPrompt(request.language, request.cefrLevel, request.topic);
      
      // Prepare messages for OpenAI
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10).map(msg => ({ // Keep last 10 messages for context
          role: msg.speaker === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
      ];// Generate AI response
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages.map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        })),
        max_tokens: 150,
        temperature: 0.7,
      });

      const aiResponseContent = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
        // Add AI response to history
      const aiMessage: ConversationMessage = {
        id: uuidv4(),
        sessionId: sessionId,
        speaker: 'ai',
        content: aiResponseContent,
        timestamp: new Date(),
      };
      history.push(aiMessage);
      
      // Update conversation history
      this.conversationHistory.set(historyKey, history);
        // Extract vocabulary words (simple implementation for now)
      const vocabularyWords = this.extractVocabulary(aiResponseContent);
      
      return {
        message: aiResponseContent,
        conversationId,
        sessionId,
        vocabularyWords,
        suggestions: this.generateSuggestions(request.cefrLevel),
      };    } catch (error) {
      console.error('Error generating conversation response:', error);
      // Re-throw the original error so the API route can handle fallback logic
      throw error;
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
- Use vocabulary appropriate for the student's level`;
  }

  private extractVocabulary(text: string): VocabularyWord[] {
    // Simple vocabulary extraction - in production, this would be more sophisticated
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const uniqueWords = [...new Set(words)];
    
    // Return a few potentially useful words (this is a simplified implementation)
    return uniqueWords
      .filter(word => word.length > 4) // Filter out very short words
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

  getConversationHistory(conversationId: string, sessionId: string): ConversationMessage[] {
    const historyKey = `${conversationId}-${sessionId}`;
    return this.conversationHistory.get(historyKey) || [];
  }

  clearConversationHistory(conversationId: string, sessionId: string): void {
    const historyKey = `${conversationId}-${sessionId}`;
    this.conversationHistory.delete(historyKey);
  }
}

export const conversationService = new ConversationService();
