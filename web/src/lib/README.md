# Video/Audio Processing Pipeline

This directory contains the complete file processing pipeline for the Conversate language learning application.

## Services Overview

### 1. Cloud Storage Service (`cloud-storage-service.ts`)
**Purpose**: Handles file uploads to AWS S3 with fallback for development

**Features**:
- File upload with presigned URLs
- File download and deletion
- Mock fallback when AWS credentials unavailable
- Comprehensive error handling

**Usage**:
```typescript
import { cloudStorageService } from '@/lib/cloud-storage-service';

const result = await cloudStorageService.uploadFile(buffer, 'path/file.mp4', 'video/mp4');
```

### 2. Audio Processing Service (`audio-processing-service.ts`)
**Purpose**: FFmpeg-based audio/video processing for speech recognition preparation

**Features**:
- Extract audio from video files (MP4, MOV, AVI, WebM)
- Optimize audio for speech-to-text (16kHz, mono, normalized)
- Split large audio files into chunks (10-minute segments)
- Get video/audio metadata (duration, resolution, codec)
- Automatic cleanup of temporary files

**Usage**:
```typescript
import { audioProcessingService } from '@/lib/audio-processing-service';

// Extract audio from video
const result = await audioProcessingService.extractAudioFromVideo(videoBuffer);

// Process audio file
const optimized = await audioProcessingService.processAudioFile(audioBuffer);
```

### 3. Speech-to-Text Service (`speech-to-text-service.ts`)
**Purpose**: OpenAI Whisper API integration for transcription

**Features**:
- Transcribe audio with timestamps and segments
- Handle large files with chunking
- Basic speaker identification
- Conversation turn extraction
- Mock transcription for development

**Usage**:
```typescript
import { speechToTextService } from '@/lib/speech-to-text-service';

const result = await speechToTextService.transcribeAudio(audioBuffer, {
  language: 'en',
  includeTimestamps: true
});
```

### 4. Content Analysis Service (`content-analysis-service.ts`)
**Purpose**: Generate learning materials from transcribed content

**Features**:
- Create conversation segments from speaker turns
- Extract vocabulary with difficulty assessment
- Identify grammar patterns
- Suggest appropriate CEFR level
- Extract topics and themes

**Usage**:
```typescript
import { contentAnalysisService } from '@/lib/content-analysis-service';

const analysis = await contentAnalysisService.analyzeContent(
  transcription,
  speakerTurns,
  'en',
  'B1'
);
```

## Environment Variables Required

```bash
# OpenAI for speech-to-text
OPENAI_API_KEY="your-openai-api-key"

# AWS for cloud storage
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

## Processing Pipeline Flow

1. **File Upload**: User uploads video/audio file via frontend
2. **Cloud Storage**: File uploaded to AWS S3, URL stored in database
3. **Audio Extraction**: If video, extract audio using FFmpeg
4. **Audio Optimization**: Convert to optimal format for speech recognition
5. **Transcription**: Use OpenAI Whisper to transcribe audio
6. **Speaker Analysis**: Identify speakers and conversation turns
7. **Content Analysis**: Generate vocabulary, grammar patterns, topics
8. **Database Storage**: Save conversations and analysis results

## Development vs Production

### Development Mode
- Mock cloud storage (files stored in memory)
- Mock transcription when no OpenAI API key
- Local FFmpeg processing

### Production Mode
- Real AWS S3 cloud storage
- OpenAI Whisper API transcription
- Background processing with job queues

## File Format Support

### Video
- MP4, MOV, AVI, WebM
- Automatic audio extraction

### Audio
- MP3, WAV, M4A, OGG, FLAC
- Direct processing and optimization

### Text
- TXT, PDF
- Direct content extraction

## Error Handling

All services include comprehensive error handling:
- Network failures gracefully handled
- File processing errors logged and reported
- Automatic cleanup of temporary files
- Fallback to mock services when APIs unavailable

## Testing

Services can be tested independently:
- Upload test files through the frontend
- Check processing logs in browser console
- Verify generated conversations in database
- Test with various file formats and sizes

## Performance Considerations

- Large files automatically chunked for processing
- Temporary files cleaned up automatically
- Memory usage optimized for streaming
- Background processing prevents UI blocking
