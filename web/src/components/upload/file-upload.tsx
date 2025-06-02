'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, File, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { uploadService, UploadStatusResponse } from '@/lib/upload-service';

interface FileUploadProps {
  onUploadComplete?: (result: UploadStatusResponse) => void;
  onUploadError?: (error: string) => void;
  language?: string;
  cefrLevel?: string;
  className?: string;
}

interface UploadingFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  processingStatus?: UploadStatusResponse;
  error?: string;
}

export function FileUploadComponent({ 
  onUploadComplete, 
  onUploadError,
  language = 'en',
  cefrLevel = 'A1',
  className = ''
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      // Validate file
      const validation = uploadService.validateFile(file);
      if (!validation.valid) {
        onUploadError?.(validation.error || 'Invalid file');
        continue;
      }

      // Create uploading file entry
      const uploadingFile: UploadingFile = {
        file,
        id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        progress: 0,
        status: 'uploading'
      };

      setUploadingFiles(prev => [...prev, uploadingFile]);

      try {
        // Start upload
        const uploadResult = await uploadService.uploadFile(file, language, cefrLevel);
        
        if (!uploadResult.success || !uploadResult.fileId) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        // Update status to processing
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, status: 'processing', progress: 100 }
              : f
          )
        );

        // Start polling for processing status
        const finalStatus = await uploadService.pollUploadStatus(
          uploadResult.fileId,
          (status) => {
            setUploadingFiles(prev => 
              prev.map(f => 
                f.id === uploadingFile.id 
                  ? { 
                      ...f, 
                      progress: status.progress,
                      processingStatus: status,
                      status: status.processingStatus === 'completed' ? 'completed' : 'processing'
                    }
                  : f
              )
            );
          }
        );

        if (finalStatus) {
          if (finalStatus.processingStatus === 'completed') {
            onUploadComplete?.(finalStatus);
            
            // Remove from uploading files after a delay
            setTimeout(() => {
              setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
            }, 3000);
          } else if (finalStatus.processingStatus === 'failed') {
            setUploadingFiles(prev => 
              prev.map(f => 
                f.id === uploadingFile.id 
                  ? { ...f, status: 'failed', error: 'Processing failed' }
                  : f
              )
            );
          }
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, status: 'failed', error: errorMessage }
              : f
          )
        );
        onUploadError?.(errorMessage);
      }
    }
  };

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Drag & Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept=".mp4,.mov,.avi,.webm,.mp3,.wav,.m4a,.ogg,.txt,.pdf"
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center space-y-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Supports video (MP4, MOV, AVI, WebM), audio (MP3, WAV, M4A, OGG), and text (TXT, PDF) files
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Maximum file size: 100MB
            </p>
          </div>
        </div>
      </div>

      {/* Uploading Files List */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Uploading Files
          </h3>
          
          {uploadingFiles.map((uploadingFile) => (
            <div
              key={uploadingFile.id}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {uploadingFile.file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {uploadService.formatFileSize(uploadingFile.file.size)}
                </p>
                
                {/* Progress Bar */}
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      {uploadingFile.status === 'uploading' && 'Uploading...'}
                      {uploadingFile.status === 'processing' && 'Processing...'}
                      {uploadingFile.status === 'completed' && 'Completed!'}
                      {uploadingFile.status === 'failed' && 'Failed'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {uploadingFile.progress}%
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        uploadingFile.status === 'completed' 
                          ? 'bg-green-500' 
                          : uploadingFile.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      }`}
                      style={{ width: `${uploadingFile.progress}%` }}
                    />
                  </div>
                </div>

                {/* Status Message */}
                {uploadingFile.processingStatus?.message && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {uploadingFile.processingStatus.message}
                  </p>
                )}

                {/* Error Message */}
                {uploadingFile.error && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {uploadingFile.error}
                  </p>
                )}
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0">
                {uploadingFile.status === 'uploading' && (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                )}
                {uploadingFile.status === 'processing' && (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                )}
                {uploadingFile.status === 'completed' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {uploadingFile.status === 'failed' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>

              {/* Remove Button */}
              {(uploadingFile.status === 'failed' || uploadingFile.status === 'completed') && (
                <button
                  onClick={() => removeUploadingFile(uploadingFile.id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
