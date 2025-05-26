// CEFR Language Levels
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CEFRLevel = typeof CEFR_LEVELS[number];

// Supported Languages
export const SUPPORTED_LANGUAGES = {
  ENGLISH: 'en',
  SPANISH: 'es', 
  FRENCH: 'fr',
  TAGALOG: 'tl'
} as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];

// Conversation Topics
export const CONVERSATION_TOPICS = {
  DAILY_LIFE: 'daily_life',
  BUSINESS: 'business',
  TRAVEL: 'travel',
  FOOD: 'food',
  CULTURE: 'culture',
  EDUCATION: 'education',
  HEALTH: 'health',
  TECHNOLOGY: 'technology',
  ENTERTAINMENT: 'entertainment',
  FAMILY: 'family'
} as const;

export type ConversationTopic = typeof CONVERSATION_TOPICS[keyof typeof CONVERSATION_TOPICS];

// Session Types
export const SESSION_TYPES = {
  AI: 'ai',
  HUMAN: 'human'
} as const;

export type SessionType = typeof SESSION_TYPES[keyof typeof SESSION_TYPES];

// File Upload Constants
export const SUPPORTED_FILE_FORMATS = {
  VIDEO: ['mp4', 'mov', 'avi', 'webm'],
  AUDIO: ['mp3', 'wav', 'm4a', 'ogg'],
  TEXT: ['txt', 'docx', 'pdf', 'srt']
} as const;

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  FREE: 'free',
  PREMIUM: 'premium',
  PRO: 'pro'
} as const;

export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[keyof typeof SUBSCRIPTION_TIERS];

// API Response Status
export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading'
} as const;

export type ApiStatus = typeof API_STATUS[keyof typeof API_STATUS];

// Comfort Score Range
export const COMFORT_SCORE_RANGE = {
  MIN: 1,
  MAX: 10
} as const;

// Daily Limits for Free Tier
export const FREE_TIER_LIMITS = {
  DAILY_CONVERSATIONS: 3,
  DAILY_EVALUATIONS: 5,
  FLASHCARD_REVIEWS: 50
} as const;
