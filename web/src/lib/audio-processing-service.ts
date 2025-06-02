// Audio/Video processing service using FFmpeg for content extraction
import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

export interface AudioExtractionResult {
  success: boolean;
  audioBuffer?: Buffer;
  duration?: number;
  sampleRate?: number;
  error?: string;
}

export interface VideoMetadata {
  duration: number;
  resolution: {
    width: number;
    height: number;
  };
  hasAudio: boolean;
  codec: string;
}

class AudioProcessingService {
  private tempDir: string;

  constructor() {
    this.tempDir = tmpdir();
  }

  /**
   * Extract audio from video file and convert to format suitable for speech-to-text
   * @param inputBuffer Video file buffer
   * @param outputFormat Target audio format (default: wav for best compatibility with Whisper)
   * @returns AudioExtractionResult with extracted audio buffer
   */
  async extractAudioFromVideo(
    inputBuffer: Buffer,
    outputFormat: 'wav' | 'mp3' | 'flac' = 'wav'
  ): Promise<AudioExtractionResult> {
    const tempInputPath = join(this.tempDir, `input_${randomUUID()}.mp4`);
    const tempOutputPath = join(this.tempDir, `output_${randomUUID()}.${outputFormat}`);

    try {
      // Write input buffer to temporary file
      await fs.writeFile(tempInputPath, inputBuffer);

      // Extract audio using FFmpeg
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInputPath)
          .audioCodec(outputFormat === 'wav' ? 'pcm_s16le' : 'mp3')
          .audioChannels(1) // Mono for better speech recognition
          .audioFrequency(16000) // 16kHz sample rate for Whisper
          .format(outputFormat)
          .output(tempOutputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
          .run();
      });

      // Read extracted audio
      const audioBuffer = await fs.readFile(tempOutputPath);

      // Get audio metadata
      const metadata = await this.getAudioMetadata(tempOutputPath);

