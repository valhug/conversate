// Language definitions with human-readable names
export const LANGUAGES = {
  'en': { code: 'en', name: 'English', nativeName: 'English' },
  'es': { code: 'es', name: 'Spanish', nativeName: 'Español' },
  'fr': { code: 'fr', name: 'French', nativeName: 'Français' },
  'tl': { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog' }
} as const;

// Additional commonly spoken languages for native language selection
export const COMMON_LANGUAGES = {
  ...LANGUAGES,
  'zh': { code: 'zh', name: 'Chinese', nativeName: '中文' },
  'hi': { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  'ar': { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  'pt': { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  'ru': { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  'ja': { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  'de': { code: 'de', name: 'German', nativeName: 'Deutsch' },
  'ko': { code: 'ko', name: 'Korean', nativeName: '한국어' },
  'it': { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  'th': { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  'vi': { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  'tr': { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  'pl': { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  'nl': { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  'sv': { code: 'sv', name: 'Swedish', nativeName: 'Svenska' }
} as const;

export type TargetLanguageCode = keyof typeof LANGUAGES;
export type NativeLanguageCode = keyof typeof COMMON_LANGUAGES;

export const getLanguageDisplay = (code: string): string => {
  const lang = COMMON_LANGUAGES[code as NativeLanguageCode];
  return lang ? `${lang.name} (${lang.nativeName})` : code;
};

export const isTargetLanguage = (code: string): code is TargetLanguageCode => {
  return code in LANGUAGES;
};

// Get sorted arrays for dropdowns
export const getTargetLanguageOptions = () => {
  return Object.values(LANGUAGES).sort((a, b) => a.name.localeCompare(b.name));
};

export const getNativeLanguageOptions = () => {
  return Object.values(COMMON_LANGUAGES).sort((a, b) => a.name.localeCompare(b.name));
};