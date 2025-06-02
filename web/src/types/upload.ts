// Type definitions for file upload functionality

export interface FileRecord {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileType: 'text' | 'video' | 'audio';
  fileSize: number;
  mimeType: string;
  base64Data?: string; // Optional for backward compatibility
  storageUrl?: string; // Cloud storage URL
  storageKey?: string; // Cloud storage key
  language: string;
  cefrLevel: string;
  processingStatus: 'uploaded' | 'processing' | 'completed' | 'failed';
  uploadedAt: Date;
  errorMessage?: string; // For failed processing
}

export interface ConversationSegment {
  id: string;
  title: string;
  content: string;
  language: string;
  cefrLevel: string;
  difficulty: number;
  vocabulary: string[];
  createdAt: Date;
  metadata?: {
    startTime?: number;
    endTime?: number;
    speakers?: string[];
    turnCount?: number;
  };
}

export interface ProcessedFile extends FileRecord {
  processingStatus: 'completed';
  extractedContent: string;
  conversations: ConversationSegment[];
  processedAt: Date;
  analysisMetadata?: {
    vocabulary: Array<{
      word: string;
      definition?: string;
      difficulty: number;
      frequency: number;
      context: string;
    }>;
    grammarPatterns: Array<{
      pattern: string;
      description: string;
      examples: string[];
      difficulty: number;
    }>;
    topics: string[];
    suggestedCefrLevel: string;
    overallDifficulty: number;
  };
}
