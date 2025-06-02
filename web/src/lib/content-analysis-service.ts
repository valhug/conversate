// Content analysis service for processing transcribed content into learning materials
import type { ConversationSegment } from '@/types/upload';

export interface VocabularyItem {
  word: string;
  definition?: string;
  difficulty: number;
  frequency: number;
  context: string;
}

export interface GrammarPattern {
  pattern: string;
  description: string;
  examples: string[];
  difficulty: number;
}

export interface ContentAnalysisResult {
  conversations: ConversationSegment[];
  vocabulary: VocabularyItem[];
  grammarPatterns: GrammarPattern[];
  overallDifficulty: number;
  suggestedCefrLevel: string;
  topics: string[];
}

export interface SpeakerTurn {
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
}

class ContentAnalysisService {
  private readonly cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  
  // Common words by CEFR level (simplified - in production, use comprehensive word lists)
  private readonly wordLists = {
    A1: ['hello', 'yes', 'no', 'please', 'thank', 'good', 'bad', 'big', 'small', 'new', 'old'],
    A2: ['always', 'never', 'sometimes', 'often', 'important', 'different', 'difficult', 'easy'],
    B1: ['although', 'however', 'therefore', 'nevertheless', 'furthermore', 'consequently'],
    B2: ['comprehensive', 'significant', 'substantial', 'predominantly', 'consequently'],
    C1: ['sophisticated', 'meticulous', 'unprecedented', 'comprehensive', 'intricate'],
    C2: ['ubiquitous', 'paradigm', 'quintessential', 'juxtaposition', 'dichotomy']
  };

