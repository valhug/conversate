import { z } from 'zod';
import type { LanguageCode, ConversationTopic } from './constants';

// User Types
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(50),
  nativeLanguage: z.string(),
  targetLanguages: z.array(z.string()),
  speechSignature: z.record(z.unknown()).optional(),
  subscriptionTier: z.enum(['free', 'premium', 'pro']),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type User = z.infer<typeof UserSchema>;

// Authentication Types
export const RegisterRequestSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  nativeLanguage: z.string().min(2),
  targetLanguages: z.array(z.string()).min(1).max(4)
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const AuthResponseSchema = z.object({
  success: z.boolean(),
  user: UserSchema.optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  error: z.string().optional(),
  message: z.string().optional()
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Conversation Types
export interface Conversation {
  id: string;
  title: string;
  description: string;
  language: LanguageCode;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic: ConversationTopic;
  difficulty: number; // 1-10 scale
  estimatedDuration: number; // in minutes
  tags: string[];
  culturalContext?: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationRequest {
  message: string;
  conversationId?: string;
  sessionId?: string;
  language: LanguageCode;
  cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  topic?: ConversationTopic;
}

export interface ConversationResponse {
  message: string;
  conversationId: string;
  sessionId: string;
  suggestions?: string[];
  vocabularyWords?: VocabularyWord[];
  comfortScoreUpdate?: number;
}

export interface VocabularyWord {
  word: string;
  translation: string;
  context: string;
  difficulty: 'easy' | 'medium' | 'hard';
  partOfSpeech: string;
}

// Speech-to-Text Types
export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  language: LanguageCode;
  duration: number;
}

export interface SpeechSynthesisRequest {
  text: string;
  language: LanguageCode;
  voice?: string;
  speed?: number; // 0.5 - 2.0
  pitch?: number; // 0.0 - 2.0
}

// Session Types
export const ConversationSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  conversationId: z.string().uuid(),
  sessionType: z.enum(['ai', 'human']),
  partnerId: z.string().uuid().optional(),
  transcript: z.array(z.record(z.unknown())),
  performanceMetrics: z.record(z.unknown()).optional(),
  durationSeconds: z.number().positive(),
  startedAt: z.date(),
  completedAt: z.date().optional()
});

export type ConversationSession = z.infer<typeof ConversationSessionSchema>;

// Progress Types
export const UserProgressSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  conversationId: z.string().uuid(),
  comfortScore: z.number().min(1).max(10),
  completionCount: z.number().min(0),
  lastAttempted: z.date(),
  vocabularyLearned: z.array(z.string())
});

export type UserProgress = z.infer<typeof UserProgressSchema>;

// Flashcard Types
export const FlashcardSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  conversationId: z.string().uuid(),
  sourceText: z.string().min(1),
  targetText: z.string().min(1),
  context: z.string().optional(),
  difficulty: z.number().min(1).max(5),
  masteryLevel: z.number().min(0).max(5),
  createdAt: z.date()
});

export type Flashcard = z.infer<typeof FlashcardSchema>;

// Speech Analysis Types
export const SpeechAnalysisSchema = z.object({
  transcription: z.string(),
  confidence: z.number().min(0).max(1),
  pronunciation: z.number().min(0).max(100),
  fluency: z.number().min(0).max(100),
  pace: z.number().positive(), // words per minute
  pausesCount: z.number().min(0),
  hesitationsCount: z.number().min(0)
});

export type SpeechAnalysis = z.infer<typeof SpeechAnalysisSchema>;

// File Upload Types
export const FileUploadSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  filename: z.string().min(1),
  originalName: z.string().min(1),
  fileType: z.enum(['video', 'audio', 'text']),
  fileSize: z.number().positive(),
  storageUrl: z.string().url(),
  processingStatus: z.enum(['uploaded', 'processing', 'completed', 'failed']),
  metadata: z.record(z.unknown()),
  createdAt: z.date()
});

export type FileUpload = z.infer<typeof FileUploadSchema>;

// API Response Types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.date()
});

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
};

// Conversation Message Types
export const ConversationMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  speaker: z.enum(['user', 'ai', 'partner']),
  content: z.string().min(1),
  audioUrl: z.string().url().optional(),
  speechAnalysis: SpeechAnalysisSchema.optional(),
  timestamp: z.date()
});

export type ConversationMessage = z.infer<typeof ConversationMessageSchema>;

// Assessment Types
export const AssessmentResultSchema = z.object({
  sessionId: z.string().uuid(),
  overallScore: z.number().min(0).max(100),
  comfortScore: z.number().min(1).max(10),
  vocabularyUsed: z.array(z.string()),
  grammarPoints: z.array(z.string()),
  recommendations: z.array(z.string()),
  nextConversationSuggestions: z.array(z.string().uuid())
});

export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;
