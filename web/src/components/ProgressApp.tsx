/**
 * Main Progress Application Component
 * Integrates all progress tracking components with navigation and routing
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@conversate/ui';
import { Button } from '@conversate/ui';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@conversate/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@conversate/ui';

// Import our progress components
import { EnhancedProgressDashboard } from './EnhancedProgressDashboard';
import { ProgressSettings } from './ProgressSettings';
import { InteractiveAchievements } from './InteractiveAchievements';
import { ComprehensiveProgressPage } from './ComprehensiveProgressPage';

// Import the progress service
import { progressTrackingService, type ProgressUserProgress, type ProgressConversationSession, type VocabularyItem, type ProgressStats } from '../lib/progress-tracking-service';
import type { LanguageCode } from '@conversate/shared';

interface ProgressAppProps {
  userId: string;
  defaultLanguage?: LanguageCode;
  onNavigateToConversation?: () => void;
  onNavigateToVocabularyPractice?: () => void;
  onNavigateToLessonPlanner?: () => void;
}

type ViewType = 'dashboard' | 'comprehensive' | 'achievements' | 'settings' | 'analytics';

export const ProgressApp: React.FC<ProgressAppProps> = ({
  userId,
  defaultLanguage = 'en',
  onNavigateToConversation,
  onNavigateToVocabularyPractice,
  onNavigateToLessonPlanner
}) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(defaultLanguage);  const [userProgress, setUserProgress] = useState<ProgressUserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const availableLanguages = [
    { code: 'en' as LanguageCode, name: 'English', flag: '🇺🇸' },
    { code: 'es' as LanguageCode, name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr' as LanguageCode, name: 'French', flag: '🇫🇷' },
    { code: 'de' as LanguageCode, name: 'German', flag: '🇩🇪' },
    { code: 'it' as LanguageCode, name: 'Italian', flag: '🇮🇹' },
  ];

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', description: 'Overview of your progress' },
    { id: 'comprehensive', label: 'Detailed Stats', icon: '📈', description: 'Comprehensive progress analysis' },
    { id: 'achievements', label: 'Achievements', icon: '🏆', description: 'Your earned achievements and goals' },
    { id: 'analytics', label: 'Analytics', icon: '🔍', description: 'Advanced analytics and insights' },
    { id: 'settings', label: 'Settings', icon: '⚙️', description: 'Customize your learning experience' }
  ];
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

  const handleLanguageChange = (newLanguage: LanguageCode) => {
    setSelectedLanguage(newLanguage);
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const handleSettingsChanged = () => {
    // Refresh user progress when settings change
    loadUserProgress();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <EnhancedProgressDashboard
            userId={userId}
            defaultLanguage={selectedLanguage}
            onNavigateToConversation={onNavigateToConversation}
            onNavigateToVocabulary={onNavigateToVocabularyPractice}
          />
        );
        
      case 'comprehensive':
        return (
          <ComprehensiveProgressPage userId={userId} />
        );
        
      case 'achievements':
        return (
          <InteractiveAchievements
            userId={userId}
            language={selectedLanguage}
          />
        );
        
      case 'analytics':
        return (
          <AdvancedAnalyticsView
            userId={userId}
            language={selectedLanguage}
            userProgress={userProgress}
          />
        );
        
      case 'settings':
        return (
          <ProgressSettings
            userId={userId}
            language={selectedLanguage}
            onSettingsChanged={handleSettingsChanged}
          />
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Progress</h2>
          <p className="text-gray-600">Analyzing your learning journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  📚 Conversate Progress
                </h1>
              </div>
            </div>

            {/* Navigation Menu */}
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-1">
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.id}>
                    <Button
                      onClick={() => handleViewChange(item.id as ViewType)}
                      variant={currentView === item.id ? "default" : "ghost"}
                      className="flex items-center space-x-2"
                    >
                      <span>{item.icon}</span>
                      <span className="hidden sm:inline">{item.label}</span>
                    </Button>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Language Selector and User Info */}
            <div className="flex items-center space-x-4">
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {availableLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span className="hidden sm:inline">{lang.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {userProgress && (
                <div className="flex items-center space-x-2 text-sm">
                  <span className="hidden md:inline text-gray-600">Level:</span>
                  <span className="font-medium">{userProgress.currentLevel}</span>
                  <span className="hidden md:inline text-gray-600">•</span>
                  <span className="flex items-center space-x-1">
                    <span>🔥</span>
                    <span className="font-medium">{userProgress.streakDays || 0}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Quick Actions Bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-medium text-gray-900">
                {navigationItems.find(item => item.id === currentView)?.label}
              </h2>
              <span className="text-sm text-gray-600">
                {navigationItems.find(item => item.id === currentView)?.description}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={onNavigateToConversation}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                💬 New Conversation
              </Button>
              <Button
                onClick={onNavigateToVocabularyPractice}
                size="sm"
                variant="outline"
              >
                📚 Practice Words
              </Button>
              {onNavigateToLessonPlanner && (
                <Button
                  onClick={onNavigateToLessonPlanner}
                  size="sm"
                  variant="outline"
                >
                  📅 Plan Lessons
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              © 2024 Conversate. Track your language learning progress.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Language: {availableLanguages.find(l => l.code === selectedLanguage)?.name}</span>
              {userProgress && (
                <>
                  <span>•</span>
                  <span>Total Sessions: {userProgress.conversationsCompleted || 0}</span>
                  <span>•</span>
                  <span>Words Learned: {userProgress.vocabularyMastered || 0}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Advanced Analytics View Component
interface AdvancedAnalyticsViewProps {
  userId: string;
  language: LanguageCode;
  userProgress: ProgressUserProgress | null;
}

interface AnalyticsData {
  sessions: ProgressConversationSession[];
  vocabulary: VocabularyItem[];
  stats: ProgressStats;
  timeRange: string;
}

const AdvancedAnalyticsView: React.FC<AdvancedAnalyticsViewProps> = ({
  userId,
  language
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const loadAnalyticsData = useCallback(async () => {
    const sessions = progressTrackingService.getUserSessions(userId, language);
    const vocabulary = progressTrackingService.getUserVocabulary(userId, language);
    const stats = progressTrackingService.getProgressStats(userId, language);

    // Calculate advanced analytics
    const now = new Date();
    const timeRangeMs = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000
    }[timeRange];

    const filteredSessions = sessions.filter(
      s => s.startedAt >= new Date(now.getTime() - timeRangeMs)
    );

    setAnalyticsData({
      sessions: filteredSessions,
      vocabulary,
      stats,
      timeRange
    });
  }, [userId, language, timeRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Advanced Analytics</CardTitle>            <Select value={timeRange} onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'year')}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analyticsData.sessions.length}
              </div>
              <div className="text-sm text-blue-800">Sessions</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(analyticsData.sessions.reduce((sum: number, s: ProgressConversationSession) => sum + s.duration, 0) / 60)}m
              </div>
              <div className="text-sm text-green-800">Study Time</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {analyticsData.vocabulary.filter((v: VocabularyItem) => v.mastered).length}
              </div>
              <div className="text-sm text-purple-800">Words Mastered</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {analyticsData.sessions.length > 0 
                  ? (analyticsData.sessions.reduce((sum: number, s: ProgressConversationSession) => sum + (s.comfortScore || 5), 0) / analyticsData.sessions.length).toFixed(1)
                  : '0'
                }
              </div>
              <div className="text-sm text-orange-800">Avg Comfort</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Include existing advanced components */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* These would be imported from AdvancedProgressComponents */}
        <Card>
          <CardHeader>
            <CardTitle>Session Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Session timing and frequency analysis would go here</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Learning Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Progress speed and acceleration metrics would go here</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressApp;
