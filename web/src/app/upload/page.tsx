'use client';

import React, { useState, useEffect } from 'react';
import { Upload as UploadIcon, FileText, Settings, History } from 'lucide-react';
import { FileUploadComponent } from '@/components/upload/file-upload';
import { UploadConfigComponent } from '@/components/upload/upload-config';
import { FileManagerComponent } from '@/components/upload/file-manager';
import { UploadStatusResponse } from '@/lib/upload-service';

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

export default function UploadPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'files'>('upload');
  const [language, setLanguage] = useState('en');
  const [cefrLevel, setCefrLevel] = useState('A1');
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Load saved files from localStorage on component mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('conversate_uploaded_files');
    if (savedFiles) {      try {
        const parsed = JSON.parse(savedFiles);
        setProcessedFiles(parsed.map((file: ProcessedFile) => ({
          ...file,
          uploadedAt: new Date(file.uploadedAt)
        })));
      } catch (error) {
        console.error('Error loading saved files:', error);
      }
    }
  }, []);

  // Save files to localStorage whenever processedFiles changes
  useEffect(() => {
    localStorage.setItem('conversate_uploaded_files', JSON.stringify(processedFiles));
  }, [processedFiles]);

  const handleUploadComplete = (result: UploadStatusResponse) => {
    setUploadSuccess(`File processed successfully! Found ${result.conversations?.length || 0} conversation segments.`);
    setUploadError(null);
    
    // Add to processed files
    const newFile: ProcessedFile = {
      id: result.fileId,
      fileName: result.fileId, // In a real app, this would come from the upload response
      fileType: 'video', // This would also come from the upload response
      fileSize: 0, // This would come from the upload response
      language,
      cefrLevel,
      processingStatus: result.processingStatus,
      uploadedAt: new Date(),
      conversations: result.conversations,
      progress: result.progress
    };

    setProcessedFiles(prev => [newFile, ...prev]);
    
    // Switch to files tab to show the new file
    setActiveTab('files');
    
    // Clear success message after 5 seconds
    setTimeout(() => setUploadSuccess(null), 5000);
  };

  const handleUploadError = (error: string) => {
    setUploadError(error);
    setUploadSuccess(null);
    
    // Clear error message after 10 seconds
    setTimeout(() => setUploadError(null), 10000);
  };

  const handleDeleteFile = (fileId: string) => {
    setProcessedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleViewFile = (file: ProcessedFile) => {
    // In a real app, this would open a detailed view
    console.log('View file:', file);
  };

  const handleStartConversation = (file: ProcessedFile, conversationId: string) => {
    // In a real app, this would navigate to the conversation page
    console.log('Start conversation:', file, conversationId);
    // Example: router.push(`/conversation?fileId=${file.id}&segmentId=${conversationId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Upload & Practice
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Upload video, audio, or text files to create personalized conversation practice sessions
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <UploadIcon className="w-4 h-4" />
                  <span>Upload Files</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('files')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'files'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <History className="w-4 h-4" />
                  <span>My Files ({processedFiles.length})</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Upload Configuration */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Upload Settings
                      </h3>
                    </div>
                    
                    <UploadConfigComponent
                      language={language}
                      cefrLevel={cefrLevel}
                      onLanguageChange={setLanguage}
                      onCefrLevelChange={setCefrLevel}
                    />
                  </div>
                </div>

                {/* Upload Area */}
                <div className="lg:col-span-2">
                  {/* Success/Error Messages */}
                  {uploadSuccess && (
                    <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        ✅ {uploadSuccess}
                      </p>
                    </div>
                  )}
                  
                  {uploadError && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-red-800 dark:text-red-200 text-sm">
                        ❌ {uploadError}
                      </p>
                    </div>
                  )}

                  <FileUploadComponent
                    language={language}
                    cefrLevel={cefrLevel}
                    onUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                  />
                </div>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <FileManagerComponent
                files={processedFiles}
                onViewFile={handleViewFile}
                onDeleteFile={handleDeleteFile}
                onStartConversation={handleStartConversation}
              />
            )}
          </div>
        </div>

        {/* Quick Stats */}
        {processedFiles.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {processedFiles.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Files Uploaded
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <UploadIcon className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {processedFiles.filter(f => f.processingStatus === 'completed').length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ready for Practice
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <History className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {processedFiles.reduce((total, file) => total + (file.conversations?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Conversations Generated
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
