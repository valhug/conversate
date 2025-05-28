/**
 * Complete Progress Dashboard Page
 * Main dashboard that combines all progress tracking components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ProgressDashboard } from './progress/progress-dashboard';
import { 
  StreakCalendar, 
  CEFRProgress, 
  VocabularyMastery, 
  SessionAnalytics 
} from './AdvancedProgressComponents';
import { progressTrackingService, ProgressUserProgress, ProgressConversationSession, VocabularyItem, Achievement as BaseAchievement } from '../lib/progress-tracking-service';
import type { LanguageCode } from '@conversate/shared';

interface ComprehensiveProgressPageProps {
  userId: string;
}

interface PerformanceInsights {
  improvementTrend: 'improving' | 'declining' | 'stable' | 'neutral';
  weeklyGoalProgress: {
    current: number;
    goal: number;
    percentage: number;
  };
  recommendations: RecommendationItem[];
}

interface RecommendationItem {
  type: string;
  message: string;
  action: string;
}

interface VocabularyRecommendationsData {
  needsReview: VocabularyItem[];
  needsPractice: VocabularyItem[];
  recentlyMastered: VocabularyItem[];
}

interface GoalsData {
  daily: {
    target: number;
    current: number;
    completed: boolean;
  };
  weekly: {
    target: number;
    current: number;
    completed: boolean;
  };
  milestones: Array<{
    id: string;
    title: string;
    target: number;
    current: number;
    type: string;
    description: string;
  }>;
}

interface Achievement extends BaseAchievement {
  icon?: string;
  progress?: number;
  threshold?: number;
}

export const ComprehensiveProgressPage: React.FC<ComprehensiveProgressPageProps> = ({ userId }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('en');
  const [userProgress, setUserProgress] = useState<ProgressUserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'vocabulary' | 'achievements'>('overview');
  // Available languages - this would come from your language constants
  const availableLanguages: { code: LanguageCode; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'tl', name: 'Tagalog' },  ];

  const loadUserProgress = useCallback(async () => {
    setLoading(true);
    try {
      const progress = progressTrackingService.getUserProgress(userId, selectedLanguage);
      setUserProgress(progress);
    } catch (error) {
      console.error('Failed to load user progress:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedLanguage]);

  useEffect(() => {
    loadUserProgress();
  }, [loadUserProgress]);
  const TabButton: React.FC<{ 
    label: string; 
    icon: string; 
    isActive: boolean; 
    onClick: () => void;
  }> = ({ label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Learning Dashboard</h1>
              <p className="text-gray-600">Track your language learning progress</p>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Language:</label>              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as LanguageCode)}
                title="Select Language"
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Navigation Tabs */}          <div className="flex space-x-1 pb-4">
            <TabButton
              label="Overview"
              icon="📊"
              isActive={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            />
            <TabButton
              label="Analytics"
              icon="📈"
              isActive={activeTab === 'analytics'}
              onClick={() => setActiveTab('analytics')}
            />
            <TabButton
              label="Vocabulary"
              icon="📚"
              isActive={activeTab === 'vocabulary'}
              onClick={() => setActiveTab('vocabulary')}
            />
            <TabButton
              label="Achievements"
              icon="🏆"
              isActive={activeTab === 'achievements'}
              onClick={() => setActiveTab('achievements')}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        {userProgress && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white">
            <h2 className="text-xl font-bold mb-2">
              Welcome back! Keep up the great work! 🎉
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-semibold">Current Level</div>
                <div className="text-blue-100">{userProgress.currentLevel}</div>
              </div>
              <div>
                <div className="font-semibold">Total Sessions</div>
                <div className="text-blue-100">{userProgress.conversationsCompleted}</div>
              </div>
              <div>
                <div className="font-semibold">Study Streak</div>
                <div className="text-blue-100">{userProgress.streakDays} days</div>
              </div>
              <div>
                <div className="font-semibold">Vocabulary</div>
                <div className="text-blue-100">{userProgress.vocabularyMastered} words</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Main Progress Dashboard */}
            <ProgressDashboard userId={userId} language={selectedLanguage} />
            
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <StreakCalendar userId={userId} language={selectedLanguage} />
              <CEFRProgress 
                userId={userId} 
                language={selectedLanguage} 
                currentLevel={userProgress?.currentLevel || 'A1'} 
              />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <SessionAnalytics userId={userId} language={selectedLanguage} />
            
            {/* Performance Insights */}
            <PerformanceInsights userId={userId} language={selectedLanguage} />
          </div>
        )}

        {activeTab === 'vocabulary' && (
          <div className="space-y-8">
            <VocabularyMastery userId={userId} language={selectedLanguage} />
            
            {/* Vocabulary Practice Recommendations */}
            <VocabularyRecommendations userId={userId} language={selectedLanguage} />
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-8">
            <AchievementGallery userId={userId} language={selectedLanguage} />
            <GoalsAndMilestones userId={userId} language={selectedLanguage} />
          </div>
        )}
      </div>
    </div>
  );
};

