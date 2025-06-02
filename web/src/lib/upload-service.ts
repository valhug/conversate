// Service for handling file uploads and status checking

export interface UploadResponse {
  success: boolean;
  fileId?: string;
  fileName?: string;
  fileType?: 'text' | 'video' | 'audio';
  processingStatus?: string;
  message?: string;
  error?: string;
}

export interface UploadStatusResponse {
  fileId: string;
  processingStatus: 'uploaded' | 'processing' | 'completed' | 'failed';
  progress: number;
  conversations?: Array<{
    id: string;
    title: string;
    content: string;
    difficulty: number;
    vocabulary: string[];
  }>;
  message: string;
}

export class UploadService {
  private static instance: UploadService;
  
  public static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  /**
   * Upload a file with language and CEFR level metadata
   */
  async uploadFile(
    file: File, 
    language: string = 'en', 
    cefrLevel: string = 'A1'
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', language);
      formData.append('cefrLevel', cefrLevel);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Check the processing status of an uploaded file
   */
  async getUploadStatus(fileId: string): Promise<UploadStatusResponse | null> {
    try {
      const response = await fetch(`/api/upload/status?fileId=${encodeURIComponent(fileId)}`);
      
      if (!response.ok) {
        throw new Error('Failed to get upload status');
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      return null;
    }
  }

  /**
   * Poll upload status until completion or failure
   */
  async pollUploadStatus(
    fileId: string, 
    onUpdate: (status: UploadStatusResponse) => void,
    maxAttempts: number = 30,
    intervalMs: number = 2000
  ): Promise<UploadStatusResponse | null> {
    let attempts = 0;
    
    const poll = async (): Promise<UploadStatusResponse | null> => {
      attempts++;
      
      const status = await this.getUploadStatus(fileId);
      
      if (!status) {
        return null;
      }
      
      onUpdate(status);
      
      // If processing is complete or failed, stop polling
      if (status.processingStatus === 'completed' || status.processingStatus === 'failed') {
        return status;
      }
      
      // If we've exceeded max attempts, stop polling
      if (attempts >= maxAttempts) {
        return status;
      }
      
      // Continue polling
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      return poll();
    };
    
    return poll();
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    const ALLOWED_TYPES = [
      // Video types
      'video/mp4', 'video/mov', 'video/avi', 'video/webm',
      // Audio types
      'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg',
      // Text types
      'text/plain', 'application/pdf'
    ];

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size exceeds 100MB limit'
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `Unsupported file type: ${file.type}. Supported types: MP4, MOV, AVI, WebM, MP3, WAV, M4A, OGG, TXT, PDF`
      };
    }

    return { valid: true };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file type category for display
   */
  getFileTypeCategory(mimeType: string): 'video' | 'audio' | 'text' | 'unknown' {
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('text/') || mimeType === 'application/pdf') return 'text';
    return 'unknown';
  }
}

export const uploadService = UploadService.getInstance();
