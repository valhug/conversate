import { PrismaClient, Prisma } from '../generated/prisma'
import { withAccelerate } from '@prisma/extension-accelerate'

// Create a global variable for Prisma in development to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: ['query'],
  }).$extends(withAccelerate())
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// User operations
export const userService = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: true,
      },
    })
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        accounts: true,
        sessions: true,
      },
    })
  },

  async create(userData: {
    email: string
    name?: string
    hashedPassword?: string
    nativeLanguage?: string
    targetLanguage?: string
    currentLevel?: string
  }) {
    return prisma.user.create({
      data: userData,
    })
  },  async update(id: string, userData: Partial<{
    name: string
    email: string
    nativeLanguage: string
    targetLanguage: string
    currentLevel: string
    learningGoals: string[]
    preferredTopics: string[]
    preferredPersonas: string[]
    voiceSettings: Prisma.InputJsonValue
    notificationSettings: Prisma.InputJsonValue
  }>) {
    return prisma.user.update({
      where: { id },
      data: userData,
    })
  }
}

// Message operations
export const messageService = {
  async create(conversationId: string, data: {
    role: 'USER' | 'ASSISTANT' | 'SYSTEM'
    content: string
    grammarErrors?: Prisma.InputJsonValue
    newVocabulary?: Prisma.InputJsonValue
    corrections?: Prisma.InputJsonValue
    confidence?: number
    audioUrl?: string
    speechDuration?: number
    speechQuality?: number
  }) {
    return await prisma.conversationMessage.create({
      data: {
        conversationId,
        ...data,
      },
    })
  },

  async findByConversationId(conversationId: string) {
    return await prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'asc' },
    })
  },

  async deleteByConversationId(conversationId: string) {
    return await prisma.conversationMessage.deleteMany({
      where: { conversationId },
    })
  },

  async findById(id: string) {
    return await prisma.conversationMessage.findUnique({
      where: { id },
      include: {
        conversation: true,
      },
    })
  },  async updateMessage(id: string, data: {
    content?: string
    grammarErrors?: Prisma.InputJsonValue
    newVocabulary?: Prisma.InputJsonValue
    corrections?: Prisma.InputJsonValue
    confidence?: number
    audioUrl?: string
    speechDuration?: number
    speechQuality?: number
  }) {
    return prisma.conversationMessage.update({
      where: { id },
      data,
    })
  }
}

// Conversation operations
export const conversationService = {
  async create(userId: string, data: {
    title?: string
    language?: string
    level?: string
    aiProvider?: string
    personaUsed?: string
  }) {
    return prisma.conversation.create({
      data: {
        userId,
        ...data,
      },
      include: {
        messages: true,
        user: true,
      },
    })
  },

  async findByUserId(userId: string, limit = 10) {
    return prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          take: 1,
          orderBy: { timestamp: 'desc' },
        },
      },
      orderBy: { startedAt: 'desc' },
      take: limit,
    })
  },

  async findById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { timestamp: 'asc' },
        },
        user: true,
      },
    })
  },  async addMessage(conversationId: string, data: {
    role: 'USER' | 'ASSISTANT' | 'SYSTEM'
    content: string
    grammarErrors?: Prisma.InputJsonValue
    newVocabulary?: Prisma.InputJsonValue
    corrections?: Prisma.InputJsonValue
    confidence?: number
    audioUrl?: string
    speechDuration?: number
    speechQuality?: number
  }) {
    // Add message and update conversation stats
    const [message] = await prisma.$transaction([
      prisma.conversationMessage.create({
        data: {
          conversationId,
          ...data,
        },
      }),
      prisma.conversation.update({
        where: { id: conversationId },
        data: {
          totalMessages: { increment: 1 },
        },
      }),
    ])
    
    return message
  },

  async updateStats(id: string, stats: {
    totalDuration?: number
    wordsLearned?: number
    errorsCorreected?: number
  }) {
    return prisma.conversation.update({
      where: { id },
      data: stats,
    })
  },

  async endConversation(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    })
  }
}

// File upload operations
export const fileService = {
  async create(userId: string, data: {
    fileName: string
    originalName: string
    fileSize: number
    mimeType: string
    fileUrl: string
  }) {
    return prisma.uploadedFile.create({
      data: {
        userId,
        ...data,
      },
    })
  },  async updateProcessingStatus(id: string, data: {
    status: 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'ERROR'
    processingError?: string
    processedAt?: Date
    extractedText?: string
    language?: string
    complexity?: string
    topics?: string[]
    vocabulary?: Prisma.InputJsonValue
    duration?: number
    transcription?: string
  }) {
    return prisma.uploadedFile.update({
      where: { id },
      data,
    })
  },

  async findByUserId(userId: string, limit = 20) {
    return prisma.uploadedFile.findMany({
      where: { userId },
      orderBy: { uploadedAt: 'desc' },
      take: limit,
    })
  },

  async findById(id: string) {
    return prisma.uploadedFile.findUnique({
      where: { id },
    })
  }
}

