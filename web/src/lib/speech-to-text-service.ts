// Speech-to-text service using OpenAI Whisper API
import OpenAI from 'openai';

export interface TranscriptionSegment {
  id: string;
  text: string;
  start: number;
  end: number;
  speaker?: string;
  confidence?: number;
}

export interface TranscriptionResult {
  success: boolean;
  transcription?: string;
  segments?: TranscriptionSegment[];
  language?: string;
  duration?: number;
  error?: string;
}

export interface SpeakerSegment {
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
}

class SpeechToTextService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OpenAI API key not found. Speech-to-text service will use mock responses.');
    }

    this.openai = new OpenAI({
      apiKey: apiKey || 'mock-key',
    });
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   * @param audioBuffer Audio file buffer
   * @param options Transcription options
   * @returns TranscriptionResult with text and segments
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    options: {
      language?: string;
      prompt?: string;
      temperature?: number;
      includeTimestamps?: boolean;
    } = {}
  ): Promise<TranscriptionResult> {
    try {
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        return this.getMockTranscription(audioBuffer, options);
      }

      // Create a File object from the buffer
      const audioFile = new File([audioBuffer], 'audio.wav', {
        type: 'audio/wav',
      });

      // Transcribe using Whisper
      const response = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: options.language,
        prompt: options.prompt,
        temperature: options.temperature || 0,
        response_format: options.includeTimestamps ? 'verbose_json' : 'json',
        timestamp_granularities: options.includeTimestamps ? ['segment'] : undefined,
      });

      // Process response based on format
      if (typeof response === 'string') {
        return {
          success: true,
          transcription: response,
          language: options.language,
        };
      }      // Handle verbose JSON response with segments
      const segments: TranscriptionSegment[] = [];
      
      // Define interface for OpenAI response segment
      interface OpenAISegment {
        text?: string;
        start?: number;
        end?: number;
        avg_logprob?: number;
      }
      
      // Check if response has segments (verbose JSON format)
      if (response && typeof response === 'object' && 'segments' in response) {
        const responseWithSegments = response as { segments: OpenAISegment[] };
        if (responseWithSegments.segments && Array.isArray(responseWithSegments.segments)) {
          responseWithSegments.segments.forEach((segment: OpenAISegment, index: number) => {
            segments.push({
              id: `segment_${index}`,
              text: segment.text || '',
              start: segment.start || 0,
              end: segment.end || 0,
              confidence: segment.avg_logprob ? Math.exp(segment.avg_logprob) : undefined,
            });
          });
        }
      }

      return {
        success: true,
        transcription: response.text,
        segments,
        language: options.language, // Use the language from options since OpenAI doesn't always return it
        duration: segments.length > 0 ? Math.max(...segments.map(s => s.end)) : undefined,
      };

    } catch (error) {
      console.error('Transcription failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown transcription error',
      };
    }
  }

  /**
   * Transcribe multiple audio chunks and combine results
   * @param audioChunks Array of audio buffers
   * @param options Transcription options
   * @returns Combined transcription result
   */
  async transcribeAudioChunks(
    audioChunks: Buffer[],
    options: {
      language?: string;
      prompt?: string;
      temperature?: number;
    } = {}
  ): Promise<TranscriptionResult> {
    try {      const transcriptionPromises = audioChunks.map((chunk) =>
        this.transcribeAudio(chunk, {
          ...options,
          includeTimestamps: true,
        })
      );

      const results = await Promise.all(transcriptionPromises);

      // Check if any transcription failed
      const failedResults = results.filter(result => !result.success);
      if (failedResults.length > 0) {
        return {
          success: false,
          error: `Failed to transcribe ${failedResults.length} chunks`,
        };
      }

      // Combine transcriptions
      let combinedText = '';
      const combinedSegments: TranscriptionSegment[] = [];
      let totalDuration = 0;

      results.forEach((result, chunkIndex) => {
        if (result.transcription) {
          combinedText += (combinedText ? ' ' : '') + result.transcription;
        }

        if (result.segments) {
          // Adjust timestamps for chunk offset
          const chunkOffset = chunkIndex * 600; // Assuming 10-minute chunks
          result.segments.forEach(segment => {
            combinedSegments.push({
              ...segment,
              id: `chunk_${chunkIndex}_${segment.id}`,
              start: segment.start + chunkOffset,
              end: segment.end + chunkOffset,
            });
          });
        }

        if (result.duration) {
          totalDuration = Math.max(totalDuration, result.duration + (chunkIndex * 600));
        }
      });

      return {
        success: true,
        transcription: combinedText,
        segments: combinedSegments,
        language: results[0]?.language,
        duration: totalDuration,
      };

    } catch (error) {
      console.error('Chunk transcription failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown chunk transcription error',
      };
    }
  }

  /**
   * Identify speakers in transcription segments (simplified approach)
   * This is a basic implementation - for better results, use specialized diarization services
   * @param segments Transcription segments
   * @returns Segments with speaker identification
   */
  async identifySpeakers(segments: TranscriptionSegment[]): Promise<SpeakerSegment[]> {
    // Simple speaker identification based on silence gaps and voice patterns
    const speakerSegments: SpeakerSegment[] = [];
    let currentSpeaker = 'Speaker 1';
    let speakerCount = 1;

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const nextSegment = segments[i + 1];

      // Check for speaker change indicators
      if (nextSegment) {
        const silenceGap = nextSegment.start - segment.end;
        
        // If there's a significant gap (>2 seconds), assume speaker change
        if (silenceGap > 2.0) {
          speakerCount++;
          currentSpeaker = `Speaker ${speakerCount}`;
        }
      }

      speakerSegments.push({
        speaker: currentSpeaker,
        text: segment.text,
        startTime: segment.start,
        endTime: segment.end,
      });
    }

    return speakerSegments;
  }

  /**
   * Extract conversation turns from speaker segments
   * @param speakerSegments Segments with speaker identification
   * @returns Structured conversation turns
   */
  extractConversationTurns(speakerSegments: SpeakerSegment[]): {
    speaker: string;
    text: string;
    startTime: number;
    endTime: number;
  }[] {
    const conversationTurns: {
      speaker: string;
      text: string;
      startTime: number;
      endTime: number;
    }[] = [];

    let currentTurn: typeof conversationTurns[0] | null = null;

    for (const segment of speakerSegments) {
      if (!currentTurn || currentTurn.speaker !== segment.speaker) {
        // Start new turn
        if (currentTurn) {
          conversationTurns.push(currentTurn);
        }
        
        currentTurn = {
          speaker: segment.speaker,
          text: segment.text,
          startTime: segment.startTime,
          endTime: segment.endTime,
        };
      } else {
        // Continue current turn
        currentTurn.text += ' ' + segment.text;
        currentTurn.endTime = segment.endTime;
      }
    }

    // Add the last turn
    if (currentTurn) {
      conversationTurns.push(currentTurn);
    }

    return conversationTurns;
  }

  /**
   * Mock transcription for development when OpenAI API key is not available
   * @param audioBuffer Audio buffer (not used in mock)
   * @param options Transcription options
   * @returns Mock transcription result
   */
  private getMockTranscription(
    audioBuffer: Buffer,
    options: {
      language?: string;
      includeTimestamps?: boolean;
    }
  ): TranscriptionResult {
    const mockText = "Hello, welcome to our language learning conversation. This is a mock transcription that would normally be generated by OpenAI's Whisper API. In a real implementation, this would contain the actual spoken content from your uploaded audio or video file. The transcription would include proper punctuation, speaker identification, and timestamp information to help with language learning analysis.";

    const segments: TranscriptionSegment[] = options.includeTimestamps ? [
      {
        id: 'segment_0',
        text: 'Hello, welcome to our language learning conversation.',
        start: 0,
        end: 3.5,
        confidence: 0.95,
      },
      {
        id: 'segment_1',
        text: 'This is a mock transcription that would normally be generated by OpenAI\'s Whisper API.',
        start: 3.5,
        end: 8.2,
        confidence: 0.92,
      },
      {
        id: 'segment_2',
        text: 'In a real implementation, this would contain the actual spoken content from your uploaded audio or video file.',
        start: 8.2,
        end: 14.1,
        confidence: 0.94,
      },
      {
        id: 'segment_3',
        text: 'The transcription would include proper punctuation, speaker identification, and timestamp information to help with language learning analysis.',
        start: 14.1,
        end: 22.3,
        confidence: 0.93,
      },
    ] : [];

    return {
      success: true,
      transcription: mockText,
      segments,
      language: options.language || 'en',
      duration: 22.3,
    };
  }

  /**
   * Check if OpenAI API is available
   * @returns boolean indicating API availability
   */
  isApiAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  /**
   * Validate audio format for Whisper API
   * @param mimeType Audio file mime type
   * @returns boolean indicating if format is supported
   */
  isSupportedAudioFormat(mimeType: string): boolean {
    const supportedFormats = [
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/mp4',
      'audio/m4a',
      'audio/flac',
      'audio/ogg',
      'audio/webm',
    ];

    return supportedFormats.includes(mimeType);
  }
}

// Export singleton instance
export const speechToTextService = new SpeechToTextService();
export default SpeechToTextService;
