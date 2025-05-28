/**
 * Progress Tracking Service for Conversate Language Learning
 * Tracks user progress, vocabulary learned, conversation metrics, and achievements
 */

import type { 
  ConversationMessage,
  VocabularyWord as BaseVocabularyWord
} from '@conversate/shared';
import type { LanguageCode, CEFRLevel } from '@conversate/shared';

// Progress tracking specific interfaces
export interface ProgressConversationSession {
  id: string;
  conversationId: string;
  userId: string;
  language: LanguageCode;
  cefrLevel: CEFRLevel;
  topic: string;
  messages: ConversationMessage[];
  startedAt: Date;
  completedAt?: Date;
  comfortScore?: number; // 1-10 scale
  vocabularyLearned: string[];
  performanceMetrics: {
    responseTime: number; // average in seconds
    messagesExchanged: number;
    wordsLearned: number;
    confidenceLevel: number; // 1-10 scale
  };
  duration: number; // in seconds
  messageCount: number;
  userMessageCount: number;
  aiMessageCount: number;
  averageResponseTime: number;
  grammarPatterns: string[];
}

export interface VocabularyItem extends BaseVocabularyWord {
  language: LanguageCode;
  learnedAt: Date;
  practiceCount: number;
  lastPracticed: Date;
  mastered: boolean;
  topic: string;
}

export interface ProgressUserProgress {
  userId: string;
  language: LanguageCode;
  currentLevel: CEFRLevel;
  conversationsCompleted: number;
  totalStudyTime: number; // in minutes
  vocabularyMastered: number;
  averageComfortScore: number;
  streakDays: number;
  lastStudiedAt: Date;
  cefrLevel: CEFRLevel;
  totalSessions: number;
  totalMessagesSent: number;
  totalTimeSpent: number; // in seconds
  masteredWords: number;
  levelProgress: number; // percentage 0-100
  achievements: Achievement[];
  // Extended properties for settings and dashboard
  dailyGoal?: number;
  weeklyGoal?: number;
  targetLevel?: CEFRLevel;
  reminderTime?: string;
  enableNotifications?: boolean;
  preferredTopics?: string[];
  studyDays?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconUrl: string;
  earnedAt?: Date;
  category: 'conversation' | 'vocabulary' | 'streak' | 'milestone' | 'special';
}

export interface ProgressStats {
  daily: DailyStats;
  weekly: WeeklyStats;
  monthly: MonthlyStats;
  allTime: AllTimeStats;
}

export interface DailyStats {
  date: Date;
  sessionsCompleted: number;
  wordsLearned: number;
  timeSpent: number;
  averageComfortScore: number;
}

export interface WeeklyStats {
  weekStarting: Date;
  sessionsCompleted: number;
  wordsLearned: number;
  timeSpent: number;
  averageComfortScore: number;
  mostActiveDay: string;
  topTopic: string;
}

export interface MonthlyStats {
  month: Date;
  sessionsCompleted: number;
  wordsLearned: number;
  timeSpent: number;
  averageComfortScore: number;
  topicsExplored: string[];
  levelProgression: number;
}

export interface AllTimeStats {
  totalSessions: number;
  totalWordsLearned: number;
  totalTimeSpent: number;
  languagesStudied: string[];
  currentStreak: number;
  longestStreak: number;
  achievementsUnlocked: number;
}

export class ProgressTrackingService {
  private readonly STORAGE_PREFIX = 'conversate_progress_';

  /**
   * Start a new conversation session for progress tracking
   */
  startSession(
    userId: string,
    language: LanguageCode,
    cefrLevel: CEFRLevel,
    topic: string
  ): ProgressConversationSession {
    const session: ProgressConversationSession = {
      id: this.generateId(),
      conversationId: this.generateId(),
      userId,
      language,
      cefrLevel,
      topic,
      messages: [],
      startedAt: new Date(),
      vocabularyLearned: [],
      performanceMetrics: {
        responseTime: 0,
        messagesExchanged: 0,
        wordsLearned: 0,
        confidenceLevel: 5
      },
      duration: 0,
      messageCount: 0,
      userMessageCount: 0,
      aiMessageCount: 0,
      averageResponseTime: 0,
      grammarPatterns: []
    };

    this.saveSession(session);
    this.updateDailyStats(userId, language);
    return session;
  }

