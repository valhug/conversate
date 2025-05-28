import { LanguageCode } from '@conversate/shared';

// Browser TTS service
class BrowserTTSService {
  async generateSpeech(text: string, language: LanguageCode): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported in this browser'));
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getLanguageCode(language);
      utterance.rate = 0.8; // Slightly slower for language learning
      
      // Create a dummy ArrayBuffer for compatibility
      // Browser TTS plays directly without returning audio data
      const dummyBuffer = new ArrayBuffer(1);
      
      utterance.onend = () => {
        resolve(dummyBuffer);
      };
      
      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      speechSynthesis.speak(utterance);
    });
  }

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  private getLanguageCode(language: LanguageCode): string {
    const langMap: Record<LanguageCode, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'tl': 'tl-PH',
    };
    return langMap[language] || 'en-US';
  }
}

// Main TTS service
class TTSService {
  private browserService: BrowserTTSService;

  constructor() {
    this.browserService = new BrowserTTSService();
  }

  async generateSpeech(text: string, language: LanguageCode): Promise<ArrayBuffer | null> {
    try {
      if (await this.browserService.isAvailable()) {
        console.log('Using browser TTS');
        return await this.browserService.generateSpeech(text, language);
      }
    } catch (error) {
      console.error('Browser TTS failed:', error);
    }

    return null;
  }

  async playText(text: string, language: LanguageCode): Promise<void> {
    const audioBuffer = await this.generateSpeech(text, language);
    
    if (!audioBuffer) {
      throw new Error('No TTS service available');
    }

    // For browser TTS, the speech was already played during generation
    // No additional playback needed
  }
}

export const ttsService = new TTSService();
export { BrowserTTSService, TTSService };
