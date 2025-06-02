# 🚀 Video/Audio Processing Pipeline Testing Guide

This guide will help you test the complete video/audio processing pipeline that was implemented in the Conversate application.

## 📋 Prerequisites

### 1. Required Software
- **Node.js** (v18 or higher)
- **FFmpeg** (for audio/video processing)
- **PostgreSQL** (for database, optional for basic testing)

### 2. Install FFmpeg
**Windows:**
```powershell
# Using Chocolatey
choco install ffmpeg

# Or download from: https://ffmpeg.org/download.html
```

**Mac:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt update && sudo apt install ffmpeg
```

### 3. Environment Setup
Copy the environment template and configure it:
```powershell
cd "c:\Users\Antel\OneDrive\Documents\New folder\Mumicah\conversate\web"
cp .env.example .env.local
```

## 🔧 Configuration Levels

### Level 1: Basic Testing (No API Keys)
For testing the pipeline structure without external services:
```env
# .env.local - Minimal setup
NEXTAUTH_SECRET="test-secret-key-for-development-only"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Level 2: AI-Powered Testing (OpenAI API)
For testing speech-to-text functionality:
```env
# Add to .env.local
OPENAI_API_KEY="your-openai-api-key-here"
```

### Level 3: Full Pipeline Testing (All Services)
For complete testing with cloud storage:
```env
# Add to .env.local
OPENAI_API_KEY="your-openai-api-key-here"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET_NAME="your-bucket-name"
```

## 🧪 Testing Methods

### Method 1: Run the Test Script
```powershell
# Navigate to web directory
cd "c:\Users\Antel\OneDrive\Documents\New folder\Mumicah\conversate\web"

# Run the processing pipeline test
node test-processing-pipeline.js
```

### Method 2: Test via Upload API
```powershell
# Start the development server
npm run dev

# Open browser to: http://localhost:3000/upload
# Upload a test file (MP4, MP3, or TXT)
```

### Method 3: Test Individual Services
```powershell
# Test FFmpeg availability
node -e "import('./src/lib/audio-processing-service.js').then(m => m.audioProcessingService.checkFFmpegAvailability().then(console.log))"

# Test OpenAI connection (requires API key)
node -e "import('./src/lib/speech-to-text-service.js').then(m => console.log(m.speechToTextService.isApiAvailable()))"
```

## 📁 Test Files

### Create Test Audio Files
Create these test files in a `test-files/` directory:

**1. Simple MP3 (test-audio.mp3)**
- Record a short 10-second audio clip
- Or download from: https://www.soundjay.com/misc/beep-07a.wav

**2. Simple MP4 (test-video.mp4)**
- Create a short video with speech
- Or use any MP4 file with audio track

**3. Text File (test-transcript.txt)**
```
Hello, this is a test conversation.
Speaker A: How are you doing today?
Speaker B: I'm doing great, thank you for asking.
Speaker A: What would you like to practice?
Speaker B: I'd like to work on my pronunciation.
```

## 🔍 Testing Scenarios

### Scenario 1: Service Availability Check
Expected output:
```
🚀 Testing Video/Audio Processing Pipeline...

1. Checking service availability...
   FFmpeg: ✅ Available
   OpenAI: ✅ Available (or ❌ Not available - will use mock)
   AWS S3: ✅ Configured (or ❌ Not configured - will use mock)
```

### Scenario 2: Content Analysis Testing
Tests the content analysis service with mock data:
```
2. Testing content analysis with mock data...
   ✅ Content analysis successful!
   Generated conversations: 2
   Extracted vocabulary: 8
   Suggested CEFR level: A2
   Identified topics: greeting, learning
   Grammar patterns: 2
```

### Scenario 3: Speech-to-Text Testing
Tests transcription capabilities:
```
3. Testing speech-to-text service...
   ✅ Speech-to-text successful!
   Transcription length: 45 characters
   Segments: 1
   Detected language: en
```

### Scenario 4: Format Support Validation
```
4. Testing audio format support...
   audio/wav: ✅ Supported
   audio/mp3: ✅ Supported
   audio/mp4: ✅ Supported
   video/mp4: ✅ Supported
   video/webm: ✅ Supported
```

## 🚨 Troubleshooting

### Common Issues

**FFmpeg Not Found:**
```
❌ FFmpeg not available
```
Solution: Install FFmpeg and ensure it's in your PATH

**OpenAI API Key Invalid:**
```
❌ Speech-to-text failed: Invalid API key
```
Solution: Check your OPENAI_API_KEY in .env.local

**AWS Credentials Invalid:**
```
❌ File upload failed: AWS credentials invalid
```
Solution: Verify AWS credentials and bucket permissions

**File Too Large:**
```
❌ File upload failed: File size exceeds limit
```
Solution: Use smaller test files (< 25MB for videos)

### Debug Commands

**Check Environment Variables:**
```powershell
node -e "console.log('OpenAI:', !!process.env.OPENAI_API_KEY); console.log('AWS:', !!process.env.AWS_ACCESS_KEY_ID);"
```

**Test FFmpeg Installation:**
```powershell
ffmpeg -version
```

**Check File Permissions:**
```powershell
# Ensure test files are readable
Get-ChildItem .\test-files\ | Select-Object Name, Length
```

## 📊 Expected Results

### Successful Pipeline Test Output
```
🚀 Testing Video/Audio Processing Pipeline...

1. Checking service availability...
   FFmpeg: ✅ Available
   OpenAI: ✅ Available
   AWS S3: ✅ Configured

2. Testing content analysis with mock data...
   ✅ Content analysis successful!
   Generated conversations: 2
   Extracted vocabulary: 15
   Suggested CEFR level: A2
   Identified topics: greeting, learning, conversation
   Grammar patterns: 3

3. Testing speech-to-text service...
   ✅ Speech-to-text successful!
   Transcription length: 87 characters
   Segments: 4
   Detected language: en

4. Testing audio format support...
   audio/wav: ✅ Supported
   audio/mp3: ✅ Supported
   audio/mp4: ✅ Supported
   video/mp4: ✅ Supported
   video/webm: ✅ Supported

🎉 Processing pipeline test complete!

Next steps:
1. Set up environment variables (.env.local)
2. Test with real audio/video files
3. Monitor processing logs during upload
```

## 🔄 Next Steps After Testing

1. **Environment Setup**: Configure production environment variables
2. **Real File Testing**: Upload actual audio/video files through the web interface
3. **Performance Testing**: Test with larger files and multiple concurrent uploads
4. **Integration Testing**: Test the full workflow from upload → processing → content creation
5. **Error Handling**: Test edge cases and error scenarios

## 📝 Test Report Template

Document your test results:

```
# Test Report - Video/Audio Processing Pipeline
Date: [Current Date]
Tester: [Your Name]
Environment: Development/Staging/Production

## Configuration Used:
- [ ] Basic (no API keys)
- [ ] AI-Powered (OpenAI API)
- [ ] Full Pipeline (All services)

## Test Results:
- [ ] FFmpeg availability: Pass/Fail
- [ ] Service integration: Pass/Fail
- [ ] Content analysis: Pass/Fail
- [ ] Speech-to-text: Pass/Fail
- [ ] Format support: Pass/Fail

## Issues Found:
[Describe any issues encountered]

## Recommendations:
[Any suggestions for improvement]
```

---

This testing guide provides comprehensive coverage of the video/audio processing pipeline, from basic functionality to full production testing.
