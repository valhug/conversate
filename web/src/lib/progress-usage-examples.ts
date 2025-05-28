/**
 * Usage Examples for Progress Tracking Service
 * Shows how to integrate the progress tracking service with conversation components
 */

import { progressTrackingService, type ProgressConversationSession, type VocabularyItem, type ProgressUserProgress, type ProgressStats } from './progress-tracking-service';
import type { LanguageCode, CEFRLevel } from '@conversate/shared';

// Interface for analytics overview data
interface AnalyticsOverview {
  totalSessions: number;
  totalStudyTime: number;
  currentStreak: number;
  vocabularyMastered: number;
  averageComfortScore: number;
  currentLevel: string;
}

// Interface for chart data points
interface ChartDataPoint {
  date: string;
  sessions: number;
  vocabulary: number;
  studyTime: number;
}

// Interface for achievement data
interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  earnedAt?: Date;
  category: 'conversation' | 'vocabulary' | 'streak' | 'milestone' | 'special';
}

// Example 1: Starting a new conversation session
export async function startConversationWithTracking(
  userId: string,
  language: LanguageCode,
  cefrLevel: CEFRLevel,
  topic: string
): Promise<ProgressConversationSession> {
  console.log(`Starting conversation tracking for user ${userId}`);
  
  const session = progressTrackingService.startSession(userId, language, cefrLevel, topic);
  
  console.log(`Started session ${session.id} for topic: ${topic}`);
  return session;
}

// Example 2: Adding messages during conversation
export async function handleMessageWithTracking(
  sessionId: string,
  speaker: 'user' | 'ai',
  content: string,
  responseTimeMs?: number
): Promise<void> {
  const message = {
    id: generateMessageId(),
    sessionId,
    speaker,
    content,
    timestamp: new Date()
  };

  const responseTimeSeconds = responseTimeMs ? responseTimeMs / 1000 : undefined;
  
  progressTrackingService.addMessage(sessionId, message, responseTimeSeconds);
  
  console.log(`Added ${speaker} message to session ${sessionId}`);
}

// Example 3: Tracking vocabulary learned during conversation
export async function trackVocabularyLearned(
  sessionId: string,
  newWords: Array<{
    word: string;
    translation: string;
    context: string;
    difficulty: 'easy' | 'medium' | 'hard';
    partOfSpeech: string;
  }>
): Promise<void> {
  const vocabularyItems = newWords.map(word => ({
    id: generateVocabularyId(),
    word: word.word,
    translation: word.translation,
    definition: word.translation, // For compatibility
    context: word.context,
    difficulty: word.difficulty,
    partOfSpeech: word.partOfSpeech,
    metadata: {
      difficulty: word.difficulty,
      partOfSpeech: word.partOfSpeech
    }
  }));

  progressTrackingService.trackVocabulary(sessionId, vocabularyItems);
  
  console.log(`Tracked ${newWords.length} new vocabulary words`);
}

// Example 4: Ending a conversation session
export async function endConversationWithTracking(
  sessionId: string,
  comfortScore: number
): Promise<ProgressConversationSession | null> {
  console.log(`Ending session ${sessionId} with comfort score: ${comfortScore}`);
  
  const completedSession = progressTrackingService.endSession(sessionId, comfortScore);
  
  if (completedSession) {
    console.log(`Session completed:`, {
      duration: completedSession.duration,
      messagesExchanged: completedSession.messageCount,
      vocabularyLearned: completedSession.vocabularyLearned.length,
      comfortScore: completedSession.comfortScore
    });
  }
  
  return completedSession;
}

// Example 5: Getting user progress for dashboard
export async function getUserProgressForDashboard(
  userId: string,
  language: LanguageCode
): Promise<{
  progress: ProgressUserProgress;
  recentSessions: ProgressConversationSession[];
  vocabulary: VocabularyItem[];
  stats: ProgressStats;
} | null> {
  const progress = progressTrackingService.getUserProgress(userId, language);
  
  if (!progress) {
    console.log(`No progress found for user ${userId} in ${language}`);
    return null;
  }

  const recentSessions = progressTrackingService.getUserSessions(userId, language).slice(0, 5);
  const vocabulary = progressTrackingService.getUserVocabulary(userId, language);
  const stats = progressTrackingService.getProgressStats(userId, language);
  return {
    progress,
    recentSessions,
    vocabulary: vocabulary.slice(0, 20), // Recent vocabulary
    stats
  };
}

