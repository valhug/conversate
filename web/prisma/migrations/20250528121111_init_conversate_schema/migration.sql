-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'ERROR');

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "hashedPassword" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nativeLanguage" TEXT NOT NULL DEFAULT 'en',
    "targetLanguage" TEXT NOT NULL DEFAULT 'es',
    "currentLevel" TEXT NOT NULL DEFAULT 'A1',
    "learningGoals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferredPersonas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "voiceSettings" JSONB,
    "notificationSettings" JSONB,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "level" TEXT NOT NULL DEFAULT 'A1',
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "wordsLearned" INTEGER NOT NULL DEFAULT 0,
    "errorsCorreected" INTEGER NOT NULL DEFAULT 0,
    "aiProvider" TEXT,
    "personaUsed" TEXT,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grammarErrors" JSONB,
    "newVocabulary" JSONB,
    "corrections" JSONB,
    "confidence" DOUBLE PRECISION,
    "audioUrl" TEXT,
    "speechDuration" INTEGER,
    "speechQuality" DOUBLE PRECISION,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "uploaded_files" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "FileStatus" NOT NULL DEFAULT 'UPLOADED',
    "processingError" TEXT,
    "processedAt" TIMESTAMP(3),
    "extractedText" TEXT,
    "language" TEXT,
    "complexity" TEXT,
    "topics" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vocabulary" JSONB,
    "duration" INTEGER,
    "transcription" TEXT,

    CONSTRAINT "uploaded_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "speakingScore" INTEGER,
    "listeningScore" INTEGER,
    "readingScore" INTEGER,
    "writingScore" INTEGER,
    "grammarScore" INTEGER,
    "vocabularyScore" INTEGER,
    "pronunciationScore" INTEGER,
    "wordsLearned" INTEGER NOT NULL DEFAULT 0,
    "mistakesCorrected" INTEGER NOT NULL DEFAULT 0,
    "conversationTime" INTEGER NOT NULL DEFAULT 0,
    "currentLevel" TEXT NOT NULL,
    "progressToNext" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sessionType" TEXT,

    CONSTRAINT "progress_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT,
    "word" TEXT NOT NULL,
    "translation" TEXT NOT NULL,
    "definition" TEXT,
    "pronunciation" TEXT,
    "language" TEXT NOT NULL DEFAULT 'es',
    "contextSentence" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'A1',
    "category" TEXT,
    "timesEncountered" INTEGER NOT NULL DEFAULT 1,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "lastEncountered" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "masteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "vocabulary_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "difficulty" TEXT NOT NULL DEFAULT 'easy',
    "criteria" JSONB NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "traits" JSONB NOT NULL,
    "conversationStyle" JSONB NOT NULL,
    "expertise" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "systemPrompt" TEXT NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "maxTokens" INTEGER NOT NULL DEFAULT 150,
    "totalInteractions" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "persona_interactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER,
    "feedback" TEXT,
    "wordsLearned" INTEGER NOT NULL DEFAULT 0,
    "mistakesCorrected" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "persona_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "vocabulary_entries_userId_word_language_key" ON "vocabulary_entries"("userId", "word", "language");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_key" ON "achievements"("name");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "personas_name_key" ON "personas"("name");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploaded_files" ADD CONSTRAINT "uploaded_files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_entries" ADD CONSTRAINT "progress_entries_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_entries" ADD CONSTRAINT "vocabulary_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vocabulary_entries" ADD CONSTRAINT "vocabulary_entries_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_interactions" ADD CONSTRAINT "persona_interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "persona_interactions" ADD CONSTRAINT "persona_interactions_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