  /**
   * Update an existing session with new data
   */
  updateSession(sessionId: string, updates: Partial<ProgressConversationSession>): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    const updatedSession: ProgressConversationSession = {
      ...session,
      ...updates
    };

    this.saveSession(updatedSession);
  }

  /**
   * End a conversation session and calculate final metrics
   */
  endSession(sessionId: string, finalComfortScore?: number): ProgressConversationSession | null {
    const session = this.getSession(sessionId);
    if (!session) return null;

    const endTime = new Date();
    const duration = (endTime.getTime() - session.startedAt.getTime()) / 1000;

    const completedSession: ProgressConversationSession = {
      ...session,
      completedAt: endTime,
      duration,
      comfortScore: finalComfortScore || session.comfortScore,
      performanceMetrics: {
        ...session.performanceMetrics,
        messagesExchanged: session.messageCount
      }
    };

    this.saveSession(completedSession);
    this.updateUserProgress(session.userId, session.language, completedSession);
    this.checkAchievements(session.userId, session.language);

    return completedSession;
  }

  /**
   * Add a message to the session and update metrics
   */
  addMessage(sessionId: string, message: ConversationMessage, responseTime?: number): void {
    const session = this.getSession(sessionId);
    if (!session) return;    const updatedSession: ProgressConversationSession = {
      ...session,
      messages: [...session.messages, message],
      messageCount: session.messageCount + 1,
      userMessageCount: message.speaker === 'user' ? session.userMessageCount + 1 : session.userMessageCount,
      aiMessageCount: message.speaker === 'ai' ? session.aiMessageCount + 1 : session.aiMessageCount,
      averageResponseTime: responseTime ? 
        (session.averageResponseTime * session.messageCount + responseTime) / (session.messageCount + 1) :
        session.averageResponseTime
    };

    this.saveSession(updatedSession);
  }

  /**
   * Track vocabulary learned in a session
   */
  trackVocabulary(sessionId: string, vocabulary: BaseVocabularyWord[]): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    const existingVocabulary = this.getUserVocabulary(session.userId, session.language);
    const vocabularyItems: VocabularyItem[] = vocabulary.map(item => ({
      ...item,
      language: session.language,
      learnedAt: new Date(),
      practiceCount: 1,
      lastPracticed: new Date(),
      mastered: false,
      topic: session.topic
    }));

    // Deduplicate vocabulary
    const newVocabulary = vocabularyItems.filter(item => 
      !existingVocabulary.some((existing: VocabularyItem) => existing.word === item.word)
    );

    const allVocabulary = [...existingVocabulary, ...newVocabulary];
    this.saveUserVocabulary(session.userId, session.language, allVocabulary);

    // Update session with new vocabulary
    const updatedSession: ProgressConversationSession = {
      ...session,
      vocabularyLearned: [...session.vocabularyLearned, ...newVocabulary.map(v => v.word)]
    };

    this.saveSession(updatedSession);
  }
  /**
   * Get user's current progress for a language
   */  getUserProgress(userId: string, language: LanguageCode): ProgressUserProgress | null {
    const key = `${this.STORAGE_PREFIX}progress_${userId}_${language}`;
    
    // Check if running in browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      // Return demo data for server-side or when localStorage unavailable
      return this.createDemoProgress(userId, language);
    }
    
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      // Return demo data for new users
      return this.createDemoProgress(userId, language);
    }

    const progress = JSON.parse(stored);
    // Convert date strings back to Date objects
    return {
      ...progress,
      lastStudiedAt: new Date(progress.lastStudiedAt),
      achievements: progress.achievements.map((a: Achievement) => ({
        ...a,
        earnedAt: a.earnedAt ? new Date(a.earnedAt) : undefined
      }))
    };
  }

  /**
   * Create demo progress data for new users
   */
  private createDemoProgress(userId: string, language: LanguageCode): ProgressUserProgress {
    return {
      userId,
      language,
      currentLevel: 'A2' as CEFRLevel,
      conversationsCompleted: 7,
      totalStudyTime: 120, // 2 hours in minutes
      vocabularyMastered: 45,
      averageComfortScore: 7.2,
      streakDays: 3,
      lastStudiedAt: new Date(),
      cefrLevel: 'A2' as CEFRLevel,
      totalSessions: 7,
      totalMessagesSent: 89,
      totalTimeSpent: 7200, // 2 hours in seconds
      masteredWords: 45,
      levelProgress: 70, // 70% through A2 level
      achievements: [
        {
          id: 'first_conversation',
          title: 'First Steps',
          description: 'Completed your first conversation',
          iconUrl: '🌟',
          earnedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
          category: 'milestone'
        },
        {
          id: 'five_conversations',
          title: 'Getting Comfortable',
          description: 'Completed 5 conversations',
          iconUrl: '🎯',
          earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          category: 'milestone'
        },
        {
          id: 'streak_3',
          title: '3-Day Streak',
          description: 'Practiced for 3 consecutive days',
          iconUrl: '🔥',
          earnedAt: new Date(),
          category: 'streak'
        }
      ]
    };
  }
  /**
   * Get user's vocabulary for a specific language
   */
  getUserVocabulary(userId: string, language: LanguageCode): VocabularyItem[] {
    const key = `${this.STORAGE_PREFIX}vocabulary_${userId}_${language}`;
    
    // Check if running in browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return []; // Return empty array for server-side
    }
    
    const stored = localStorage.getItem(key);
    if (!stored) return [];

    const vocabulary = JSON.parse(stored);
    return vocabulary.map((item: VocabularyItem) => ({
      ...item,
      learnedAt: new Date(item.learnedAt),
      lastPracticed: new Date(item.lastPracticed)
    }));
  }
  /**
   * Get user's session history
   */
  getUserSessions(userId: string, language?: LanguageCode): ProgressConversationSession[] {
    const sessions: ProgressConversationSession[] = [];
    const prefix = `${this.STORAGE_PREFIX}session_`;

    // Check if running in browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return []; // Return empty array for server-side
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        const session = JSON.parse(localStorage.getItem(key)!);
        if (session.userId === userId && (!language || session.language === language)) {
          sessions.push({
            ...session,
            startedAt: new Date(session.startedAt),
            completedAt: session.completedAt ? new Date(session.completedAt) : undefined
          });
        }
      }
    }

    return sessions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }
  /**
   * Get comprehensive progress statistics
   */
  getProgressStats(userId: string, language: LanguageCode): ProgressStats {
    const sessions = this.getUserSessions(userId, language);
    const vocabulary = this.getUserVocabulary(userId, language);

    // If no real data exists, return demo stats
    if (sessions.length === 0) {
      return this.createDemoStats();
    }

    return {
      daily: this.getDailyStats(sessions, vocabulary),
      weekly: this.getWeeklyStats(sessions, vocabulary),
      monthly: this.getMonthlyStats(sessions, vocabulary),
      allTime: this.getAllTimeStats(sessions, vocabulary)
    };
  }

  /**
   * Create demo statistics for new users
   */
  private createDemoStats(): ProgressStats {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    return {
      daily: {
        date: today,
        sessionsCompleted: 1,
        wordsLearned: 8,
        timeSpent: 1800, // 30 minutes
        averageComfortScore: 7.5
      },
      weekly: {
        weekStarting: weekStart,
        sessionsCompleted: 4,
        wordsLearned: 32,
        timeSpent: 5400, // 1.5 hours
        averageComfortScore: 7.2,
        mostActiveDay: 'Tuesday',
        topTopic: 'family'
      },
      monthly: {
        month: monthStart,
        sessionsCompleted: 7,
        wordsLearned: 45,
        timeSpent: 7200, // 2 hours
        averageComfortScore: 7.2,
        topicsExplored: ['family', 'food', 'travel', 'hobbies'],
        levelProgression: 20 // Made 20% progress through current level
      },
      allTime: {
        totalSessions: 7,
        totalWordsLearned: 45,
        totalTimeSpent: 7200, // 2 hours
        languagesStudied: ['en'],
        currentStreak: 3,
        longestStreak: 5,
        achievementsUnlocked: 3
      }
    };
  }

  // Private helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  private getSession(sessionId: string): ProgressConversationSession | null {
    const key = `${this.STORAGE_PREFIX}session_${sessionId}`;
    
    // Check if running in browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return null; // Return null for server-side
    }
    
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const session = JSON.parse(stored);
    return {
      ...session,
      startedAt: new Date(session.startedAt),
      completedAt: session.completedAt ? new Date(session.completedAt) : undefined
    };
  }
  private saveSession(session: ProgressConversationSession): void {
    // Check if running in browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      const key = `${this.STORAGE_PREFIX}session_${session.id}`;
      localStorage.setItem(key, JSON.stringify(session));
    }
    // On server side, we'll skip localStorage operations
    // In a real app, this would save to a database
  }

  private updateUserProgress(userId: string, language: LanguageCode, session: ProgressConversationSession): void {
    const existing = this.getUserProgress(userId, language);
    const vocabulary = this.getUserVocabulary(userId, language);

    const progress: ProgressUserProgress = {
      userId,
      language,
      currentLevel: session.cefrLevel,
      conversationsCompleted: (existing?.conversationsCompleted || 0) + 1,
      totalStudyTime: (existing?.totalStudyTime || 0) + Math.round(session.duration / 60),
      vocabularyMastered: vocabulary.filter((v: VocabularyItem) => v.mastered).length,
      averageComfortScore: session.comfortScore || 5,
      streakDays: this.calculateStreak(userId, language),
      lastStudiedAt: new Date(),
      cefrLevel: session.cefrLevel,
      totalSessions: (existing?.totalSessions || 0) + 1,
      totalMessagesSent: (existing?.totalMessagesSent || 0) + session.userMessageCount,
      totalTimeSpent: (existing?.totalTimeSpent || 0) + session.duration,
      masteredWords: vocabulary.filter((v: VocabularyItem) => v.mastered).length,
      levelProgress: this.calculateLevelProgress(existing?.conversationsCompleted || 0),
      achievements: existing?.achievements || []    };

    const key = `${this.STORAGE_PREFIX}progress_${userId}_${language}`;
    // Check if running in browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(progress));
    }
  }

  private saveUserVocabulary(userId: string, language: LanguageCode, vocabulary: VocabularyItem[]): void {
    const key = `${this.STORAGE_PREFIX}vocabulary_${userId}_${language}`;
    // Check if running in browser environment
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(vocabulary));
    }
  }
  private updateDailyStats(userId: string, language: LanguageCode): void {
    // Implementation for daily stats tracking
    const today = new Date().toDateString();
    const key = `${this.STORAGE_PREFIX}daily_${userId}_${language}_${today}`;
    
    // Check if running in browser environment
    if (typeof window === 'undefined' || !window.localStorage) {
      return; // Skip on server-side
    }
    
    const existing = localStorage.getItem(key);
    const stats = existing ? JSON.parse(existing) : { sessionsStarted: 0 };
    
    stats.sessionsStarted += 1;
    localStorage.setItem(key, JSON.stringify(stats));
  }

  private checkAchievements(userId: string, language: LanguageCode): void {
    // Implementation for achievement checking
    const progress = this.getUserProgress(userId, language);
    if (!progress) return;

    const newAchievements: Achievement[] = [];

    // Check for milestone achievements
    if (progress.conversationsCompleted === 1) {
      newAchievements.push({
        id: 'first_conversation',
        title: 'First Steps',
        description: 'Completed your first conversation',
        iconUrl: '🌟',
        earnedAt: new Date(),
        category: 'milestone'
      });
    }

    if (progress.conversationsCompleted === 10) {
      newAchievements.push({
        id: 'ten_conversations',
        title: 'Getting Started',
        description: 'Completed 10 conversations',
        iconUrl: '🎯',
        earnedAt: new Date(),
        category: 'milestone'
      });
    }    // Add new achievements to progress
    if (newAchievements.length > 0) {
      const updatedProgress = {
        ...progress,
        achievements: [...progress.achievements, ...newAchievements]
      };
      const key = `${this.STORAGE_PREFIX}progress_${userId}_${language}`;
      
      // Check if running in browser environment
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, JSON.stringify(updatedProgress));
      }
    }
  }

  private calculateStreak(userId: string, language: LanguageCode): number {
    // Implementation for streak calculation
    const sessions = this.getUserSessions(userId, language);
    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const currentDate = new Date(today);

    for (let i = 0; i < 365; i++) { // Check up to a year
      const dateStr = currentDate.toDateString();
      const hasSessionOnDate = sessions.some((session: ProgressConversationSession) => 
        session.startedAt.toDateString() === dateStr
      );

      if (hasSessionOnDate) {
        streak++;
      } else if (i > 0) { // Allow skipping today if no session yet
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  private calculateLevelProgress(conversationsCompleted: number): number {
    // Simple progression: 10 conversations per level increase
    return Math.min((conversationsCompleted % 10) * 10, 100);
  }

  private getDailyStats(sessions: ProgressConversationSession[], vocabulary: VocabularyItem[]): DailyStats {
    const today = new Date().toDateString();
    const todaySessions = sessions.filter((s: ProgressConversationSession) => s.startedAt.toDateString() === today);
    const todayVocab = vocabulary.filter((v: VocabularyItem) => v.learnedAt.toDateString() === today);

    return {
      date: new Date(),
      sessionsCompleted: todaySessions.length,
      wordsLearned: todayVocab.length,
      timeSpent: todaySessions.reduce((sum: number, s: ProgressConversationSession) => sum + s.duration, 0),
      averageComfortScore: todaySessions.length > 0
        ? todaySessions.reduce((sum: number, s: ProgressConversationSession) => sum + (s.comfortScore || 5), 0) / todaySessions.length
        : 0
    };
  }

  private getWeeklyStats(sessions: ProgressConversationSession[], vocabulary: VocabularyItem[]): WeeklyStats {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const weekSessions = sessions.filter((s: ProgressConversationSession) => s.startedAt >= weekStart);
    const weekVocab = vocabulary.filter((v: VocabularyItem) => v.learnedAt >= weekStart);

    // Find most active day
    const dayStats = new Map<string, number>();
    weekSessions.forEach((s: ProgressConversationSession) => {
      const day = s.startedAt.toLocaleDateString('en', { weekday: 'long' });
      dayStats.set(day, (dayStats.get(day) || 0) + 1);
    });

    const topics = weekSessions.map((s: ProgressConversationSession) => s.topic);
    const topicCounts = topics.reduce((acc: Record<string, number>, topic: string) => {
      acc[topic] = (acc[topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      weekStarting: weekStart,
      sessionsCompleted: weekSessions.length,
      wordsLearned: weekVocab.length,
      timeSpent: weekSessions.reduce((sum: number, s: ProgressConversationSession) => sum + s.duration, 0),
      averageComfortScore: weekSessions.length > 0
        ? weekSessions.reduce((sum: number, s: ProgressConversationSession) => sum + (s.comfortScore || 5), 0) / weekSessions.length
        : 0,
      mostActiveDay: Array.from(dayStats.entries())
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || '',
      topTopic: Object.entries(topicCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || ''
    };
  }

  private getMonthlyStats(sessions: ProgressConversationSession[], vocabulary: VocabularyItem[]): MonthlyStats {
    const date = new Date();
    const monthSessions = sessions.filter((s: ProgressConversationSession) => 
      s.startedAt.getMonth() === date.getMonth() &&
      s.startedAt.getFullYear() === date.getFullYear()
    );
    const monthVocab = vocabulary.filter((v: VocabularyItem) => 
      v.learnedAt.getMonth() === date.getMonth() &&
      v.learnedAt.getFullYear() === date.getFullYear()
    );

    const topics = [...new Set(monthSessions.map((s: ProgressConversationSession) => s.topic))];

    return {
      month: new Date(date.getFullYear(), date.getMonth(), 1),
      sessionsCompleted: monthSessions.length,
      wordsLearned: monthVocab.length,
      timeSpent: monthSessions.reduce((sum: number, s: ProgressConversationSession) => sum + s.duration, 0),
      averageComfortScore: monthSessions.length > 0
        ? monthSessions.reduce((sum: number, s: ProgressConversationSession) => sum + (s.comfortScore || 5), 0) / monthSessions.length
        : 0,
      topicsExplored: topics,
      levelProgression: 0 // Calculate based on start vs end of month
    };
  }

  private getAllTimeStats(sessions: ProgressConversationSession[], vocabulary: VocabularyItem[]): AllTimeStats {
    const languages = [...new Set(sessions.map((s: ProgressConversationSession) => s.language))];
    const currentStreak = this.calculateStreak(sessions[0]?.userId || '', sessions[0]?.language || 'en');

    return {
      totalSessions: sessions.length,
      totalWordsLearned: vocabulary.length,
      totalTimeSpent: sessions.reduce((sum: number, s: ProgressConversationSession) => sum + s.duration, 0),
      languagesStudied: languages,
      currentStreak,
      longestStreak: currentStreak, // Would need historical data for accurate calculation
      achievementsUnlocked: 0 // Would calculate from user progress
    };
  }
}

// Export singleton instance
export const progressTrackingService = new ProgressTrackingService();