// Progress tracking operations
export const progressService = {
  async createEntry(userId: string, data: {
    conversationId?: string
    speakingScore?: number
    listeningScore?: number
    readingScore?: number
    writingScore?: number
    grammarScore?: number
    vocabularyScore?: number
    pronunciationScore?: number
    wordsLearned?: number
    mistakesCorrected?: number
    conversationTime?: number
    currentLevel: string
    progressToNext?: number
    sessionType?: string
  }) {
    return prisma.progressEntry.create({
      data: {
        userId,
        ...data,
      },
    })
  },

  async getUserProgress(userId: string, limit = 30) {
    return prisma.progressEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        conversation: true,
      },
    })
  },

  async getProgressByDateRange(userId: string, startDate: Date, endDate: Date) {
    return prisma.progressEntry.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    })
  },

  async getLatestProgress(userId: string) {
    return prisma.progressEntry.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    })
  }
}

// Vocabulary operations
export const vocabularyService = {
  async addWord(userId: string, data: {
    conversationId?: string
    word: string
    translation: string
    definition?: string
    pronunciation?: string
    language?: string
    contextSentence?: string
    difficulty?: string
    category?: string
  }) {
    return prisma.vocabularyEntry.upsert({
      where: {
        userId_word_language: {
          userId,
          word: data.word,
          language: data.language || 'es',
        },
      },
      update: {
        timesEncountered: { increment: 1 },
        lastEncountered: new Date(),
        ...(data.contextSentence && { contextSentence: data.contextSentence }),
      },
      create: {
        userId,
        ...data,
        language: data.language || 'es',
      },
    })
  },

  async getUserVocabulary(userId: string, language = 'es', limit = 50) {
    return prisma.vocabularyEntry.findMany({
      where: { userId, language },
      orderBy: { lastEncountered: 'desc' },
      take: limit,
    })
  },

  async updateMastery(id: string, correct: boolean) {
    const entry = await prisma.vocabularyEntry.findUnique({ where: { id } })
    if (!entry) return null

    const newTimesCorrect = correct ? entry.timesCorrect + 1 : entry.timesCorrect
    const newMasteryLevel = Math.min(newTimesCorrect / (entry.timesEncountered + 1), 1)

    return prisma.vocabularyEntry.update({
      where: { id },
      data: {
        timesCorrect: newTimesCorrect,
        masteryLevel: newMasteryLevel,
        timesEncountered: { increment: 1 },
        lastEncountered: new Date(),
      },
    })
  },

  async getWordsToReview(userId: string, language = 'es', limit = 10) {
    return prisma.vocabularyEntry.findMany({
      where: {
        userId,
        language,
        masteryLevel: { lt: 0.8 }, // Words not fully mastered
      },
      orderBy: [
        { lastEncountered: 'asc' }, // Words not seen recently
        { masteryLevel: 'asc' }, // Words with lower mastery
      ],
      take: limit,
    })
  }
}

// Achievement operations (future use)
export const achievementService = {
  async getUserAchievements(userId: string) {
    return prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    })
  },

  async unlockAchievement(userId: string, achievementId: string, progress = 1) {
    return prisma.userAchievement.upsert({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
      update: {
        progress,
      },
      create: {
        userId,
        achievementId,
        progress,
      },
    })
  }
}

// Future: Persona operations (for Session #2 LLM system)
export const personaService = {
  async getActivePersonas() {
    return prisma.persona.findMany({
      where: { isActive: true },
      orderBy: { totalInteractions: 'desc' },
    })
  },

  async recordInteraction(userId: string, personaId: string, data: {
    duration: number
    messages?: number
    rating?: number
    feedback?: string
    wordsLearned?: number
    mistakesCorrected?: number
  }) {
    return prisma.personaInteraction.create({
      data: {
        userId,
        personaId,
        ...data,
      },
    })
  },
  async getPersonaStats(personaId: string) {
    const interactions = await prisma.personaInteraction.findMany({
      where: { personaId },
    })

    return {
      totalInteractions: interactions.length,
      averageRating: interactions.length > 0 
        ? interactions.reduce((sum: number, interaction: { rating: number | null }) => sum + (interaction.rating || 0), 0) / interactions.length 
        : 0,
      totalDuration: interactions.reduce((sum: number, interaction: { duration: number }) => sum + interaction.duration, 0),
    }
  }
}

export default prisma
