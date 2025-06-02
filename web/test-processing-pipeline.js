// Test script for video/audio processing pipeline
// Run with: node --loader ts-node/esm test-processing-pipeline.js
// Or: npm run test:pipeline

import { audioProcessingService } from './src/lib/audio-processing-service.ts';
import { speechToTextService } from './src/lib/speech-to-text-service.ts';
import { contentAnalysisService } from './src/lib/content-analysis-service.ts';
import { cloudStorageService } from './src/lib/cloud-storage-service.ts';

async function testProcessingPipeline() {
  console.log('🚀 Testing Video/Audio Processing Pipeline...\n');

  // Test 1: Check service availability
  console.log('1. Checking service availability...');
  const ffmpegAvailable = await audioProcessingService.checkFFmpegAvailability();
  const openaiAvailable = speechToTextService.isApiAvailable();
  const awsConfigured = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  
  console.log(`   FFmpeg: ${ffmpegAvailable ? '✅ Available' : '❌ Not available'}`);
  console.log(`   OpenAI: ${openaiAvailable ? '✅ Available' : '❌ Not available (will use mock)'}`);
  console.log(`   AWS S3: ${awsConfigured ? '✅ Configured' : '❌ Not configured (will use mock)'}\n`);

  // Test 2: Environment validation
  console.log('2. Validating environment configuration...');
  const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET;
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
  const hasAWSCredentials = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  
  console.log(`   NEXTAUTH_SECRET: ${hasNextAuthSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`   OPENAI_API_KEY: ${hasOpenAIKey ? '✅ Set' : '❌ Missing (mock mode)'}`);
  console.log(`   AWS Credentials: ${hasAWSCredentials ? '✅ Set' : '❌ Missing (mock mode)'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}\n`);

  // Test 3: Mock content analysis
  console.log('3. Testing content analysis with mock data...');
  const mockTranscription = "Hello, how are you today? I am learning English. It's a beautiful day outside. What do you like to do for fun?";
  const mockSpeakerTurns = [
    { speaker: 'Speaker 1', text: 'Hello, how are you today?', startTime: 0, endTime: 2 },
    { speaker: 'Speaker 2', text: 'I am learning English.', startTime: 3, endTime: 5 },
    { speaker: 'Speaker 1', text: "It's a beautiful day outside.", startTime: 6, endTime: 8 },
    { speaker: 'Speaker 2', text: 'What do you like to do for fun?', startTime: 9, endTime: 11 }
  ];

  try {
    const analysis = await contentAnalysisService.analyzeContent(
      mockTranscription,
      mockSpeakerTurns,
      'en',
      'A2'
    );

    console.log('   ✅ Content analysis successful!');
    console.log(`   Generated conversations: ${analysis.conversations.length}`);
    console.log(`   Extracted vocabulary: ${analysis.vocabulary.length}`);
    console.log(`   Suggested CEFR level: ${analysis.suggestedCefrLevel}`);
    console.log(`   Identified topics: ${analysis.topics.join(', ')}`);
    console.log(`   Grammar patterns: ${analysis.grammarPatterns.length}\n`);
  } catch (error) {
    console.log(`   ❌ Content analysis failed: ${error.message}\n`);
  }

  // Test 4: Speech-to-text service
  console.log('4. Testing speech-to-text service...');
  try {
    const mockAudioBuffer = Buffer.from('mock audio data');
    const transcription = await speechToTextService.transcribeAudio(mockAudioBuffer, {
      language: 'en',
      includeTimestamps: true
    });

    console.log('   ✅ Speech-to-text successful!');
    console.log(`   Transcription length: ${transcription.transcription?.length || 0} characters`);
    console.log(`   Segments: ${transcription.segments?.length || 0}`);
    console.log(`   Detected language: ${transcription.language || 'unknown'}\n`);
  } catch (error) {
    console.log(`   ❌ Speech-to-text failed: ${error.message}\n`);
  }

  // Test 5: Audio format validation
  console.log('5. Testing audio format support...');
  const supportedFormats = [
    'audio/wav',
    'audio/mp3',
    'audio/mp4',
    'video/mp4',
    'video/webm'
  ];

  supportedFormats.forEach(format => {
    const supported = speechToTextService.isSupportedAudioFormat(format);
    console.log(`   ${format}: ${supported ? '✅ Supported' : '❌ Not supported'}`);
  });

  // Test 6: Cloud storage simulation
  console.log('\n6. Testing cloud storage service...');
  try {
    // Test with mock file data
    const mockFile = Buffer.from('mock file content');
    const uploadResult = await cloudStorageService.uploadFile(mockFile, 'test-file.txt', 'text/plain');
    
    if (uploadResult.success) {
      console.log('   ✅ Cloud storage upload successful!');
      console.log(`   File key: ${uploadResult.fileKey}`);
    } else {
      console.log(`   ❌ Cloud storage upload failed: ${uploadResult.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Cloud storage test failed: ${error.message}`);
  }

  // Test 7: Audio processing capabilities
  console.log('\n7. Testing audio processing capabilities...');
  try {
    const formats = audioProcessingService.getSupportedFormats();
    console.log('   ✅ Audio processing formats available:');
    console.log(`   Input formats: ${formats.input.join(', ')}`);
    console.log(`   Output formats: ${formats.output.join(', ')}`);
  } catch (error) {
    console.log(`   ❌ Audio processing test failed: ${error.message}`);
  }

  console.log('\n🎉 Processing pipeline test complete!');
  console.log('\n📋 Test Summary:');
  console.log(`   FFmpeg: ${ffmpegAvailable ? 'Available' : 'Not available'}`);
  console.log(`   OpenAI API: ${openaiAvailable ? 'Configured' : 'Not configured (mock mode)'}`);
  console.log(`   AWS S3: ${awsConfigured ? 'Configured' : 'Not configured (mock mode)'}`);
  
  console.log('\n🔄 Next steps:');
  if (!hasNextAuthSecret) {
    console.log('1. Set NEXTAUTH_SECRET in .env.local (required for authentication)');
  }
  if (!hasOpenAIKey) {
    console.log('2. Set OPENAI_API_KEY in .env.local (required for real speech-to-text)');
  }
  if (!hasAWSCredentials) {
    console.log('3. Set AWS credentials in .env.local (required for file storage)');
  }
  if (!ffmpegAvailable) {
    console.log('4. Install FFmpeg (required for audio/video processing)');
  }
  console.log('5. Test with real audio/video files via the upload interface');
  console.log('6. Monitor processing logs during file upload');
  console.log('7. Review the VIDEO_AUDIO_TESTING_GUIDE.md for detailed testing instructions');
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testProcessingPipeline().catch(console.error);
}

export { testProcessingPipeline };
