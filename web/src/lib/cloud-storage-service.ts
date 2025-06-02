// Cloud storage service for file uploads using AWS S3
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  fileKey?: string;
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  fileBuffer?: Buffer;
  contentType?: string;
  error?: string;
}

class CloudStorageService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    // Initialize S3 client
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      },
    });
    
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'conversate-uploads';
  }
  /**
   * Upload a file to S3
   */
  async uploadFile(
    file: File,
    userId: string,
    fileType: 'video' | 'audio' | 'text'
  ): Promise<UploadResult>;
  
  /**
   * Upload a buffer to S3 with specified key and content type
   */
  async uploadFile(
    buffer: Buffer,
    fileKey: string,
    contentType: string
  ): Promise<UploadResult>;

  async uploadFile(
    fileOrBuffer: File | Buffer,
    userIdOrKey: string,
    fileTypeOrContentType: 'video' | 'audio' | 'text' | string
  ): Promise<UploadResult> {
    try {
      let fileKey: string;
      let buffer: Buffer;
      let contentType: string;
      let originalName: string;
      let userId: string;
      let fileType: string;

      if (fileOrBuffer instanceof File) {
        // File upload case
        const file = fileOrBuffer;
        userId = userIdOrKey;
        fileType = fileTypeOrContentType as 'video' | 'audio' | 'text';
        
        const timestamp = Date.now();
        fileKey = `uploads/${userId}/${fileType}/${timestamp}-${file.name}`;
        buffer = Buffer.from(await file.arrayBuffer());
        contentType = file.type;
        originalName = file.name;
      } else {
        // Buffer upload case
        buffer = fileOrBuffer;
        fileKey = userIdOrKey;
        contentType = fileTypeOrContentType as string;
        
        // Extract metadata from fileKey
        const keyParts = fileKey.split('/');
        userId = keyParts[1] || 'unknown';
        fileType = keyParts[2] || 'unknown';
        originalName = keyParts[keyParts.length - 1] || 'unknown';
      }

      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: buffer,
        ContentType: contentType,
        Metadata: {
          userId,
          originalName,
          fileType,
          uploadedAt: new Date().toISOString(),
        },
      });

      await this.s3Client.send(uploadCommand);

      const fileUrl = `https://${this.bucketName}.s3.amazonaws.com/${fileKey}`;

      return {
        success: true,
        fileUrl,
        fileKey,
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Download a file from S3
   */
  async downloadFile(fileKey: string): Promise<DownloadResult> {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const response = await this.s3Client.send(getCommand);
      
      if (!response.Body) {
        return {
          success: false,
          error: 'File not found',
        };
      }

      const fileBuffer = Buffer.from(await response.Body.transformToByteArray());

      return {
        success: true,
        fileBuffer,
        contentType: response.ContentType,
      };
    } catch (error) {
      console.error('S3 download error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Download failed',
      };
    }
  }

  /**
   * Generate a presigned URL for direct file access
   */
  async getPresignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const getCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      const presignedUrl = await getSignedUrl(this.s3Client, getCommand, {
        expiresIn,
      });

      return presignedUrl;
    } catch (error) {
      console.error('Presigned URL generation error:', error);
      return null;
    }
  }

  /**
   * Delete a file from S3
   */
  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      await this.s3Client.send(deleteCommand);
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      return false;
    }
  }

  /**
   * Mock implementation for development (when AWS credentials are not available)
   */
  private mockUpload(file: File, userId: string, fileType: string): UploadResult {
    console.log(`Mock upload: ${file.name} for user ${userId} (${fileType})`);
    const mockFileKey = `mock-uploads/${userId}/${fileType}/${Date.now()}-${file.name}`;
    const mockFileUrl = `https://mock-bucket.s3.amazonaws.com/${mockFileKey}`;
    
    return {
      success: true,
      fileUrl: mockFileUrl,
      fileKey: mockFileKey,
    };
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_S3_BUCKET_NAME
    );
  }

  /**
   * Upload with fallback to mock for development
   */
  async uploadFileWithFallback(
    file: File,
    userId: string,
    fileType: 'video' | 'audio' | 'text'
  ): Promise<UploadResult> {
    if (this.isConfigured()) {
      return this.uploadFile(file, userId, fileType);
    } else {
      console.warn('AWS S3 not configured, using mock upload');
      return this.mockUpload(file, userId, fileType);
    }
  }
}

// Export singleton instance
export const cloudStorageService = new CloudStorageService();
