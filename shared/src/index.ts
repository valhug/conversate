// Export all shared modules
export * from './constants';
export * from './types';
export * from './api-client';
export * from './utils';

// Export languages with explicit naming to avoid conflicts
export { 
  LANGUAGES, 
  COMMON_LANGUAGES, 
  getLanguageDisplay, 
  isTargetLanguage, 
  getTargetLanguageOptions, 
  getNativeLanguageOptions,
  type TargetLanguageCode,
  type NativeLanguageCode
} from './languages';