// Performance Insights Component
interface PerformanceInsightsProps {
  userId: string;
  language: LanguageCode;
}

const PerformanceInsights: React.FC<PerformanceInsightsProps> = ({ userId, language }) => {
  const [insights, setInsights] = useState<PerformanceInsights | null>(null);

  const loadInsights = useCallback(async () => {
    const sessions = progressTrackingService.getUserSessions(userId, language);
    const vocabulary = progressTrackingService.getUserVocabulary(userId, language);
    const progress = progressTrackingService.getUserProgress(userId, language);

    // Generate insights
    const recentSessions = sessions.slice(0, 10);
    const improvementTrend = calculateImprovementTrend(recentSessions);
    const weeklyGoalProgress = calculateWeeklyGoalProgress(sessions, progress);
    const recommendations = generateRecommendations(sessions, vocabulary, progress);

    setInsights({
      improvementTrend,
      weeklyGoalProgress,
      recommendations
    });
  }, [userId, language]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const calculateImprovementTrend = (sessions: ProgressConversationSession[]) => {
    if (sessions.length < 2) return 'neutral' as const;
    
    const recent = sessions.slice(0, 5);
    const previous = sessions.slice(5, 10);
    
    const recentAvg = recent.reduce((sum, s) => sum + (s.comfortScore || 5), 0) / recent.length;
    const previousAvg = previous.reduce((sum, s) => sum + (s.comfortScore || 5), 0) / previous.length;
    
    if (recentAvg > previousAvg + 0.5) return 'improving' as const;
    if (recentAvg < previousAvg - 0.5) return 'declining' as const;
    return 'stable' as const;
  };

  const calculateWeeklyGoalProgress = (sessions: ProgressConversationSession[], progress: ProgressUserProgress | null) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weekSessions = sessions.filter(s => new Date(s.startedAt) >= oneWeekAgo);
    const weeklyMinutes = weekSessions.reduce((sum, s) => sum + (s.duration / 60), 0);
    const weeklyGoal = progress?.weeklyGoal || 180; // 3 hours default
    
    return {
      current: Math.round(weeklyMinutes),
      goal: weeklyGoal,
      percentage: Math.min((weeklyMinutes / weeklyGoal) * 100, 100)
    };
  };

  const generateRecommendations = (sessions: ProgressConversationSession[], vocabulary: VocabularyItem[], progress: ProgressUserProgress | null) => {
    const recommendations = [];
    
    // Check comfort score
    const avgComfort = progress?.averageComfortScore || 0;
    if (avgComfort < 6) {
      recommendations.push({
        type: 'comfort',
        message: 'Try focusing on topics you enjoy to build confidence',
        action: 'Practice with easier conversations'
      });
    }
    
    // Check vocabulary
    const masteredVocab = vocabulary.filter(v => v.mastered).length;
    if (masteredVocab < 50) {
      recommendations.push({
        type: 'vocabulary',
        message: 'Expand your vocabulary to improve fluency',
        action: 'Review and practice more words'
      });
    }
      // Check consistency
    if ((progress?.streakDays || 0) < 3) {
      recommendations.push({
        type: 'consistency',
        message: 'Regular practice leads to better results',
        action: 'Try to practice a little every day'
      });
    }
    
    return recommendations;
  };

  if (!insights) {
    return <div className="bg-white rounded-lg shadow-lg p-6">Loading insights...</div>;
  }

  const trendColors = {
    improving: 'text-green-600 bg-green-100',
    stable: 'text-blue-600 bg-blue-100',
    declining: 'text-red-600 bg-red-100'
  };

  const trendIcons = {
    improving: '📈',
    stable: '➡️',
    declining: '📉'
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Performance Insights</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Improvement Trend */}
        <div className={`p-4 rounded-lg ${trendColors[insights.improvementTrend as keyof typeof trendColors]}`}>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">{trendIcons[insights.improvementTrend as keyof typeof trendIcons]}</span>
            <span className="font-semibold capitalize">{insights.improvementTrend}</span>
          </div>
          <p className="text-sm">Your recent performance trend</p>
        </div>

        {/* Weekly Goal */}
        <div className="p-4 rounded-lg bg-purple-100 text-purple-600">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">🎯</span>
            <span className="font-semibold">Weekly Goal</span>
          </div>
          <div className="text-sm">
            {insights.weeklyGoalProgress.current}m / {insights.weeklyGoalProgress.goal}m
            <div className="w-full bg-purple-200 rounded-full h-2 mt-1">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${insights.weeklyGoalProgress.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Next Milestone */}
        <div className="p-4 rounded-lg bg-orange-100 text-orange-600">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-2xl">🏁</span>
            <span className="font-semibold">Next Milestone</span>
          </div>
          <p className="text-sm">Level up in 15 conversations</p>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-lg font-medium mb-4">Personalized Recommendations</h3>        <div className="space-y-3">
          {insights.recommendations.map((rec: RecommendationItem, index: number) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">💡</div>
                <div>
                  <p className="font-medium text-gray-900">{rec.message}</p>
                  <p className="text-sm text-gray-600 mt-1">{rec.action}</p>
                </div>
              </div>
            </div>
          ))}
          
          {insights.recommendations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🌟</div>
              <p>Great work! You&apos;re making excellent progress!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Vocabulary Recommendations Component
interface VocabularyRecommendationsProps {
  userId: string;
  language: LanguageCode;
}

const VocabularyRecommendations: React.FC<VocabularyRecommendationsProps> = ({ userId, language }) => {
  const [recommendations, setRecommendations] = useState<VocabularyRecommendationsData | null>(null);

  const loadRecommendations = useCallback(async () => {
    const vocabulary = progressTrackingService.getUserVocabulary(userId, language);
    
    // Words that need review (practiced less recently)
    const needsReview = vocabulary
      .filter(v => !v.mastered && v.practiceCount > 0)
      .sort((a, b) => a.lastPracticed.getTime() - b.lastPracticed.getTime())
      .slice(0, 10);
    
    // Words to focus on (low practice count)
    const needsPractice = vocabulary
      .filter(v => !v.mastered && v.practiceCount <= 2)
      .slice(0, 10);
    
    // Recently mastered (for motivation)
    const recentlyMastered = vocabulary
      .filter(v => v.mastered)
      .sort((a, b) => b.learnedAt.getTime() - a.learnedAt.getTime())
      .slice(0, 5);
    
    setRecommendations({
      needsReview,
      needsPractice,
      recentlyMastered
    });
  }, [userId, language]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  if (!recommendations) {
    return <div className="bg-white rounded-lg shadow-lg p-6">Loading recommendations...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Vocabulary Practice Recommendations</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs Review */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-orange-600">📋 Needs Review</h3>          <div className="space-y-2 max-h-60 overflow-y-auto">
            {recommendations.needsReview.map((word: VocabularyItem, index: number) => (
              <div key={index} className="p-3 bg-orange-50 rounded border border-orange-200">
                <div className="font-medium">{word.word}</div>
                <div className="text-sm text-gray-600">{word.translation}</div>
                <div className="text-xs text-orange-600 mt-1">
                  Last practiced: {word.lastPracticed.toLocaleDateString()}
                </div>
              </div>
            ))}
            {recommendations.needsReview.length === 0 && (
              <p className="text-gray-500 text-sm">No words need review right now!</p>
            )}
          </div>
        </div>

        {/* Needs Practice */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-red-600">🎯 Needs Practice</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {recommendations.needsPractice.map((word: VocabularyItem, index: number) => (
              <div key={index} className="p-3 bg-red-50 rounded border border-red-200">
                <div className="font-medium">{word.word}</div>
                <div className="text-sm text-gray-600">{word.translation}</div>
                <div className="text-xs text-red-600 mt-1">
                  Practiced {word.practiceCount} times
                </div>
              </div>
            ))}
            {recommendations.needsPractice.length === 0 && (
              <p className="text-gray-500 text-sm">Great! All words are well practiced!</p>
            )}
          </div>
        </div>

        {/* Recently Mastered */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-green-600">✅ Recently Mastered</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {recommendations.recentlyMastered.map((word: VocabularyItem, index: number) => (
              <div key={index} className="p-3 bg-green-50 rounded border border-green-200">
                <div className="font-medium">{word.word}</div>
                <div className="text-sm text-gray-600">{word.translation}</div>
                <div className="text-xs text-green-600 mt-1">
                  Mastered on {word.learnedAt.toLocaleDateString()}
                </div>
              </div>
            ))}
            {recommendations.recentlyMastered.length === 0 && (
              <p className="text-gray-500 text-sm">Start practicing to see mastered words here!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Achievement Gallery Component
interface AchievementGalleryProps {
  userId: string;
  language: LanguageCode;
}

const AchievementGallery: React.FC<AchievementGalleryProps> = ({ userId, language }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  const loadAchievements = useCallback(async () => {
    const userProgress = progressTrackingService.getUserProgress(userId, language);
    const allAchievements = userProgress?.achievements || [];
    setAchievements(allAchievements);
  }, [userId, language]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const earnedAchievements = achievements.filter(a => a.earnedAt);
  const availableAchievements = achievements.filter(a => !a.earnedAt);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Achievement Gallery</h2>
      
      {/* Earned Achievements */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">🏆 Earned ({earnedAchievements.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {earnedAchievements.map((achievement) => (
            <div key={achievement.id} className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h4 className="font-bold text-yellow-800">{achievement.title}</h4>
                <p className="text-sm text-yellow-700 mt-1">{achievement.description}</p>                <p className="text-xs text-yellow-600 mt-2">
                  Earned {achievement.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString() : 'Recently'}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {earnedAchievements.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎯</div>
            <p>Complete conversations to earn your first achievement!</p>
          </div>
        )}
      </div>

      {/* Available Achievements */}
      <div>
        <h3 className="text-lg font-medium mb-4">🔒 Available ({availableAchievements.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableAchievements.slice(0, 6).map((achievement) => (
            <div key={achievement.id} className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg opacity-75">
              <div className="text-center">
                <div className="text-4xl mb-2 grayscale">🏆</div>
                <h4 className="font-bold text-gray-600">{achievement.title}</h4>
                <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Progress</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${achievement.progress && achievement.threshold ? Math.min((achievement.progress / achievement.threshold) * 100, 100) : 0}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {achievement.progress || 0} / {achievement.threshold || 100}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Goals and Milestones Component
interface GoalsAndMilestonesProps {
  userId: string;
  language: LanguageCode;
}

const GoalsAndMilestones: React.FC<GoalsAndMilestonesProps> = ({ userId, language }) => {
  const [goals, setGoals] = useState<GoalsData | null>(null);

  const loadGoals = useCallback(async () => {
    const progress = progressTrackingService.getUserProgress(userId, language);
    
    const dailyGoal = {
      target: progress?.dailyGoal || 30,
      current: 0, // Would calculate from today's sessions
      completed: false
    };
    
    const weeklyGoal = {
      target: progress?.weeklyGoal || 180,
      current: 0, // Would calculate from this week's sessions
      completed: false
    };
    
    const milestones = [
      {
        id: 'conversations-10',
        title: 'First 10 Conversations',
        description: 'Complete your first 10 conversations',
        target: 10,
        current: progress?.conversationsCompleted || 0,
        type: 'conversations'
      },
      {
        id: 'vocabulary-100',
        title: '100 Vocabulary Words',
        description: 'Learn 100 vocabulary words',
        target: 100,
        current: progress?.vocabularyMastered || 0,
        type: 'vocabulary'
      },
      {
        id: 'streak-7',
        title: '7-Day Streak',
        description: 'Study for 7 days in a row',
        target: 7,
        current: progress?.streakDays || 0,
        type: 'streak'
      }
    ];
      setGoals({
      daily: dailyGoal,
      weekly: weeklyGoal,
      milestones
    });
  }, [userId, language]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  if (!goals) {
    return <div className="bg-white rounded-lg shadow-lg p-6">Loading goals...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Goals & Milestones</h2>
      
      {/* Daily & Weekly Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-blue-800">Daily Goal</h3>
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {goals.daily.current}m / {goals.daily.target}m
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${Math.min((goals.daily.current / goals.daily.target) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-purple-800">Weekly Goal</h3>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {goals.weekly.current}m / {goals.weekly.target}m
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full"
              style={{ width: `${Math.min((goals.weekly.current / goals.weekly.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h3 className="text-lg font-medium mb-4">Current Milestones</h3>
        <div className="space-y-4">          {goals.milestones.map((milestone, index: number) => {
            const percentage = Math.min((milestone.current / milestone.target) * 100, 100);
            const isCompleted = milestone.current >= milestone.target;
            
            return (
              <div key={index} className={`p-4 rounded-lg border-2 ${
                isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className={`font-semibold ${isCompleted ? 'text-green-800' : 'text-gray-800'}`}>
                      {milestone.title}
                    </h4>
                    <p className={`text-sm ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                      {milestone.description}
                    </p>
                  </div>
                  <div className="text-2xl">
                    {isCompleted ? '✅' : '🎯'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-2">                  <span className={`text-sm font-medium ${isCompleted ? 'text-green-700' : 'text-gray-700'}`}>
                    {milestone.current} / {milestone.target}
                  </span>
                  <span className={`text-sm ${isCompleted ? 'text-green-600' : 'text-gray-600'}`}>
                    {Math.round(percentage)}%
                  </span>
                </div>
                
                <div className={`w-full rounded-full h-2 ${isCompleted ? 'bg-green-200' : 'bg-gray-200'}`}>
                  <div
                    className={`h-2 rounded-full ${isCompleted ? 'bg-green-600' : 'bg-blue-500'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>    </div>
  );
};
