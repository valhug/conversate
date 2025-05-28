/**
 * Interactive Achievements System Component
 * Shows detailed achievements with progress tracking and celebration animations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@conversate/ui';
import { Button } from '@conversate/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@conversate/ui';
import { progressTrackingService, type ProgressUserProgress, type ProgressConversationSession, type VocabularyItem } from '../lib/progress-tracking-service';
import type { LanguageCode } from '@conversate/shared';

interface InteractiveAchievementsProps {
  userId: string;
  language: LanguageCode;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'conversation' | 'vocabulary' | 'streak' | 'milestone' | 'special';
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum';
  iconUrl: string;
  earnedAt?: Date;
  progress: number;
  threshold: number;
  reward?: {
    type: 'xp' | 'badge' | 'unlock';
    value: number | string;
  };
}

export const InteractiveAchievements: React.FC<InteractiveAchievementsProps> = ({
  userId,
  language
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [celebratingAchievement, setCelebratingAchievement] = useState<Achievement | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'all', label: 'All Categories', icon: '🎯' },
    { value: 'conversation', label: 'Conversations', icon: '💬' },
    { value: 'vocabulary', label: 'Vocabulary', icon: '📚' },
    { value: 'streak', label: 'Consistency', icon: '🔥' },
    { value: 'milestone', label: 'Milestones', icon: '🏁' },
    { value: 'special', label: 'Special', icon: '⭐' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Levels', color: 'gray' },
    { value: 'bronze', label: 'Bronze', color: 'orange' },
    { value: 'silver', label: 'Silver', color: 'gray' },
    { value: 'gold', label: 'Gold', color: 'yellow' },
    { value: 'platinum', label: 'Platinum', color: 'purple' }  ];

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    try {
      const userProgress = progressTrackingService.getUserProgress(userId, language);
      const sessions = progressTrackingService.getUserSessions(userId, language);
      const vocabulary = progressTrackingService.getUserVocabulary(userId, language);

      // Generate comprehensive achievements list
      const allAchievements = generateAchievements(userProgress, sessions, vocabulary);
      setAchievements(allAchievements);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, language]);

  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);

  const generateAchievements = (userProgress: ProgressUserProgress | null, sessions: ProgressConversationSession[], vocabulary: VocabularyItem[]): Achievement[] => {
    const completedSessions = sessions.filter(s => s.completedAt);
    const masteredWords = vocabulary.filter(v => v.mastered);
    const currentStreak = userProgress?.streakDays || 0;

    return [
      // Conversation Achievements
      {
        id: 'first_conversation',
        title: 'First Words',
        description: 'Complete your first conversation',
        category: 'conversation',
        difficulty: 'bronze',
        iconUrl: '🌟',
        progress: Math.min(completedSessions.length, 1),
        threshold: 1,
        reward: { type: 'xp', value: 100 }
      },
      {
        id: 'conversation_rookie',
        title: 'Conversation Rookie',
        description: 'Complete 10 conversations',
        category: 'conversation',
        difficulty: 'bronze',
        iconUrl: '🗣️',
        progress: Math.min(completedSessions.length, 10),
        threshold: 10,
        reward: { type: 'xp', value: 500 }
      },
      {
        id: 'conversation_enthusiast',
        title: 'Conversation Enthusiast',
        description: 'Complete 50 conversations',
        category: 'conversation',
        difficulty: 'silver',
        iconUrl: '💬',
        progress: Math.min(completedSessions.length, 50),
        threshold: 50,
        reward: { type: 'badge', value: 'Enthusiast Badge' }
      },
      {
        id: 'conversation_master',
        title: 'Conversation Master',
        description: 'Complete 100 conversations',
        category: 'conversation',
        difficulty: 'gold',
        iconUrl: '🎭',
        progress: Math.min(completedSessions.length, 100),
        threshold: 100,
        reward: { type: 'unlock', value: 'Advanced Topics' }
      },

      // Vocabulary Achievements
      {
        id: 'word_collector',
        title: 'Word Collector',
        description: 'Learn your first 10 words',
        category: 'vocabulary',
        difficulty: 'bronze',
        iconUrl: '📖',
        progress: Math.min(vocabulary.length, 10),
        threshold: 10,
        reward: { type: 'xp', value: 200 }
      },
      {
        id: 'vocabulary_builder',
        title: 'Vocabulary Builder',
        description: 'Master 50 words',
        category: 'vocabulary',
        difficulty: 'silver',
        iconUrl: '📚',
        progress: Math.min(masteredWords.length, 50),
        threshold: 50,
        reward: { type: 'xp', value: 1000 }
      },
      {
        id: 'word_wizard',
        title: 'Word Wizard',
        description: 'Master 200 words',
        category: 'vocabulary',
        difficulty: 'gold',
        iconUrl: '🧙‍♂️',
        progress: Math.min(masteredWords.length, 200),
        threshold: 200,
        reward: { type: 'badge', value: 'Wizard Badge' }
      },

      // Streak Achievements
      {
        id: 'consistency_starter',
        title: 'Consistency Starter',
        description: 'Study for 3 days in a row',
        category: 'streak',
        difficulty: 'bronze',
        iconUrl: '🔥',
        progress: Math.min(currentStreak, 3),
        threshold: 3,
        reward: { type: 'xp', value: 300 }
      },
      {
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Study for 7 days in a row',
        category: 'streak',
        difficulty: 'silver',
        iconUrl: '⚡',
        progress: Math.min(currentStreak, 7),
        threshold: 7,
        reward: { type: 'xp', value: 700 }
      },
      {
        id: 'dedication_champion',
        title: 'Dedication Champion',
        description: 'Study for 30 days in a row',
        category: 'streak',
        difficulty: 'gold',
        iconUrl: '🏆',
        progress: Math.min(currentStreak, 30),
        threshold: 30,
        reward: { type: 'badge', value: 'Champion Badge' }
      },

      // Milestone Achievements
      {
        id: 'level_up_a2',
        title: 'Elementary Graduate',
        description: 'Reach A2 level',
        category: 'milestone',
        difficulty: 'silver',
        iconUrl: '🎓',
        progress: ['A2', 'B1', 'B2', 'C1', 'C2'].includes(userProgress?.currentLevel || 'A1') ? 1 : 0,
        threshold: 1,
        reward: { type: 'unlock', value: 'Intermediate Conversations' }
      },
      {
        id: 'level_up_b1',
        title: 'Intermediate Achiever',
        description: 'Reach B1 level',
        category: 'milestone',
        difficulty: 'gold',
        iconUrl: '🥇',
        progress: ['B1', 'B2', 'C1', 'C2'].includes(userProgress?.currentLevel || 'A1') ? 1 : 0,
        threshold: 1,
        reward: { type: 'unlock', value: 'Professional Topics' }
      },

      // Special Achievements
      {
        id: 'perfect_score',
        title: 'Perfect Confidence',
        description: 'Complete a conversation with 10/10 comfort score',
        category: 'special',
        difficulty: 'gold',
        iconUrl: '💯',
        progress: sessions.some(s => s.comfortScore === 10) ? 1 : 0,
        threshold: 1,
        reward: { type: 'badge', value: 'Perfectionist Badge' }
      },
      {
        id: 'night_owl',
        title: 'Night Owl',
        description: 'Complete a conversation after 10 PM',
        category: 'special',
        difficulty: 'bronze',
        iconUrl: '🦉',
        progress: sessions.some(s => new Date(s.startedAt).getHours() >= 22) ? 1 : 0,
        threshold: 1,
        reward: { type: 'xp', value: 150 }
      },
      {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Complete a conversation before 7 AM',
        category: 'special',
        difficulty: 'bronze',
        iconUrl: '🐦',
        progress: sessions.some(s => new Date(s.startedAt).getHours() < 7) ? 1 : 0,
        threshold: 1,
        reward: { type: 'xp', value: 150 }
      }    ].map(achievement => ({
      ...achievement,
      earnedAt: achievement.progress >= achievement.threshold ? new Date() : undefined
    } as Achievement));
  };

  const filteredAchievements = achievements.filter(achievement => {
    const categoryMatch = selectedCategory === 'all' || achievement.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || achievement.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const earnedAchievements = filteredAchievements.filter(a => a.earnedAt);
  const availableAchievements = filteredAchievements.filter(a => !a.earnedAt);
  const handleClaimReward = (achievement: Achievement) => {
    setCelebratingAchievement(achievement);
    setTimeout(() => setCelebratingAchievement(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
          <p className="text-gray-600">
            {earnedAchievements.length} of {achievements.length} achievements earned
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  <span className="flex items-center space-x-2">
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty.value} value={difficulty.value}>
                  {difficulty.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Achievement Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {difficulties.slice(1).map((difficulty) => {
              const earned = earnedAchievements.filter(a => a.difficulty === difficulty.value).length;
              const total = achievements.filter(a => a.difficulty === difficulty.value).length;
              const percentage = total > 0 ? (earned / total) * 100 : 0;
              
              return (
                <div key={difficulty.value} className="text-center">
                  <div className="text-2xl font-bold">{earned}/{total}</div>
                  <div className="text-sm text-gray-600 capitalize">{difficulty.label}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full bg-${difficulty.color}-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(earnedAchievements.length / achievements.length) * 100}%` }}
            />
          </div>
          <div className="text-center text-sm text-gray-600 mt-2">
            Overall Progress: {Math.round((earnedAchievements.length / achievements.length) * 100)}%
          </div>
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>🏆</span>
              <span>Earned Achievements ({earnedAchievements.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isEarned={true}
                  onClaim={handleClaimReward}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🎯</span>
            <span>Available Achievements ({availableAchievements.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  isEarned={false}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🎉</div>
              <p>All achievements in this category earned!</p>
              <p className="text-sm">Try changing the filters to see more achievements.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Celebration Modal */}
      {celebratingAchievement && (
        <CelebrationModal
          achievement={celebratingAchievement}
          onClose={() => setCelebratingAchievement(null)}
        />
      )}
    </div>
  );
};