      return {
        success: true,
        audioBuffer,
        duration: metadata.duration,
        sampleRate: 16000,
      };

    } catch (error) {
      console.error('Audio extraction failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during audio extraction',
      };
    } finally {
      // Clean up temporary files
      await this.cleanupFile(tempInputPath);
      await this.cleanupFile(tempOutputPath);
    }
  }

  /**
   * Process audio file to optimize for speech-to-text
   * @param inputBuffer Audio file buffer
   * @param outputFormat Target format
   * @returns Processed audio buffer
   */
  async processAudioFile(
    inputBuffer: Buffer,
    outputFormat: 'wav' | 'mp3' | 'flac' = 'wav'
  ): Promise<AudioExtractionResult> {
    const tempInputPath = join(this.tempDir, `input_${randomUUID()}.audio`);
    const tempOutputPath = join(this.tempDir, `output_${randomUUID()}.${outputFormat}`);

    try {
      await fs.writeFile(tempInputPath, inputBuffer);

      // Process audio: normalize, convert to mono, optimize sample rate
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInputPath)
          .audioCodec(outputFormat === 'wav' ? 'pcm_s16le' : 'mp3')
          .audioChannels(1) // Mono
          .audioFrequency(16000) // Optimal for speech recognition
          .audioFilters(['loudnorm']) // Normalize audio levels
          .format(outputFormat)
          .output(tempOutputPath)
          .on('end', () => resolve())
          .on('error', (err) => reject(new Error(`FFmpeg error: ${err.message}`)))
          .run();
      });

      const audioBuffer = await fs.readFile(tempOutputPath);
      const metadata = await this.getAudioMetadata(tempOutputPath);

      return {
        success: true,
        audioBuffer,
        duration: metadata.duration,
        sampleRate: 16000,
      };

    } catch (error) {
      console.error('Audio processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during audio processing',
      };
    } finally {
      await this.cleanupFile(tempInputPath);
      await this.cleanupFile(tempOutputPath);
    }
  }

  /**
   * Get video metadata including duration, resolution, and audio presence
   * @param inputBuffer Video file buffer
   * @returns Video metadata
   */
  async getVideoMetadata(inputBuffer: Buffer): Promise<VideoMetadata> {
    const tempInputPath = join(this.tempDir, `metadata_${randomUUID()}.mp4`);

    try {
      await fs.writeFile(tempInputPath, inputBuffer);

      return new Promise<VideoMetadata>((resolve, reject) => {
        ffmpeg.ffprobe(tempInputPath, (err, metadata) => {
          if (err) {
            reject(new Error(`FFprobe error: ${err.message}`));
            return;
          }

          const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
          const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');

          resolve({
            duration: metadata.format.duration || 0,
            resolution: {
              width: videoStream?.width || 0,
              height: videoStream?.height || 0,
            },
            hasAudio: !!audioStream,
            codec: videoStream?.codec_name || 'unknown',
          });
        });
      });

    } catch (error) {
      throw new Error(`Failed to get video metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await this.cleanupFile(tempInputPath);
    }
  }

  /**
   * Get audio metadata including duration
   * @param filePath Path to audio file
   * @returns Audio metadata
   */
  private async getAudioMetadata(filePath: string): Promise<{ duration: number }> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(new Error(`FFprobe error: ${err.message}`));
          return;
        }

        resolve({
          duration: metadata.format.duration || 0,
        });
      });
    });
  }

  /**
   * Split audio into chunks for better processing with speech-to-text APIs
   * @param audioBuffer Audio file buffer
   * @param chunkDurationSeconds Duration of each chunk in seconds (default: 600 = 10 minutes)
   * @returns Array of audio chunks
   */
  async splitAudioIntoChunks(
    audioBuffer: Buffer,
    chunkDurationSeconds: number = 600
  ): Promise<Buffer[]> {
    const tempInputPath = join(this.tempDir, `input_${randomUUID()}.wav`);
    const chunks: Buffer[] = [];

    try {
      await fs.writeFile(tempInputPath, audioBuffer);

      // Get total duration
      const metadata = await this.getAudioMetadata(tempInputPath);
      const totalDuration = metadata.duration;
      const numberOfChunks = Math.ceil(totalDuration / chunkDurationSeconds);

      // Split into chunks
      for (let i = 0; i < numberOfChunks; i++) {
        const startTime = i * chunkDurationSeconds;
        const chunkPath = join(this.tempDir, `chunk_${i}_${randomUUID()}.wav`);

        await new Promise<void>((resolve, reject) => {
          ffmpeg(tempInputPath)
            .seekInput(startTime)
            .duration(chunkDurationSeconds)
            .audioCodec('pcm_s16le')
            .format('wav')
            .output(chunkPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(new Error(`FFmpeg chunk error: ${err.message}`)))
            .run();
        });

        const chunkBuffer = await fs.readFile(chunkPath);
        chunks.push(chunkBuffer);

        // Clean up chunk file
        await this.cleanupFile(chunkPath);
      }

      return chunks;

    } catch (error) {
      console.error('Audio splitting failed:', error);
      throw new Error(`Failed to split audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await this.cleanupFile(tempInputPath);
    }
  }

  /**
   * Clean up temporary files
   * @param filePath Path to file to delete
   */
  private async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore cleanup errors
      console.warn(`Failed to cleanup file ${filePath}:`, error);
    }
  }

  /**
   * Check if FFmpeg is available on the system
   * @returns Promise<boolean> indicating FFmpeg availability
   */
  async checkFFmpegAvailability(): Promise<boolean> {
    return new Promise((resolve) => {
      ffmpeg()
        .on('error', () => resolve(false))
        .on('end', () => resolve(true))
        .format('null')
        .output('/dev/null')
        .run();
    });
  }
}

// Export singleton instance
export const audioProcessingService = new AudioProcessingService();
export default AudioProcessingService;
