// Type definitions for file upload functionality

export interface FileRecord {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileType: 'text' | 'video' | 'audio';
  fileSize: number;
  mimeType: string;
  base64Data: string;
  language: string;
  cefrLevel: string;
  processingStatus: 'uploaded' | 'processing' | 'completed' | 'failed';
  uploadedAt: Date;
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
}

export interface ProcessedFile extends FileRecord {
  processingStatus: 'completed';
  extractedContent: string;
  conversations: ConversationSegment[];
  processedAt: Date;
}
