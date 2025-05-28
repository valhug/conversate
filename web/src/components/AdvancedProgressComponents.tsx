/**
 * Advanced Progress Dashboard Components
 * Specialized components for detailed progress visualization
 */

import React, { useState, useEffect, useCallback } from 'react';
import { progressTrackingService, ProgressUserProgress, ProgressStats, VocabularyItem } from '../lib/progress-tracking-service';
import type { LanguageCode, CEFRLevel } from '@conversate/shared';

// Data interfaces
interface LevelData {
  progress: ProgressUserProgress | null;
  stats: ProgressStats | null;
  levelProgress: number;
}

interface MasteryLevels {
  beginner: number;
  learning: number;
  mastered: number;
}

interface DifficultyBreakdown {
  easy: number;
  medium: number;
  hard: number;
}

interface VocabularyDataType {
  total: number;
  masteryLevels: MasteryLevels;
  difficultyBreakdown: DifficultyBreakdown;
  recentlyLearned: VocabularyItem[];
}

interface AnalyticsDataType {
  totalSessions: number;
  averageSessionDuration: number;
  averageMessages: number;
  averageComfort: number;
  topicCounts: Record<string, number>;
  performanceTrend: Array<{
    session: number;
    comfort: number;
    duration: number;
    messages: number;
  }>;
}

