/**
 * Progress Settings Component
 * Allows users to customize their learning goals and preferences
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@conversate/ui';
import { Button } from '@conversate/ui';
import { Input } from '@conversate/ui';
import { Label } from '@conversate/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@conversate/ui';
import { progressTrackingService } from '../lib/progress-tracking-service';
import type { LanguageCode, CEFRLevel } from '@conversate/shared';

interface ProgressSettingsProps {
  userId: string;
  language: LanguageCode;
  onSettingsChanged?: () => void;
}

export const ProgressSettings: React.FC<ProgressSettingsProps> = ({
  userId,
  language,
  onSettingsChanged
}) => {
  const [settings, setSettings] = useState({
    dailyGoal: 30, // minutes
    weeklyGoal: 180, // minutes
    targetLevel: 'B1' as CEFRLevel,
    reminderTime: '19:00',
    enableNotifications: true,
    preferredTopics: [] as string[],
    studyDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as string[]
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const availableTopics = [
    'travel', 'business', 'food', 'culture', 'technology', 
    'sports', 'entertainment', 'education', 'health', 'family'
  ];

  const daysOfWeek = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }  ];

  const loadSettings = useCallback(async () => {
    try {
      const userProgress = progressTrackingService.getUserProgress(userId, language);
      if (userProgress) {
        setSettings({
          dailyGoal: userProgress.dailyGoal || 30,
          weeklyGoal: userProgress.weeklyGoal || 180,
          targetLevel: userProgress.targetLevel || 'B1',
          reminderTime: userProgress.reminderTime || '19:00',
          enableNotifications: userProgress.enableNotifications ?? true,
          preferredTopics: userProgress.preferredTopics || [],
          studyDays: userProgress.studyDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, [userId, language]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaved(false);
    
    try {
      // Update user progress with new settings
      const currentProgress = progressTrackingService.getUserProgress(userId, language);
      const updatedProgress = {
        ...currentProgress,
        ...settings,
        lastUpdated: new Date()
      };
      
      // Save to localStorage (would be API call in real app)
      const storageKey = `progress_${userId}_${language}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedProgress));
      
      setSaved(true);
      onSettingsChanged?.();
      
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTopicToggle = (topic: string) => {
    setSettings(prev => ({
      ...prev,
      preferredTopics: prev.preferredTopics.includes(topic)
        ? prev.preferredTopics.filter(t => t !== topic)
        : [...prev.preferredTopics, topic]
    }));
  };

  const handleStudyDayToggle = (day: string) => {
    setSettings(prev => ({
      ...prev,
      studyDays: prev.studyDays.includes(day)
        ? prev.studyDays.filter(d => d !== day)
        : [...prev.studyDays, day]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Learning Settings</h1>
        <p className="text-gray-600">Customize your language learning experience</p>
      </div>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🎯</span>
            <span>Learning Goals</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dailyGoal">Daily Goal (minutes)</Label>
              <Input
                id="dailyGoal"
                type="number"
                value={settings.dailyGoal}
                onChange={(e) => setSettings(prev => ({ ...prev, dailyGoal: parseInt(e.target.value) || 30 }))}
                min="5"
                max="240"
              />
              <p className="text-sm text-gray-600">Recommended: 15-60 minutes per day</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weeklyGoal">Weekly Goal (minutes)</Label>
              <Input
                id="weeklyGoal"
                type="number"
                value={settings.weeklyGoal}
                onChange={(e) => setSettings(prev => ({ ...prev, weeklyGoal: parseInt(e.target.value) || 180 }))}
                min="30"
                max="1200"
              />
              <p className="text-sm text-gray-600">Recommended: 2-6 hours per week</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetLevel">Target CEFR Level</Label>
            <Select 
              value={settings.targetLevel} 
              onValueChange={(value) => setSettings(prev => ({ ...prev, targetLevel: value as CEFRLevel }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A1">A1 - Beginner</SelectItem>
                <SelectItem value="A2">A2 - Elementary</SelectItem>
                <SelectItem value="B1">B1 - Intermediate</SelectItem>
                <SelectItem value="B2">B2 - Upper Intermediate</SelectItem>
                <SelectItem value="C1">C1 - Advanced</SelectItem>
                <SelectItem value="C2">C2 - Proficient</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Study Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📅</span>
            <span>Study Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Study Days</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {daysOfWeek.map((day) => (
                <Button
                  key={day.id}
                  variant={settings.studyDays.includes(day.id) ? "default" : "outline"}
                  onClick={() => handleStudyDayToggle(day.id)}
                  className="justify-start"
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminderTime">Daily Reminder Time</Label>
            <Input
              id="reminderTime"
              type="time"
              value={settings.reminderTime}
              onChange={(e) => setSettings(prev => ({ ...prev, reminderTime: e.target.value }))}
            />
            <p className="text-sm text-gray-600">When would you like to be reminded to study?</p>
          </div>
        </CardContent>
      </Card>

      {/* Preferred Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💭</span>
            <span>Preferred Topics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Select topics you&apos;re most interested in practicing:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {availableTopics.map((topic) => (
                <Button
                  key={topic}
                  variant={settings.preferredTopics.includes(topic) ? "default" : "outline"}
                  onClick={() => handleTopicToggle(topic)}
                  className="justify-start capitalize"
                  size="sm"
                >
                  {topic}
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Selected: {settings.preferredTopics.length} topics
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>🔔</span>
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Enable Study Reminders</h3>
              <p className="text-sm text-gray-600">Get daily reminders to practice</p>
            </div>
            <Button
              variant={settings.enableNotifications ? "default" : "outline"}
              onClick={() => setSettings(prev => ({ ...prev, enableNotifications: !prev.enableNotifications }))}
            >
              {settings.enableNotifications ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📊</span>
            <span>Goal Impact Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.ceil(settings.weeklyGoal / settings.dailyGoal)}
                </div>
                <div className="text-sm text-blue-800">Study days needed/week</div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {settings.studyDays.length}
                </div>
                <div className="text-sm text-green-800">Study days selected</div>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((settings.weeklyGoal * 4) / 60)}h
                </div>
                <div className="text-sm text-purple-800">Monthly study time</div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Recommendation</h4>
              {settings.studyDays.length >= Math.ceil(settings.weeklyGoal / settings.dailyGoal) ? (
                <p className="text-green-700 text-sm">
                  ✅ Your schedule looks achievable! You have enough study days to meet your weekly goal.
                </p>
              ) : (
                <p className="text-orange-700 text-sm">
                  ⚠️ Consider adding more study days or reducing your daily goal to make your schedule more realistic.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={loadSettings}>
          Reset Changes
        </Button>
        <Button 
          onClick={handleSaveSettings} 
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : saved ? (
            <>
              ✓ Saved!
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProgressSettings;
