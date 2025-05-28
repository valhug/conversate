/**
 * Enhanced Progress Dashboard with Shadcn/UI Components
 * Uses the proper design system components and adds interactive features
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@conversate/ui';
import { Button } from '@conversate/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@conversate/ui';
import { progressTrackingService } from '../lib/progress-tracking-service';
import type { LanguageCode } from '@conversate/shared';
import type { 
  ProgressConversationSession, 
  VocabularyItem, 
  Achievement
} from '../lib/progress-tracking-service';

interface EnhancedProgressDashboardProps {
  userId: string;
  defaultLanguage?: LanguageCode;
  onNavigateToConversation?: () => void;
  onNavigateToVocabulary?: () => void;
}

interface DashboardOverview {
  currentLevel: string;
  currentStreak: number;
  totalSessions: number;
  totalStudyTime: number;
  masteredWords: number;
  totalWords: number;
  averageComfort: number;
}

interface WeeklyData {
  goal: number;
  current: number;
  progress: number;
  sessionsThisWeek: number;
}

interface RecentData {
  sessions: ProgressConversationSession[];
  vocabulary: VocabularyItem[];
  achievements: Achievement[];
}

interface DashboardData {
  overview: DashboardOverview;
  weekly: WeeklyData;
  recent: RecentData;
}

export const EnhancedProgressDashboard: React.FC<EnhancedProgressDashboardProps> = ({
  userId,
  defaultLanguage = 'en',
  onNavigateToConversation,
  onNavigateToVocabulary
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(defaultLanguage);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const availableLanguages = [
    { code: 'en' as LanguageCode, name: 'English', flag: '🇺🇸' },
    { code: 'es' as LanguageCode, name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr' as LanguageCode, name: 'French', flag: '🇫🇷' },
  ];

  const loadDashboardData = useCallback(async () => {
    try {
      const progress = progressTrackingService.getUserProgress(userId, selectedLanguage);
      const sessions = progressTrackingService.getUserSessions(userId, selectedLanguage);
      const vocabulary = progressTrackingService.getUserVocabulary(userId, selectedLanguage);

      // Calculate dashboard metrics
      const totalSessions = sessions.filter((s: ProgressConversationSession) => s.completedAt).length;
      const totalStudyTime = sessions.reduce((sum: number, s: ProgressConversationSession) => sum + s.duration, 0) / 60; // in minutes
      const currentStreak = progress?.streakDays || 0;
      const masteredWords = vocabulary.filter((v: VocabularyItem) => v.mastered).length;
      const averageComfort = sessions.length > 0 
        ? sessions.reduce((sum: number, s: ProgressConversationSession) => sum + (s.comfortScore || 5), 0) / sessions.length
        : 0;

      // Recent activity (last 7 days)
      const recentSessions = sessions
        .filter((s: ProgressConversationSession) => s.startedAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .sort((a: ProgressConversationSession, b: ProgressConversationSession) => b.startedAt.getTime() - a.startedAt.getTime());

      // Recent vocabulary (last 10 words)
      const recentVocabulary = vocabulary
        .sort((a: VocabularyItem, b: VocabularyItem) => b.learnedAt.getTime() - a.learnedAt.getTime())
        .slice(0, 10);

      // Recent achievements
      const recentAchievements = (progress?.achievements || [])
        .filter((a: Achievement) => a.earnedAt !== undefined)
        .sort((a: Achievement, b: Achievement) => {
          const aTime = a.earnedAt ? new Date(a.earnedAt).getTime() : 0;
          const bTime = b.earnedAt ? new Date(b.earnedAt).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 3);

      // Weekly goal progress
      const weeklyGoal = progress?.weeklyGoal || 180; // 3 hours default
      const thisWeekMinutes = recentSessions.reduce((sum: number, s: ProgressConversationSession) => sum + s.duration / 60, 0);
      const weeklyProgress = Math.min((thisWeekMinutes / weeklyGoal) * 100, 100);

      setDashboardData({
        overview: {
          totalSessions,
          totalStudyTime: Math.round(totalStudyTime),
          currentStreak,
          masteredWords,
          totalWords: vocabulary.length,
          averageComfort,
          currentLevel: progress?.currentLevel || 'A1'
        },
        weekly: {
          goal: weeklyGoal,
          current: Math.round(thisWeekMinutes),
          progress: weeklyProgress,
          sessionsThisWeek: recentSessions.length
        },
        recent: {
          sessions: recentSessions.slice(0, 5),
          vocabulary: recentVocabulary,
          achievements: recentAchievements
        }
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, selectedLanguage]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No progress data available</p>
          <Button onClick={() => onNavigateToConversation?.()} className="mt-4">
            Start Your First Conversation
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { overview, weekly, recent } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Dashboard</h1>
          <p className="text-gray-600">Track your language learning progress</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Language Selector */}
          <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as LanguageCode)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {availableLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center space-x-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Refresh Button */}
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            {refreshing ? '⟳' : '↻'} Refresh
          </Button>
        </div>
      </div>

      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">
                Great progress! Keep it up! 🎉
              </h2>
              <p className="text-blue-100">
                You&apos;re currently at {overview.currentLevel} level with {overview.currentStreak} day streak!
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{overview.totalSessions}</div>
              <div className="text-sm text-blue-100">conversations completed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Study Time"
          value={`${overview.totalStudyTime}m`}
          subtitle="total practice"
          icon="⏱️"
        />
        <MetricCard
          title="Current Streak"
          value={`${overview.currentStreak}`}
          subtitle="days in a row"
          icon="🔥"
        />
        <MetricCard
          title="Vocabulary"
          value={`${overview.masteredWords}`}
          subtitle={`of ${overview.totalWords} learned`}
          icon="📚"
        />
        <MetricCard
          title="Comfort Score"
          value={overview.averageComfort.toFixed(1)}
          subtitle="average confidence"
          icon="😊"
        />
      </div>

      {/* Weekly Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🎯</span>
            <span>Weekly Goal Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">
                {weekly.current}m / {weekly.goal}m
              </span>
              <span className="text-sm text-gray-600">
                {weekly.sessionsThisWeek} sessions this week
              </span>
            </div>            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`bg-blue-600 h-3 rounded-full transition-all duration-500`}
                style={{width: `${Math.min(100, Math.max(0, weekly.progress))}%`} as React.CSSProperties}
              />
            </div>
            
            <div className="flex justify-between text-sm text-gray-600">
              <span>0m</span>
              <span>{weekly.goal}m</span>
            </div>
            
            {weekly.progress >= 100 ? (
              <div className="text-center p-4 bg-green-100 rounded-lg">
                <div className="text-2xl mb-2">🎉</div>
                <div className="text-green-800 font-medium">
                  Weekly goal achieved! Great work!
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600">
                  {Math.round(weekly.goal - weekly.current)} minutes to go!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Recent Sessions</CardTitle>
            <Button 
              onClick={() => onNavigateToConversation?.()} 
              size="sm"
              variant="outline"
            >
              New Session
            </Button>
          </CardHeader>
          <CardContent>
            <RecentSessionsList sessions={recent.sessions} />
          </CardContent>
        </Card>

        {/* Recent Vocabulary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Recent Vocabulary</CardTitle>
            <Button 
              onClick={() => onNavigateToVocabulary?.()} 
              size="sm"
              variant="outline"
            >
              Practice Words
            </Button>
          </CardHeader>
          <CardContent>
            <RecentVocabularyList vocabulary={recent.vocabulary} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {recent.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🏆</span>
              <span>Recent Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentAchievementsList achievements={recent.achievements} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Supporting Components

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, subtitle, icon }) => (
  <Card className="border-2">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </CardContent>
  </Card>
);

interface RecentSessionsListProps {
  sessions: ProgressConversationSession[];
}

const RecentSessionsList: React.FC<RecentSessionsListProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">💬</div>
        <p>No recent sessions</p>
        <p className="text-sm">Start a conversation to see your activity here!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <div className="font-medium capitalize">{session.topic.replace('-', ' ')}</div>
            <div className="text-sm text-gray-600">
              {Math.round(session.duration / 60)}m • {session.startedAt.toLocaleDateString()}
            </div>
          </div>
          {session.comfortScore && (
            <div className="text-right">
              <div className="text-sm font-medium">{session.comfortScore}/10</div>
              <div className="text-xs text-gray-600">comfort</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

interface RecentVocabularyListProps {
  vocabulary: VocabularyItem[];
}

const RecentVocabularyList: React.FC<RecentVocabularyListProps> = ({ vocabulary }) => {
  if (vocabulary.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📚</div>
        <p>No vocabulary yet</p>
        <p className="text-sm">Complete conversations to learn new words!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {vocabulary.map((word, index) => (
        <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{word.word}</span>
              {word.mastered && <span className="text-green-500 text-sm">✓</span>}
            </div>
            <p className="text-sm text-gray-600">{word.translation}</p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <div>Practiced {word.practiceCount}x</div>
            <div>{word.learnedAt.toLocaleDateString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface RecentAchievementsListProps {
  achievements: Achievement[];
}

const RecentAchievementsList: React.FC<RecentAchievementsListProps> = ({ achievements }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {achievements.map((achievement) => (
      <div key={achievement.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="text-center">
          <div className="text-3xl mb-2">🏆</div>
          <h3 className="font-bold text-yellow-800">{achievement.title}</h3>
          <p className="text-sm text-yellow-700 mt-1">{achievement.description}</p>
          <p className="text-xs text-yellow-600 mt-2">
            {achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString() : ''}
          </p>
        </div>
      </div>
    ))}
  </div>
);

export default EnhancedProgressDashboard;