  /**
   * Analyze transcribed content and generate learning materials
   * @param transcription Full transcription text
   * @param speakerTurns Speaker-separated conversation turns
   * @param language Target language
   * @param requestedCefrLevel User's requested CEFR level
   * @returns ContentAnalysisResult with conversations and learning materials
   */
  async analyzeContent(
    transcription: string,
    speakerTurns: SpeakerTurn[],
    language: string,
    requestedCefrLevel: string
  ): Promise<ContentAnalysisResult> {
    try {
      // Generate conversation segments from speaker turns
      const conversations = this.generateConversationSegments(speakerTurns, language, requestedCefrLevel);
      
      // Extract vocabulary for learning
      const vocabulary = this.extractVocabulary(transcription, language);
      
      // Identify grammar patterns
      const grammarPatterns = this.identifyGrammarPatterns(transcription, language);
      
      // Calculate overall difficulty
      const overallDifficulty = this.calculateContentDifficulty(transcription);
      
      // Suggest appropriate CEFR level
      const suggestedCefrLevel = this.suggestCefrLevel(overallDifficulty, vocabulary);
      
      // Extract topics and themes
      const topics = this.extractTopics(transcription);

      return {
        conversations,
        vocabulary,
        grammarPatterns,
        overallDifficulty,
        suggestedCefrLevel,
        topics,
      };

    } catch (error) {
      console.error('Content analysis failed:', error);
      throw new Error(`Content analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate conversation segments from speaker turns
   * @param speakerTurns Array of speaker turns
   * @param language Target language
   * @param cefrLevel CEFR level
   * @returns Array of conversation segments
   */
  private generateConversationSegments(
    speakerTurns: SpeakerTurn[],
    language: string,
    cefrLevel: string
  ): ConversationSegment[] {
    const conversations: ConversationSegment[] = [];
    
    // Group turns into logical conversation segments (e.g., every 3-5 turns)
    const segmentSize = 4; // Number of turns per segment
    
    for (let i = 0; i < speakerTurns.length; i += segmentSize) {
      const segmentTurns = speakerTurns.slice(i, i + segmentSize);
      const segmentText = segmentTurns.map(turn => `${turn.speaker}: ${turn.text}`).join('\n');
      
      // Generate title based on content
      const title = this.generateSegmentTitle(segmentTurns);
      
      // Calculate difficulty for this segment
      const difficulty = this.calculateSegmentDifficulty(segmentText);
      
      // Extract vocabulary from this segment
      const segmentVocabulary = this.extractSegmentVocabulary(segmentText);

      conversations.push({
        id: `conv_${Date.now()}_${i}`,
        title,
        content: segmentText,
        language,
        cefrLevel,
        difficulty,
        vocabulary: segmentVocabulary,
        createdAt: new Date(),
        metadata: {
          startTime: segmentTurns[0]?.startTime || 0,
          endTime: segmentTurns[segmentTurns.length - 1]?.endTime || 0,
          speakers: [...new Set(segmentTurns.map(turn => turn.speaker))],
          turnCount: segmentTurns.length,
        },
      });
    }

    return conversations;
  }  /**
   * Extract vocabulary items for language learning
   * @param text Input text
   * @param language Target language (reserved for future language-specific processing)
   * @returns Array of vocabulary items
   */
  private extractVocabulary(text: string, language: string): VocabularyItem[] {
    // Language parameter reserved for future language-specific processing
    void language;
    const words = this.tokenizeText(text);
    const vocabulary: VocabularyItem[] = [];
    const wordFrequency = new Map<string, number>();

    // Count word frequencies
    words.forEach(word => {
      const cleanWord = word.toLowerCase();
      wordFrequency.set(cleanWord, (wordFrequency.get(cleanWord) || 0) + 1);
    });

    // Filter and analyze words
    Array.from(wordFrequency.entries())
      .filter(([word, frequency]) => {
        // Filter out very common words and short words
        return word.length > 3 && frequency >= 1 && !this.isCommonWord(word);
      })
      .sort(([, a], [, b]) => b - a) // Sort by frequency
      .slice(0, 20) // Take top 20 vocabulary words
      .forEach(([word, frequency]) => {
        const difficulty = this.calculateWordDifficulty(word);
        const context = this.findWordContext(word, text);

        vocabulary.push({
          word,
          difficulty,
          frequency,
          context,
          definition: undefined, // Would be filled by dictionary API in production
        });
      });

    return vocabulary;
  }
  /**
   * Identify grammar patterns in the text
   * @param text Input text
   * @param language Target language (reserved for future language-specific processing)
   * @returns Array of identified grammar patterns
   */
  private identifyGrammarPatterns(text: string, language: string): GrammarPattern[] {
    // Language parameter reserved for future language-specific processing
    void language;
    const patterns: GrammarPattern[] = [];

    // Simple pattern matching (in production, use NLP libraries)
    const grammarRules = [
      {
        pattern: /\b(if|when|while|although|because|since)\b.*,.*\b(then|will|would|can|could)\b/gi,
        description: 'Conditional sentences',
        difficulty: 3,
      },
      {
        pattern: /\b(have|has|had)\s+(been|done|gone|seen|made)\b/gi,
        description: 'Present/Past perfect tense',
        difficulty: 2,
      },
      {
        pattern: /\b(will|would|could|should|might|may)\s+\w+/gi,
        description: 'Modal verbs',
        difficulty: 2,
      },
      {
        pattern: /\b\w+ing\b.*\b(while|when|after|before)\b/gi,
        description: 'Gerunds and participles',
        difficulty: 3,
      },
    ];

    grammarRules.forEach(rule => {
      const matches = text.match(rule.pattern);
      if (matches && matches.length > 0) {
        patterns.push({
          pattern: rule.description,
          description: rule.description,
          examples: matches.slice(0, 3), // Take first 3 examples
          difficulty: rule.difficulty,
        });
      }
    });

    return patterns;
  }

  /**
   * Calculate content difficulty on a scale of 1-6 (A1-C2)
   * @param text Input text
   * @returns Difficulty score (1-6)
   */
  private calculateContentDifficulty(text: string): number {
    const words = this.tokenizeText(text);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Calculate metrics
    const avgWordsPerSentence = words.length / sentences.length;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const complexWords = words.filter(word => word.length > 6).length;
    const complexWordRatio = complexWords / words.length;

    // Calculate difficulty score
    let difficulty = 1;

    if (avgWordsPerSentence > 15) difficulty += 1;
    if (avgWordsPerSentence > 25) difficulty += 1;
    if (avgWordLength > 5) difficulty += 1;
    if (avgWordLength > 6.5) difficulty += 1;
    if (complexWordRatio > 0.3) difficulty += 1;
    if (complexWordRatio > 0.5) difficulty += 1;

    return Math.min(difficulty, 6);
  }

  /**
   * Suggest appropriate CEFR level based on content analysis
   * @param difficulty Calculated difficulty score
   * @param vocabulary Extracted vocabulary
   * @returns Suggested CEFR level
   */
  private suggestCefrLevel(difficulty: number, vocabulary: VocabularyItem[]): string {
    const avgVocabDifficulty = vocabulary.length > 0 
      ? vocabulary.reduce((sum, item) => sum + item.difficulty, 0) / vocabulary.length
      : difficulty;

    const combinedDifficulty = (difficulty + avgVocabDifficulty) / 2;

    if (combinedDifficulty <= 1.5) return 'A1';
    if (combinedDifficulty <= 2.5) return 'A2';
    if (combinedDifficulty <= 3.5) return 'B1';
    if (combinedDifficulty <= 4.5) return 'B2';
    if (combinedDifficulty <= 5.5) return 'C1';
    return 'C2';
  }

  /**
   * Extract main topics from the content
   * @param text Input text
   * @returns Array of identified topics
   */
  private extractTopics(text: string): string[] {
    // Simple keyword-based topic extraction (in production, use topic modeling)
    const topicKeywords = {
      'Business': ['business', 'company', 'work', 'job', 'career', 'office', 'meeting', 'project'],
      'Travel': ['travel', 'trip', 'vacation', 'flight', 'hotel', 'tourism', 'country', 'culture'],
      'Education': ['school', 'student', 'teacher', 'learn', 'study', 'education', 'university'],
      'Technology': ['computer', 'internet', 'software', 'digital', 'technology', 'app', 'device'],
      'Health': ['health', 'doctor', 'medicine', 'hospital', 'exercise', 'diet', 'wellness'],
      'Food': ['food', 'restaurant', 'cooking', 'recipe', 'meal', 'dinner', 'lunch'],
      'Family': ['family', 'parent', 'child', 'brother', 'sister', 'home', 'relationship'],
    };

    const topics: string[] = [];
    const lowerText = text.toLowerCase();

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const matches = keywords.filter(keyword => lowerText.includes(keyword));
      if (matches.length >= 2) { // Require at least 2 keyword matches
        topics.push(topic);
      }
    });

    return topics.length > 0 ? topics : ['General Conversation'];
  }

  // Helper methods

  private tokenizeText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private isCommonWord(word: string): boolean {
    const commonWords = ['the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but', 'his', 'from', 'they', 'she', 'her', 'been', 'than', 'its', 'who', 'did', 'get', 'may', 'him', 'old', 'see', 'now', 'way', 'two', 'how', 'day', 'man', 'new', 'has', 'can', 'was', 'one', 'our', 'out', 'use', 'your', 'all', 'any', 'more', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'will', 'work'];
    return commonWords.includes(word);
  }

  private calculateWordDifficulty(word: string): number {
    // Check against word lists
    for (const [level, words] of Object.entries(this.wordLists)) {
      if (words.includes(word)) {
        const levelIndex = this.cefrLevels.indexOf(level as keyof typeof this.wordLists);
        return levelIndex + 1;
      }
    }

    // Fallback: difficulty based on word length and complexity
    if (word.length <= 4) return 1;
    if (word.length <= 6) return 2;
    if (word.length <= 8) return 3;
    if (word.length <= 10) return 4;
    return 5;
  }

  private findWordContext(word: string, text: string): string {
    const sentences = text.split(/[.!?]+/);
    const matchingSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes(word.toLowerCase())
    );
    
    return matchingSentence?.trim() || '';
  }

  private generateSegmentTitle(turns: SpeakerTurn[]): string {
    // Extract key words from the conversation
    const allText = turns.map(turn => turn.text).join(' ');
    const words = this.tokenizeText(allText);
    
    // Find most important words (exclude common words)
    const importantWords = words
      .filter(word => !this.isCommonWord(word) && word.length > 3)
      .slice(0, 3);

    if (importantWords.length > 0) {
      return `Discussion about ${importantWords.join(', ')}`;
    }

    return `Conversation Segment`;
  }

  private calculateSegmentDifficulty(text: string): number {
    return this.calculateContentDifficulty(text);
  }

  private extractSegmentVocabulary(text: string): string[] {
    const words = this.tokenizeText(text);
    return [...new Set(words)]
      .filter(word => !this.isCommonWord(word) && word.length > 4)
      .slice(0, 8);
  }
}

// Export singleton instance
export const contentAnalysisService = new ContentAnalysisService();
export default ContentAnalysisService;
