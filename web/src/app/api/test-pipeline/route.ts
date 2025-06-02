// API route for testing the processing pipeline
// Access via: http://localhost:3000/api/test-pipeline

import { NextResponse } from 'next/server';
import { audioProcessingService } from '@/lib/audio-processing-service';
import { speechToTextService } from '@/lib/speech-to-text-service';
import { contentAnalysisService } from '@/lib/content-analysis-service';
import { cloudStorageService } from '@/lib/cloud-storage-service';

interface TestResult {
  name: string;
  status: 'success' | 'error';
  details?: Record<string, unknown>;
  error?: string;
}

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as TestResult[]
  };

  // Test 1: Service Availability
  try {
    const ffmpegAvailable = await audioProcessingService.checkFFmpegAvailability();
    const openaiAvailable = speechToTextService.isApiAvailable();
    const awsConfigured = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

    results.tests.push({
      name: 'Service Availability',
      status: 'success',
      details: {
        ffmpeg: ffmpegAvailable,
        openai: openaiAvailable,
        aws: awsConfigured
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Service Availability',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 2: Environment Configuration
  try {
    const config = {
      nextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      openaiKey: !!process.env.OPENAI_API_KEY,
      awsCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
      nodeEnv: process.env.NODE_ENV || 'not set'
    };

    results.tests.push({
      name: 'Environment Configuration',
      status: 'success',
      details: config
    });
  } catch (error) {
    results.tests.push({
      name: 'Environment Configuration',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 3: Content Analysis
  try {
    const mockTranscription = "Hello, how are you today? I am learning English. It's a beautiful day outside. What do you like to do for fun?";
    const mockSpeakerTurns = [
      { speaker: 'Speaker 1', text: 'Hello, how are you today?', startTime: 0, endTime: 2 },
      { speaker: 'Speaker 2', text: 'I am learning English.', startTime: 3, endTime: 5 },
      { speaker: 'Speaker 1', text: "It's a beautiful day outside.", startTime: 6, endTime: 8 },
      { speaker: 'Speaker 2', text: 'What do you like to do for fun?', startTime: 9, endTime: 11 }
    ];

    const analysis = await contentAnalysisService.analyzeContent(
      mockTranscription,
      mockSpeakerTurns,
      'en',
      'A2'
    );

    results.tests.push({
      name: 'Content Analysis',
      status: 'success',
      details: {
        conversations: analysis.conversations.length,
        vocabulary: analysis.vocabulary.length,
        suggestedLevel: analysis.suggestedCefrLevel,
        topics: analysis.topics,
        grammarPatterns: analysis.grammarPatterns.length
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Content Analysis',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 4: Speech-to-Text
  try {
    const mockAudioBuffer = Buffer.from('mock audio data');
    const transcription = await speechToTextService.transcribeAudio(mockAudioBuffer, {
      language: 'en',
      includeTimestamps: true
    });

    results.tests.push({
      name: 'Speech-to-Text',
      status: 'success',
      details: {
        transcriptionLength: transcription.transcription?.length || 0,
        segments: transcription.segments?.length || 0,
        language: transcription.language || 'unknown'
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Speech-to-Text',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 5: Format Support
  try {
    const supportedFormats = [
      'audio/wav',
      'audio/mp3', 
      'audio/mp4',
      'video/mp4',
      'video/webm'
    ];

    const formatSupport: Record<string, boolean> = {};
    supportedFormats.forEach(format => {
      formatSupport[format] = speechToTextService.isSupportedAudioFormat(format);
    });

    results.tests.push({
      name: 'Format Support',
      status: 'success',
      details: formatSupport
    });
  } catch (error) {
    results.tests.push({
      name: 'Format Support',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 6: Cloud Storage
  try {
    const mockFile = Buffer.from('mock file content');
    const uploadResult = await cloudStorageService.uploadFile(mockFile, 'test-file.txt', 'text/plain');
    
    results.tests.push({
      name: 'Cloud Storage',
      status: uploadResult.success ? 'success' : 'error',
      details: uploadResult.success ? {
        fileKey: uploadResult.fileKey,
        fileUrl: uploadResult.fileUrl
      } : {
        error: uploadResult.error
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Cloud Storage',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }  // Test 7: Audio Processing
  try {
    const ffmpegAvailable = await audioProcessingService.checkFFmpegAvailability();
    
    results.tests.push({
      name: 'Audio Processing',
      status: 'success',
      details: {
        ffmpegAvailable,
        supportedFormats: ['mp4', 'mp3', 'wav', 'flac', 'webm'],
        processingCapabilities: ['audio extraction', 'format conversion', 'optimization']
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Audio Processing',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Summary
  const successful = results.tests.filter(t => t.status === 'success').length;
  const total = results.tests.length;
  const summary = {
    successful,
    total,
    successRate: `${Math.round((successful / total) * 100)}%`,
    allPassed: successful === total
  };

  return NextResponse.json({
    ...results,
    summary
  }, { status: 200 });
}
