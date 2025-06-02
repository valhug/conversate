import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cloudStorageService } from '@/lib/cloud-storage-service';
import { audioProcessingService } from '@/lib/audio-processing-service';
import { speechToTextService } from '@/lib/speech-to-text-service';
import { contentAnalysisService } from '@/lib/content-analysis-service';
import type { FileRecord } from '@/types/upload';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/avi', 'video/webm'];
const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'];
const ALLOWED_TEXT_TYPES = ['text/plain', 'application/pdf'];

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const language = formData.get('language') as string;
    const cefrLevel = formData.get('cefrLevel') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 100MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const isValidType = [
      ...ALLOWED_VIDEO_TYPES,
      ...ALLOWED_AUDIO_TYPES,
      ...ALLOWED_TEXT_TYPES
    ].includes(file.type);

    if (!isValidType) {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    // Determine file category
    let fileCategory: 'video' | 'audio' | 'text';
    if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
      fileCategory = 'video';
    } else if (ALLOWED_AUDIO_TYPES.includes(file.type)) {
      fileCategory = 'audio';
    } else {
      fileCategory = 'text';
    }

    // Generate unique filename and file ID
    const timestamp = Date.now();
    const fileId = `file_${timestamp}`;
    const fileKey = `uploads/${session.user.id}/${fileId}_${file.name}`;

    // Convert file to buffer for processing
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);    // Upload file to cloud storage
    const uploadResult = await cloudStorageService.uploadFile(
      fileBuffer,
      fileKey,
      file.type
    );

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload file to cloud storage' },
        { status: 500 }
      );
    }

    // Create file record
    const fileRecord = {
      id: fileId,
      userId: session.user.id,
      fileName: file.name,
      originalName: file.name,
      fileType: fileCategory,
      fileSize: file.size,
      mimeType: file.type,
      storageUrl: uploadResult.fileUrl!,
      storageKey: uploadResult.fileKey!,
      language: language || 'en',
      cefrLevel: cefrLevel || 'A1',
      processingStatus: 'uploaded' as const,
      uploadedAt: new Date(),
    };    // Start processing in background
    processFileInBackground(fileRecord, fileBuffer).catch(error => {
      console.error('Background processing failed:', error);
    });

    return NextResponse.json({
      success: true,
      fileId: fileRecord.id,
      fileName: fileRecord.fileName,
      fileType: fileRecord.fileType,
      processingStatus: 'processing',
      message: 'File uploaded successfully. Processing will begin shortly.',
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Real background processing with cloud storage and speech-to-text
async function processFileInBackground(fileRecord: FileRecord, fileBuffer: Buffer) {
  try {
    console.log(`Processing file: ${fileRecord.fileName}`);
    
    let extractedContent = '';
    let speakerTurns: Array<{
      speaker: string;
      text: string;
      startTime: number;
      endTime: number;
    }> = [];

    if (fileRecord.fileType === 'text') {
      // For text files, extract text content directly
      extractedContent = fileBuffer.toString('utf-8').substring(0, 10000);
      
      // Create mock speaker turns for text content
      const sentences = extractedContent.split(/[.!?]+/).filter(s => s.trim().length > 10);
      speakerTurns = sentences.map((sentence, index) => ({
        speaker: 'Reader',
        text: sentence.trim(),
        startTime: index * 3,
        endTime: (index + 1) * 3,
      }));

    } else if (fileRecord.fileType === 'video') {
      // Extract audio from video
      console.log('Extracting audio from video...');
      const audioResult = await audioProcessingService.extractAudioFromVideo(fileBuffer);
      
      if (!audioResult.success || !audioResult.audioBuffer) {
        throw new Error(audioResult.error || 'Failed to extract audio from video');
      }

      // Transcribe the extracted audio
      console.log('Transcribing extracted audio...');
      const transcriptionResult = await speechToTextService.transcribeAudio(
        audioResult.audioBuffer,
        {
          language: fileRecord.language,
          includeTimestamps: true,
        }
      );

      if (!transcriptionResult.success) {
        throw new Error(transcriptionResult.error || 'Failed to transcribe audio');
      }

      extractedContent = transcriptionResult.transcription || '';

      // Convert transcription segments to speaker turns
      if (transcriptionResult.segments) {
        const speakerSegments = await speechToTextService.identifySpeakers(transcriptionResult.segments);
        speakerTurns = speechToTextService.extractConversationTurns(speakerSegments);
      }

    } else if (fileRecord.fileType === 'audio') {
      // Process audio file for optimal transcription
      console.log('Processing audio file...');
      const audioResult = await audioProcessingService.processAudioFile(fileBuffer);
      
      if (!audioResult.success || !audioResult.audioBuffer) {
        throw new Error(audioResult.error || 'Failed to process audio file');
      }

      // For large audio files, split into chunks
      const audioBuffer = audioResult.audioBuffer;
      const duration = audioResult.duration || 0;

      if (duration > 600) { // More than 10 minutes
        console.log('Splitting large audio file into chunks...');
        const chunks = await audioProcessingService.splitAudioIntoChunks(audioBuffer);
        const transcriptionResult = await speechToTextService.transcribeAudioChunks(
          chunks,
          { language: fileRecord.language }
        );

        if (!transcriptionResult.success) {
          throw new Error(transcriptionResult.error || 'Failed to transcribe audio chunks');
        }

        extractedContent = transcriptionResult.transcription || '';

        // Convert segments to speaker turns
        if (transcriptionResult.segments) {
          const speakerSegments = await speechToTextService.identifySpeakers(transcriptionResult.segments);
          speakerTurns = speechToTextService.extractConversationTurns(speakerSegments);
        }

      } else {
        // Transcribe single audio file
        console.log('Transcribing audio file...');
        const transcriptionResult = await speechToTextService.transcribeAudio(
          audioBuffer,
          {
            language: fileRecord.language,
            includeTimestamps: true,
          }
        );

        if (!transcriptionResult.success) {
          throw new Error(transcriptionResult.error || 'Failed to transcribe audio');
        }

        extractedContent = transcriptionResult.transcription || '';

        // Convert segments to speaker turns
        if (transcriptionResult.segments) {
          const speakerSegments = await speechToTextService.identifySpeakers(transcriptionResult.segments);
          speakerTurns = speechToTextService.extractConversationTurns(speakerSegments);
        }
      }
    }

    // Analyze content and generate learning materials
    console.log('Analyzing content for learning materials...');
    const analysisResult = await contentAnalysisService.analyzeContent(
      extractedContent,
      speakerTurns,
      fileRecord.language,
      fileRecord.cefrLevel
    );

    // Store processed content and conversations
    // In production, save to database using Prisma
    console.log(`File processing completed: ${fileRecord.fileName}`);
    console.log(`Generated ${analysisResult.conversations.length} conversation segments`);
    console.log(`Extracted ${analysisResult.vocabulary.length} vocabulary items`);
    console.log(`Suggested CEFR level: ${analysisResult.suggestedCefrLevel}`);
    console.log(`Identified topics: ${analysisResult.topics.join(', ')}`);

    // TODO: Save to database
    // await prisma.fileRecord.update({
    //   where: { id: fileRecord.id },
    //   data: {
    //     processingStatus: 'completed',
    //     extractedContent,
    //     conversations: {
    //       create: analysisResult.conversations
    //     },
    //     metadata: {
    //       vocabulary: analysisResult.vocabulary,
    //       grammarPatterns: analysisResult.grammarPatterns,
    //       topics: analysisResult.topics,
    //       suggestedCefrLevel: analysisResult.suggestedCefrLevel,
    //     }
    //   }
    // });

  } catch (error) {
    console.error('File processing error:', error);
    
    // TODO: Update status to failed in database
    // await prisma.fileRecord.update({
    //   where: { id: fileRecord.id },
    //   data: {
    //     processingStatus: 'failed',
    //     errorMessage: error instanceof Error ? error.message : 'Unknown processing error'
    //   }
    // });
  }
}