// Example 6: React Hook for conversation with progress tracking
export function useConversationWithProgress(
  userId: string,
  language: LanguageCode,
  cefrLevel: CEFRLevel,
  topic: string
) {
  let currentSession: ProgressConversationSession | null = null;

  const startConversation = async () => {
    currentSession = await startConversationWithTracking(userId, language, cefrLevel, topic);
    return currentSession;
  };
  const addMessage = async (role: 'user' | 'ai', content: string, responseTime?: number) => {
    if (!currentSession) throw new Error('No active session');
    await handleMessageWithTracking(currentSession.id, role, content, responseTime);
  };

  const addVocabulary = async (words: Array<{
    word: string;
    translation: string;
    context: string;
    difficulty: 'easy' | 'medium' | 'hard';
    partOfSpeech: string;
  }>) => {
    if (!currentSession) throw new Error('No active session');
    await trackVocabularyLearned(currentSession.id, words);
  };

  const endConversation = async (comfortScore: number) => {
    if (!currentSession) throw new Error('No active session');
    const completed = await endConversationWithTracking(currentSession.id, comfortScore);
    currentSession = null;
    return completed;
  };

  return {
    startConversation,
    addMessage,
    addVocabulary,
    endConversation,
    getCurrentSession: () => currentSession
  };
}

// Example 7: Analytics dashboard data
export async function getAnalyticsDashboardData(
  userId: string,
  language: LanguageCode
): Promise<{
  overview: AnalyticsOverview;
  chartData: ChartDataPoint[];
  achievements: Achievement[];
  vocabulary: {
    total: number;
    mastered: number;
    recent: VocabularyItem[];
  };
}> {
  const progress = progressTrackingService.getUserProgress(userId, language);
  const vocabulary = progressTrackingService.getUserVocabulary(userId, language);
  const sessions = progressTrackingService.getUserSessions(userId, language);

  // Overview metrics
  const overview: AnalyticsOverview = {
    totalSessions: progress?.conversationsCompleted || 0,
    totalStudyTime: progress?.totalStudyTime || 0,
    currentStreak: progress?.streakDays || 0,
    vocabularyMastered: vocabulary.filter(v => v.mastered).length,
    averageComfortScore: progress?.averageComfortScore || 0,
    currentLevel: progress?.currentLevel || 'A1'
  };
  // Chart data for last 30 days
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const chartData: ChartDataPoint[] = last30Days.map(date => {
    const dateStr = date.toDateString();
    const daySessions = sessions.filter(s => s.startedAt.toDateString() === dateStr);
    const dayVocab = vocabulary.filter(v => v.learnedAt.toDateString() === dateStr);
    
    return {
      date: date.toISOString().split('T')[0],
      sessions: daySessions.length,
      vocabulary: dayVocab.length,
      studyTime: daySessions.reduce((sum, s) => sum + (s.duration / 60), 0) // in minutes
    };
  });

  return {
    overview,
    chartData,
    achievements: progress?.achievements || [],
    vocabulary: {
      total: vocabulary.length,
      mastered: vocabulary.filter(v => v.mastered).length,
      recent: vocabulary
        .sort((a, b) => b.learnedAt.getTime() - a.learnedAt.getTime())
        .slice(0, 10)
    }
  };
}

// Helper functions
function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateVocabularyId(): string {
  return `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Example 8: Integration with existing conversation component
export class ConversationManager {
  private currentSession: ProgressConversationSession | null = null;

  constructor(
    private userId: string,
    private language: LanguageCode,
    private cefrLevel: CEFRLevel,
    private topic: string
  ) {}

  async startConversation() {
    this.currentSession = await startConversationWithTracking(this.userId, this.language, this.cefrLevel, this.topic);
    console.log('Conversation started with progress tracking');
    return this.currentSession;
  }

  async sendUserMessage(content: string) {
    if (!this.currentSession) throw new Error('No active session');
    
    const startTime = Date.now();
    
    // Add user message
    await handleMessageWithTracking(this.currentSession.id, 'user', content);
    
    // Simulate AI response processing
    const response = await this.getAIResponse(content);
    const responseTime = Date.now() - startTime;
      // Add AI response with response time
    await handleMessageWithTracking(this.currentSession.id, 'ai', response, responseTime);
    
    // Extract and track vocabulary if any
    const extractedVocabulary = this.extractVocabulary(response);
    if (extractedVocabulary.length > 0) {
      await trackVocabularyLearned(this.currentSession.id, extractedVocabulary);
    }
    
    return response;
  }

  async endConversation(userFeedback: { comfortScore: number }) {
    if (!this.currentSession) throw new Error('No active session');
    const completed = await endConversationWithTracking(this.currentSession.id, userFeedback.comfortScore);
    this.currentSession = null;
    console.log('Conversation ended with progress saved');
    return completed;
  }

  // Mock methods for demo
  private async getAIResponse(userMessage: string): Promise<string> {
    // This would integrate with your actual AI service
    return `AI response to: ${userMessage}`;
  }
  private extractVocabulary(text: string): Array<{
    word: string;
    translation: string;
    context: string;
    difficulty: 'easy' | 'medium' | 'hard';
    partOfSpeech: string;
  }> {
    // This would integrate with your vocabulary extraction logic
    // For now, return empty array as this is a mock implementation
    console.log(`Extracting vocabulary from: ${text.substring(0, 50)}...`);
    return [];
  }
}

// Export utility functions for easy integration
export const ProgressTrackingUtils = {
  startConversationWithTracking,
  handleMessageWithTracking,
  trackVocabularyLearned,
  endConversationWithTracking,
  getUserProgressForDashboard,
  getAnalyticsDashboardData,
  useConversationWithProgress
};
