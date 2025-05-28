/**
 * Progress Dashboard Component
 * Displays comprehensive learning progress and statistics
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@conversate/ui';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Book, 
  MessageCircle, 
  Clock, 
  Target,
  Trophy,
  Flame,
  BarChart3
} from 'lucide-react';
import { 
  progressTrackingService, 
  ProgressUserProgress, 
  ProgressStats
} from '@/lib/progress-tracking-service';
import type { LanguageCode } from '@conversate/shared';

interface ProgressDashboardProps {
  userId: string;
  language: LanguageCode;
}

export function ProgressDashboard({ userId, language }: ProgressDashboardProps) {
  const [userProgress, setUserProgress] = useState<ProgressUserProgress | null>(null);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('weekly');

  const loadProgressData = useCallback(() => {
    const progress = progressTrackingService.getUserProgress(userId, language);
    const stats = progressTrackingService.getProgressStats(userId, language);
    
    setUserProgress(progress);
    setProgressStats(stats);
  }, [userId, language]);

  useEffect(() => {
    loadProgressData();
  }, [loadProgressData]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!userProgress || !progressStats) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Progress</h1>
          <p className="text-muted-foreground">
            Tracking your {language.toUpperCase()} learning journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Level {userProgress.cefrLevel}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {userProgress.levelProgress}% Complete
          </Badge>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sessions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{userProgress.totalSessions}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>        {/* Vocabulary Size */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Words Learned</p>
                <p className="text-2xl font-bold">{userProgress.masteredWords}</p>
              </div>
              <Book className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {/* Time Spent */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Practiced</p>
                <p className="text-2xl font-bold">{formatTime(userProgress.totalTimeSpent)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{userProgress.streakDays} days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Level Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Level: {userProgress.cefrLevel}</span>
              <span className="text-sm text-muted-foreground">{userProgress.levelProgress}%</span>
            </div>
            <Progress 
              value={userProgress.levelProgress} 
              className="h-3"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="font-semibold">{userProgress.totalSessions}</p>
              </div>              <div className="text-center">
                <p className="text-sm text-muted-foreground">Vocabulary</p>
                <p className="font-semibold">{userProgress.masteredWords}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Mastered</p>
                <p className="font-semibold">{userProgress.masteredWords}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics with Timeframe Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Statistics
            </CardTitle>
            <div className="flex gap-1">
              {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className="text-xs"
                >
                  {timeframe === 'allTime' ? 'All Time' : timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>          {selectedTimeframe === 'daily' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{progressStats.daily.sessionsCompleted}</p>
                <p className="text-sm text-muted-foreground">Sessions Today</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{progressStats.daily.averageComfortScore.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Comfort Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatTime(progressStats.daily.timeSpent)}</p>
                <p className="text-sm text-muted-foreground">Time Spent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{progressStats.daily.wordsLearned}</p>
                <p className="text-sm text-muted-foreground">Words Learned</p>
              </div>
            </div>
          )}          {selectedTimeframe === 'weekly' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{progressStats.weekly.sessionsCompleted}</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{progressStats.weekly.averageComfortScore.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Comfort Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatTime(progressStats.weekly.timeSpent)}</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{progressStats.weekly.wordsLearned}</p>
                <p className="text-sm text-muted-foreground">Words Learned</p>
              </div>
            </div>
          )}          {selectedTimeframe === 'monthly' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{progressStats.monthly.sessionsCompleted}</p>
                <p className="text-sm text-muted-foreground">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{progressStats.monthly.wordsLearned}</p>
                <p className="text-sm text-muted-foreground">Words Learned</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatTime(progressStats.monthly.timeSpent)}</p>
                <p className="text-sm text-muted-foreground">Time Spent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{progressStats.monthly.topicsExplored.length}</p>
                <p className="text-sm text-muted-foreground">Topics</p>
              </div>
            </div>
          )}          {selectedTimeframe === 'allTime' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{progressStats.allTime.totalSessions}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{progressStats.allTime.totalWordsLearned}</p>
                <p className="text-sm text-muted-foreground">Total Words</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{formatTime(progressStats.allTime.totalTimeSpent)}</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{progressStats.allTime.languagesStudied.length}</p>
                <p className="text-sm text-muted-foreground">Languages</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      {userProgress.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">              {userProgress.achievements.slice(-6).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <div className="text-2xl">🏆</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.earnedAt ? formatDate(achievement.earnedAt) : 'Recently earned'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Learning Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Progress Summary</h4>                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• You&apos;ve completed {userProgress.totalSessions} conversation sessions</li>
                  <li>• You&apos;ve learned {userProgress.masteredWords} new words</li>
                  <li>• You&apos;ve practiced for {formatTime(userProgress.totalTimeSpent)} total</li>
                  <li>• You&apos;re {userProgress.levelProgress}% through {userProgress.cefrLevel} level</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Next Goals</h4>                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Reach {userProgress.totalSessions + 5} total sessions</li>
                  <li>• Learn {Math.ceil((userProgress.masteredWords + 10) / 10) * 10} vocabulary words</li>
                  <li>• Maintain your {userProgress.streakDays}-day streak</li>
                  <li>• Complete {userProgress.cefrLevel} level progress</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProgressDashboard;
