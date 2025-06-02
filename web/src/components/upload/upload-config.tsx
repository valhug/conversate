'use client';

import React from 'react';
import { Globe, BookOpen } from 'lucide-react';

interface UploadConfigProps {
  language: string;
  cefrLevel: string;
  onLanguageChange: (language: string) => void;
  onCefrLevelChange: (level: string) => void;
  className?: string;
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
];

const CEFR_LEVELS = [
  { code: 'A1', name: 'A1 - Beginner', description: 'Basic words and phrases' },
  { code: 'A2', name: 'A2 - Elementary', description: 'Simple everyday expressions' },
  { code: 'B1', name: 'B1 - Intermediate', description: 'Clear main points on familiar topics' },
  { code: 'B2', name: 'B2 - Upper Intermediate', description: 'Complex topics and abstract ideas' },
  { code: 'C1', name: 'C1 - Advanced', description: 'Flexible and effective language use' },
  { code: 'C2', name: 'C2 - Proficient', description: 'Near-native level fluency' },
];

export function UploadConfigComponent({
  language,
  cefrLevel,
  onLanguageChange,
  onCefrLevelChange,
  className = ''
}: UploadConfigProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Language Selection */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Globe className="w-5 h-5 text-blue-600" />
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Content Language
          </label>
        </div>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Select the primary language of your uploaded content
        </p>
      </div>

      {/* CEFR Level Selection */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <BookOpen className="w-5 h-5 text-green-600" />
          <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Learning Level (CEFR)
          </label>
        </div>
        <select
          value={cefrLevel}
          onChange={(e) => onCefrLevelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          {CEFR_LEVELS.map((level) => (
            <option key={level.code} value={level.code}>
              {level.name}
            </option>
          ))}
        </select>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {CEFR_LEVELS.find(l => l.code === cefrLevel)?.description || 
           'Select your current proficiency level'}
        </div>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Upload Tips
        </h4>        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
          <li>• <strong>Video files:</strong> We&apos;ll extract audio and create conversation segments</li>
          <li>• <strong>Audio files:</strong> We&apos;ll transcribe and identify learning opportunities</li>
          <li>• <strong>Text files:</strong> We&apos;ll analyze content and create practice conversations</li>
          <li>• <strong>Processing time:</strong> Typically 1-3 minutes depending on file size</li>
        </ul>
      </div>
    </div>
  );
}
