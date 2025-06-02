'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Video, 
  Music, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye,
  Trash2,
  Play
} from 'lucide-react';

interface ProcessedFile {
  id: string;
  fileName: string;
  fileType: 'video' | 'audio' | 'text';
  fileSize: number;
  language: string;
  cefrLevel: string;
  processingStatus: 'uploaded' | 'processing' | 'completed' | 'failed';
  uploadedAt: Date;
  conversations?: Array<{
    id: string;
    title: string;
    content: string;
    difficulty: number;
    vocabulary: string[];
  }>;
  progress?: number;
}

interface FileManagerProps {
  files: ProcessedFile[];
  onViewFile?: (file: ProcessedFile) => void;
  onDeleteFile?: (fileId: string) => void;
  onStartConversation?: (file: ProcessedFile, conversationId: string) => void;
  className?: string;
}

export function FileManagerComponent({
  files,
  onViewFile,
  onDeleteFile,
  onStartConversation,
  className = ''
}: FileManagerProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const toggleExpanded = (fileId: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'video':
        return <Video className="w-5 h-5 text-purple-500" />;
      case 'audio':
        return <Music className="w-5 h-5 text-blue-500" />;
      case 'text':
        return <FileText className="w-5 h-5 text-green-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'Uploaded';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Ready';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (files.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No files uploaded yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Upload your first file to start creating conversation practice sessions
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Uploaded Files ({files.length})
        </h3>
      </div>

      <div className="space-y-3">
        {files.map((file) => {
          const isExpanded = expandedFiles.has(file.id);
          
          return (
            <div
              key={file.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              {/* File Header */}
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.fileType)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {file.fileName}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(file.processingStatus)}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getStatusText(file.processingStatus)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatFileSize(file.fileSize)}</span>
                      <span>{file.language.toUpperCase()}</span>
                      <span>{file.cefrLevel}</span>
                      <span>{formatDate(file.uploadedAt)}</span>
                    </div>

                    {/* Progress Bar for Processing Files */}
                    {file.processingStatus === 'processing' && file.progress !== undefined && (
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div
                          className="h-1.5 bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {file.processingStatus === 'completed' && (
                      <button
                        onClick={() => onViewFile?.(file)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    
                    {file.processingStatus === 'completed' && file.conversations && file.conversations.length > 0 && (
                      <button
                        onClick={() => toggleExpanded(file.id)}
                        className="p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                        title="View conversations"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => onDeleteFile?.(file.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      title="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Conversations */}
              {isExpanded && file.conversations && file.conversations.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-750">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Generated Conversations ({file.conversations.length})
                  </h5>
                  
                  <div className="space-y-3">
                    {file.conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {conversation.title}
                            </h6>
                            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                              {conversation.content}
                            </p>
                            
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                Difficulty: {conversation.difficulty}/5
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {conversation.vocabulary.length} vocabulary words
                              </span>
                            </div>

                            {/* Vocabulary Preview */}
                            {conversation.vocabulary.length > 0 && (
                              <div className="mt-2">
                                <div className="flex flex-wrap gap-1">
                                  {conversation.vocabulary.slice(0, 5).map((word, index) => (
                                    <span
                                      key={index}
                                      className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                                    >
                                      {word}
                                    </span>
                                  ))}
                                  {conversation.vocabulary.length > 5 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                      +{conversation.vocabulary.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <button
                            onClick={() => onStartConversation?.(file, conversation.id)}
                            className="ml-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                          >
                            Start Practice
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