interface AchievementCardProps {
  achievement: Achievement;
  isEarned: boolean;
  onClaim?: (achievement: Achievement) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, isEarned, onClaim }) => {
  const percentage = (achievement.progress / achievement.threshold) * 100;
  const difficultyColor = {
    bronze: 'border-orange-300 bg-orange-50',
    silver: 'border-gray-300 bg-gray-50',
    gold: 'border-yellow-300 bg-yellow-50',
    platinum: 'border-purple-300 bg-purple-50'
  }[achievement.difficulty];

  return (
    <div className={`p-4 rounded-lg border-2 ${isEarned ? difficultyColor : 'border-gray-200 bg-gray-50 opacity-75'}`}>
      <div className="text-center">
        <div className="text-4xl mb-2 ${isEarned ? '' : 'grayscale'}">{achievement.iconUrl}</div>
        <h3 className={`font-bold ${isEarned ? 'text-gray-800' : 'text-gray-600'}`}>
          {achievement.title}
        </h3>
        <p className={`text-sm mt-1 ${isEarned ? 'text-gray-700' : 'text-gray-500'}`}>
          {achievement.description}
        </p>
        
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="capitalize font-medium">{achievement.difficulty}</span>
            <span>{achievement.progress} / {achievement.threshold}</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isEarned ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
        
        {isEarned && achievement.earnedAt && (
          <div className="mt-3">
            <p className="text-xs text-gray-500">
              Earned {achievement.earnedAt.toLocaleDateString()}
            </p>
            {achievement.reward && onClaim && (
              <Button
                size="sm"
                onClick={() => onClaim(achievement)}
                className="mt-2"
              >
                Claim Reward
              </Button>
            )}
          </div>
        )}
        
        {!isEarned && (
          <div className="mt-3">
            <p className="text-xs text-gray-500">
              {achievement.threshold - achievement.progress} more to go!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface CelebrationModalProps {
  achievement: Achievement;
  onClose: () => void;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({ achievement, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center animate-bounce">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h2>
        <div className="text-4xl mb-4">{achievement.iconUrl}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{achievement.title}</h3>
        <p className="text-gray-600 mb-4">{achievement.description}</p>
        
        {achievement.reward && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="font-medium text-yellow-800">Reward Earned:</div>
            <div className="text-yellow-700">
              {achievement.reward.type === 'xp' && `+${achievement.reward.value} XP`}
              {achievement.reward.type === 'badge' && achievement.reward.value}
              {achievement.reward.type === 'unlock' && `Unlocked: ${achievement.reward.value}`}
            </div>
          </div>
        )}
        
        <Button onClick={onClose} className="w-full">
          Awesome!
        </Button>
      </div>
    </div>
  );
};

export default InteractiveAchievements;