// Streak Calendar Component
interface StreakCalendarProps {
  userId: string;
  language: LanguageCode;
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({ userId, language }) => {
  const [streakData, setStreakData] = useState<Record<string, number>>({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const loadStreakData = useCallback(async () => {
    const sessions = progressTrackingService.getUserSessions(userId, language);
    const data: Record<string, number> = {};
    
    sessions.forEach(session => {
      if (session.completedAt) {
        const dateStr = session.startedAt.toISOString().split('T')[0];
        data[dateStr] = (data[dateStr] || 0) + 1;
      }
    });
    
    setStreakData(data);
  }, [userId, language]);

  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getActivityLevel = (date: Date | null) => {
    if (!date) return 0;
    const dateStr = date.toISOString().split('T')[0];
    const sessions = streakData[dateStr] || 0;
    
    if (sessions === 0) return 0;
    if (sessions === 1) return 1;
    if (sessions <= 3) return 2;
    return 3;
  };

  const getActivityColor = (level: number) => {
    const colors = [
      'bg-gray-100', // No activity
      'bg-green-200', // Low activity
      'bg-green-400', // Medium activity
      'bg-green-600'  // High activity
    ];
    return colors[level];
  };

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Learning Streak</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <span className="text-lg font-medium min-w-[150px] text-center">{monthName}</span>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-1 hover:bg-gray-100 rounded"
            disabled={currentMonth.getMonth() === new Date().getMonth()}
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const level = getActivityLevel(date);
          const isToday = date && date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`
                aspect-square flex items-center justify-center text-sm rounded
                ${date ? getActivityColor(level) : ''}
                ${isToday ? 'ring-2 ring-blue-500' : ''}
                ${date ? 'hover:ring-1 hover:ring-gray-300 cursor-pointer' : ''}
              `}
              title={date ? `${date.getDate()} - ${streakData[date.toISOString().split('T')[0]] || 0} sessions` : ''}
            >
              {date?.getDate()}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>Less</span>
        <div className="flex items-center space-x-1">
          {[0, 1, 2, 3].map(level => (
            <div key={level} className={`w-3 h-3 rounded ${getActivityColor(level)}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
};

// CEFR Level Progress Component
interface CEFRProgressProps {
  userId: string;
  language: LanguageCode;
  currentLevel: CEFRLevel;
}

export const CEFRProgress: React.FC<CEFRProgressProps> = ({ userId, language, currentLevel }) => {
  const [levelData, setLevelData] = useState<LevelData | null>(null);
  const loadLevelData = useCallback(async () => {
    const progress = progressTrackingService.getUserProgress(userId, language);
    const stats = progressTrackingService.getProgressStats(userId, language);
      setLevelData({
      progress,
      stats,
      levelProgress: calculateLevelProgress(progress)
    });
  }, [userId, language]);

  useEffect(() => {
    loadLevelData();
  }, [loadLevelData]);

  const calculateLevelProgress = (progress: ProgressUserProgress | null) => {
    if (!progress) return 0;
    
    // Simple calculation based on conversations and vocabulary
    const conversationWeight = 0.6;
    const vocabularyWeight = 0.4;
    
    const maxConversationsForLevel = 50; // Target conversations per level
    const maxVocabularyForLevel = 200; // Target vocabulary per level
    
    const conversationProgress = Math.min(progress.conversationsCompleted / maxConversationsForLevel, 1);
    const vocabularyProgress = Math.min(progress.vocabularyMastered / maxVocabularyForLevel, 1);
    
    return (conversationProgress * conversationWeight + vocabularyProgress * vocabularyWeight) * 100;
  };

  const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const currentIndex = levels.indexOf(currentLevel);
  const progressPercentage = levelData?.levelProgress || 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">CEFR Level Progress</h2>
      
      <div className="space-y-4">        {levels.map((level, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={level} className="flex items-center space-x-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                ${isCompleted ? 'bg-green-500 text-white' : 
                  isCurrent ? 'bg-blue-500 text-white' : 
                  'bg-gray-200 text-gray-500'}
              `}>
                {isCompleted ? '✓' : level}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-700'}`}>
                    {level} - {getLevelDescription(level)}
                  </span>
                  {isCurrent && (
                    <span className="text-sm text-blue-600 font-medium">
                      {Math.round(progressPercentage)}%
                    </span>
                  )}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCompleted ? 'bg-green-500 w-full' :
                      isCurrent ? 'bg-blue-500' :
                      'bg-gray-200 w-0'
                    }`}
                    style={isCurrent ? { width: `${progressPercentage}%` } : {}}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {levelData && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Next Level Requirements</h3>
          <div className="space-y-1 text-sm text-blue-700">
            <div>Conversations: {levelData.progress?.conversationsCompleted || 0} / 50</div>
            <div>Vocabulary: {levelData.progress?.vocabularyMastered || 0} / 200</div>
            <div>Average Comfort: {(levelData.progress?.averageComfortScore || 0).toFixed(1)} / 8.0</div>
          </div>
        </div>
      )}
    </div>
  );
};

const getLevelDescription = (level: CEFRLevel): string => {
  const descriptions = {
    A1: 'Beginner',
    A2: 'Elementary',
    B1: 'Intermediate',
    B2: 'Upper Intermediate',
    C1: 'Advanced',
    C2: 'Proficient'
  };
  return descriptions[level];
};

// Vocabulary Mastery Chart
interface VocabularyMasteryProps {
  userId: string;
  language: LanguageCode;
}

export const VocabularyMastery: React.FC<VocabularyMasteryProps> = ({ userId, language }) => {
  const [vocabularyData, setVocabularyData] = useState<VocabularyDataType | null>(null);

  const loadVocabularyData = useCallback(async () => {
    const vocabulary = progressTrackingService.getUserVocabulary(userId, language);
    
    const masteryLevels = {
      beginner: vocabulary.filter(v => !v.mastered && v.practiceCount <= 2).length,
      learning: vocabulary.filter(v => !v.mastered && v.practiceCount > 2).length,
      mastered: vocabulary.filter(v => v.mastered).length
    };
    
    const difficultyBreakdown = {
      easy: vocabulary.filter(v => v.difficulty === 'easy').length,
      medium: vocabulary.filter(v => v.difficulty === 'medium').length,
      hard: vocabulary.filter(v => v.difficulty === 'hard').length
    };
    
    const recentlyLearned = vocabulary
      .sort((a, b) => b.learnedAt.getTime() - a.learnedAt.getTime())
      .slice(0, 10);
    
    setVocabularyData({
      total: vocabulary.length,
      masteryLevels,
      difficultyBreakdown,
      recentlyLearned
    });
  }, [userId, language]);

  useEffect(() => {
    loadVocabularyData();
  }, [loadVocabularyData]);

  if (!vocabularyData) {
    return <div className="bg-white rounded-lg shadow-lg p-6">Loading vocabulary data...</div>;
  }

  const { masteryLevels, difficultyBreakdown, recentlyLearned } = vocabularyData;
  const total = vocabularyData.total;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Vocabulary Mastery</h2>
      
      {/* Mastery Overview */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Progress Overview</h3>
        <div className="space-y-3">
          {Object.entries(masteryLevels).map(([level, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const colors = {
              beginner: 'bg-red-500',
              learning: 'bg-yellow-500',
              mastered: 'bg-green-500'
            };
            
            return (
              <div key={level} className="flex items-center space-x-4">
                <div className="w-20 text-sm font-medium capitalize">{level}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${colors[level as keyof typeof colors]} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="w-16 text-sm text-gray-600 text-right">
                  {count} ({Math.round(percentage)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Difficulty Breakdown */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Difficulty Distribution</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(difficultyBreakdown).map(([difficulty, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const colors = {
              easy: 'text-green-600 bg-green-100',
              medium: 'text-yellow-600 bg-yellow-100',
              hard: 'text-red-600 bg-red-100'
            };
            
            return (
              <div key={difficulty} className={`p-4 rounded-lg ${colors[difficulty as keyof typeof colors]}`}>
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm font-medium capitalize">{difficulty}</div>
                <div className="text-xs">{Math.round(percentage)}% of total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recently Learned */}
      <div>
        <h3 className="text-lg font-medium mb-4">Recently Learned</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {recentlyLearned.map((word: VocabularyItem, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  word.mastered ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <span className="font-medium">{word.word}</span>
                <span className="text-gray-500">-</span>
                <span className="text-gray-600">{word.translation}</span>
              </div>
              <div className="text-xs text-gray-500">
                {word.learnedAt.toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Session Analytics Component
interface SessionAnalyticsProps {
  userId: string;
  language: LanguageCode;
}

export const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({ userId, language }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDataType | null>(null);

  const loadAnalyticsData = useCallback(async () => {
    const sessions = progressTrackingService.getUserSessions(userId, language);
    const completedSessions = sessions.filter(s => s.completedAt);
    
    // Calculate analytics
    const totalSessions = completedSessions.length;
    const averageDuration = totalSessions > 0 
      ? completedSessions.reduce((sum, s) => sum + s.duration, 0) / totalSessions / 60 // in minutes
      : 0;
    
    const averageMessages = totalSessions > 0
      ? completedSessions.reduce((sum, s) => sum + s.messageCount, 0) / totalSessions
      : 0;
    
    const averageComfort = totalSessions > 0
      ? completedSessions.reduce((sum, s) => sum + (s.comfortScore || 5), 0) / totalSessions
      : 0;
    
    // Topic distribution
    const topicCounts = completedSessions.reduce((acc, session) => {
      acc[session.topic] = (acc[session.topic] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Performance trends (last 10 sessions)
    const recentSessions = completedSessions.slice(-10);
    const performanceTrend = recentSessions.map((session, index) => ({
      session: index + 1,
      comfort: session.comfortScore || 5,
      duration: session.duration / 60, // in minutes
      messages: session.messageCount
    }));
      setAnalyticsData({
      totalSessions,
      averageSessionDuration: averageDuration,
      averageMessages,
      averageComfort,
      topicCounts,
      performanceTrend
    });
  }, [userId, language]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (!analyticsData) {
    return <div className="bg-white rounded-lg shadow-lg p-6">Loading analytics...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Session Analytics</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{analyticsData.totalSessions}</div>
          <div className="text-sm text-blue-800">Total Sessions</div>
        </div>        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Math.round(analyticsData.averageSessionDuration)}m
          </div>
          <div className="text-sm text-green-800">Avg Duration</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(analyticsData.averageMessages)}
          </div>
          <div className="text-sm text-purple-800">Avg Messages</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">
            {analyticsData.averageComfort.toFixed(1)}
          </div>
          <div className="text-sm text-orange-800">Avg Comfort</div>
        </div>
      </div>

      {/* Topic Distribution */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Favorite Topics</h3>
        <div className="space-y-2">
          {Object.entries(analyticsData.topicCounts)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([topic, count]) => {
              const percentage = (count as number / analyticsData.totalSessions) * 100;
              return (
                <div key={topic} className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium capitalize">
                    {topic.replace('-', ' ')}
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="w-16 text-sm text-gray-600 text-right">
                    {count} ({Math.round(percentage)}%)
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Performance Trend */}
      <div>
        <h3 className="text-lg font-medium mb-4">Recent Performance Trend</h3>
        <div className="h-40 flex items-end justify-between space-x-1">
          {analyticsData.performanceTrend.map((data, index: number) => (
            <div key={index} className="flex flex-col items-center space-y-1 flex-1">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{
                  height: `${(data.comfort / 10) * 100}px`,
                  minHeight: '4px'
                }}
                title={`Session ${data.session}: Comfort ${data.comfort}/10`}
              />
              <span className="text-xs text-gray-500">{data.session}</span>
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          Comfort Score Trend (Last 10 Sessions)
        </div>
      </div>
    </div>
  );
};
