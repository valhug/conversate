'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ConversationMessage } from '@conversate/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@conversate/ui';
import { Mic, MicOff, Send, Volume2 } from 'lucide-react';
import { ttsService } from '@/lib/elevenlabs-tts-service';

interface ConversationChatProps {
  messages: ConversationMessage[];
  onSendMessage: (message: string) => void;
  onSpeechInput?: (transcript: string) => void;
  isLoading?: boolean;
  language: string;
  cefrLevel: string;
}

export function ConversationChat({
  messages,
  onSendMessage,
  onSpeechInput,
  isLoading = false,
  language,
  cefrLevel,
}: ConversationChatProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = getLanguageCode(language);
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0]?.transcript;
          if (transcript && onSpeechInput) {
            onSpeechInput(transcript);
            setInputMessage(transcript);
          }
          setIsRecording(false);
        };
        
        recognitionRef.current.onerror = () => {
          setIsRecording(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsRecording(false);
        };
      }
      setIsSpeechEnabled(true);
    }
  }, [language, onSpeechInput]);

  const getLanguageCode = (lang: string): string => {
    const langMap: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'tl': 'tl-PH',
    };
    return langMap[lang] || 'en-US';
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() && !isLoading) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };  const speakMessage = async (text: string) => {
    try {
      await ttsService.playText(text, language as 'en' | 'es' | 'fr' | 'tl');
    } catch (error) {
      console.error('TTS failed:', error);
      // Fallback to basic browser TTS
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getLanguageCode(language);
        utterance.rate = 0.8; // Slightly slower for language learning
        speechSynthesis.speak(utterance);
      }
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Conversation Practice</h2>
            <p className="text-sm text-muted-foreground">
              Language: {language.toUpperCase()} | Level: {cefrLevel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {messages.length} messages
            </span>
          </div>
        </div>
      </div>      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[calc(100vh-300px)]">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Start your conversation practice! Send a message to begin.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>💡 Tips for {cefrLevel} level:</p>
              <ul className="mt-2 space-y-1">
                {cefrLevel === 'A1' && (
                  <>
                    <li>• Use simple sentences</li>
                    <li>• Talk about familiar topics</li>
                    <li>• Don&apos;t worry about mistakes</li>
                  </>
                )}
                {cefrLevel === 'A2' && (
                  <>
                    <li>• Practice past and future tenses</li>
                    <li>• Describe your experiences</li>
                    <li>• Ask follow-up questions</li>
                  </>
                )}
                {(cefrLevel === 'B1' || cefrLevel === 'B2') && (
                  <>
                    <li>• Express opinions and reasons</li>
                    <li>• Use connecting words</li>
                    <li>• Practice complex conversations</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}        {messages.map((message) => (
          <Card 
            key={message.id} 
            className={`max-w-[80%] ${
              message.speaker === 'user' 
                ? 'ml-auto bg-primary text-primary-foreground' 
                : 'mr-auto'
            }`}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-1">
                    {message.speaker === 'user' ? 'You' : 'AI Assistant'}
                  </p>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
                {message.speaker === 'ai' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => speakMessage(message.content)}
                    className="flex-shrink-0"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {isLoading && (
          <Card className="max-w-[80%] mr-auto">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                </div>
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t bg-background">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={inputMessage}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isLoading}
              className="pr-12"
            />
            {isSpeechEnabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRecording}
                disabled={isLoading}
                className={`absolute right-1 top-1/2 -translate-y-1/2 ${
                  isRecording ? 'text-red-500' : ''
                }`}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isRecording && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            🎤 Listening... Speak clearly in {language.toUpperCase()}
          </p>
        )}
      </div>
    </div>
  );
}

// TypeScript declarations for Speech APIs
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: () => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  transcript: string;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognition;
    };
  }
}

export default ConversationChat;
