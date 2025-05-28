/**
 * Progress Dashboard Component Example
 * Shows how to build UI components for displaying progress statistics
 */

import React, { useState, useEffect, useCallback } from 'react';
import { type Achievement } from '../lib/progress-tracking-service';
import { ProgressTrackingUtils } from '../lib/progress-usage-examples';
import type { LanguageCode } from '@conversate/shared';

interface ProgressDashboardProps {
  userId: string;
  language: LanguageCode;
}

interface DashboardData {
  overview: {
    totalSessions: number;
    totalStudyTime: number;
    currentStreak: number;
    averageComfortScore: number;
  };
  vocabulary: {
    mastered: number;
    total: number;
    recent: Array<{
      word: string;
      translation: string;
      learnedAt: Date;
      mastered: boolean;
      practiceCount: number;
    }>;
  };
  chartData: Array<{
    date: string;
    sessions: number;
    vocabulary: number;
    studyTime: number;
  }>;
  achievements: Achievement[];
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ userId, language }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('weekly');

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const data: DashboardData = await ProgressTrackingUtils.getAnalyticsDashboardData(userId, language);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, language]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading progress...</div>;
  }

  if (!dashboardData) {
    return <div className="text-center p-8">No progress data available</div>;
  }

  return (
    <div className="progress-dashboard max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Learning Progress</h1>
        <p className="text-gray-600">Track your language learning journey</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Conversations"
          value={dashboardData.overview.totalSessions}
          icon="💬"
          color="blue"
        />
        <StatCard
          title="Study Time"
          value={`${Math.round(dashboardData.overview.totalStudyTime)}m`}
          icon="⏱️"
          color="green"
        />
        <StatCard
          title="Current Streak"
          value={`${dashboardData.overview.currentStreak} days`}
          icon="🔥"
          color="orange"
        />
        <StatCard
          title="Vocabulary"
          value={dashboardData.vocabulary.mastered}
          subtitle={`/ ${dashboardData.vocabulary.total} total`}
          icon="📚"
          color="purple"
        />
      </div>

      {/* Progress Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Learning Activity</h2>
          <TimeframeSelector
            selected={selectedTimeframe}
            onChange={setSelectedTimeframe}
          />
        </div>
        <ProgressChart data={dashboardData.chartData} timeframe={selectedTimeframe} />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Achievements</h2>
          <AchievementsList achievements={dashboardData.achievements} />
        </div>

        {/* Recent Vocabulary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Vocabulary</h2>
          <VocabularyList vocabulary={dashboardData.vocabulary.recent} />
        </div>
      </div>

      {/* Comfort Score Trend */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Comfort Score Trend</h2>
        <ComfortScoreTrend score={dashboardData.overview.averageComfortScore} />
      </div>
    </div>
  );
};

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: 'blue' | 'green' | 'orange' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    green: 'bg-green-50 border-green-200 text-green-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800'
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs opacity-70">{subtitle}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

// Timeframe Selector Component
interface TimeframeSelectorProps {
  selected: 'daily' | 'weekly' | 'monthly' | 'allTime';
  onChange: (timeframe: 'daily' | 'weekly' | 'monthly' | 'allTime') => void;
}

const TimeframeSelector: React.FC<TimeframeSelectorProps> = ({ selected, onChange }) => {
  const options = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'allTime', label: 'All Time' }
  ] as const;

  return (
    <div className="flex rounded-lg bg-gray-100 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            selected === option.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

// Progress Chart Component (simplified)
interface ProgressChartProps {
  data: Array<{
    date: string;
    sessions: number;
    vocabulary: number;
    studyTime: number;
  }>;
  timeframe: string;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  // This would integrate with a charting library like Chart.js or Recharts
  const maxSessions = Math.max(...data.map(d => d.sessions));
  const maxStudyTime = Math.max(...data.map(d => d.studyTime));

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          <span>Sessions</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span>Study Time (min)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
          <span>Vocabulary</span>
        </div>
      </div>
        <div className="h-64 flex items-end justify-between space-x-1">
        {data.slice(-14).map((day) => (
          <div key={day.date} className="flex flex-col items-center space-y-1 flex-1">
            {/* Sessions bar */}
            <div
              className="w-full bg-blue-500 rounded-t"
              style={{
                height: `${(day.sessions / Math.max(maxSessions, 1)) * 60}px`,
                minHeight: day.sessions > 0 ? '2px' : '0px'
              }}
            />
            {/* Study time bar */}
            <div
              className="w-full bg-green-500"
              style={{
                height: `${(day.studyTime / Math.max(maxStudyTime, 1)) * 60}px`,
                minHeight: day.studyTime > 0 ? '2px' : '0px'
              }}
            />
            {/* Vocabulary bar */}
            <div
              className="w-full bg-purple-500 rounded-b"
              style={{
                height: `${(day.vocabulary / Math.max(10, 1)) * 60}px`,
                minHeight: day.vocabulary > 0 ? '2px' : '0px'
              }}
            />
            <span className="text-xs text-gray-500 mt-2">
              {new Date(day.date).getDate()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Achievements List Component
interface AchievementsListProps {
  achievements: Achievement[];
}

const AchievementsList: React.FC<AchievementsListProps> = ({ achievements }) => {
  const recentAchievements = achievements
    .filter((a): a is Achievement & { earnedAt: Date } => !!a.earnedAt)
    .sort((a, b) => b.earnedAt.getTime() - a.earnedAt.getTime())
    .slice(0, 5);

  if (recentAchievements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🎯</div>
        <p>Complete your first conversation to earn achievements!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recentAchievements.map((achievement) => (
        <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-2xl">🏆</div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{achievement.title}</h3>
            <p className="text-sm text-gray-600">{achievement.description}</p>
            <p className="text-xs text-gray-500">
              Earned {achievement.earnedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

// Vocabulary List Component
interface VocabularyListProps {
  vocabulary: Array<{
    word: string;
    translation: string;
    learnedAt: Date;
    mastered: boolean;
    practiceCount: number;
  }>;
}

const VocabularyList: React.FC<VocabularyListProps> = ({ vocabulary }) => {
  if (vocabulary.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📚</div>
        <p>Start conversations to learn new vocabulary!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
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
            <div>{new Date(word.learnedAt).toLocaleDateString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Comfort Score Trend Component
interface ComfortScoreTrendProps {
  score: number;
}

const ComfortScoreTrend: React.FC<ComfortScoreTrendProps> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 8) return 'Excellent! You\'re very comfortable with conversations.';
    if (score >= 6) return 'Good progress! Keep practicing to build more confidence.';
    return 'Keep going! Regular practice will boost your comfort level.';
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-lg font-medium">Average Comfort Score</span>
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
            {score.toFixed(1)}/10
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(score / 10) * 100}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">{getScoreDescription(score)}</p>
      </div>
      <div className="text-4xl">
        {score >= 8 ? '😊' : score >= 6 ? '🙂' : '🤔'}
      </div>
    </div>
  );
};

// Export all components
export {
  StatCard,
  TimeframeSelector,
  ProgressChart,
  AchievementsList,
  VocabularyList,
  ComfortScoreTrend
};
