'use client';

import React, { useState, useCallback } from 'react';
import { ConversationMessage, ConversationRequest, ConversationResponse, ConversationTopic, CONVERSATION_TOPICS } from '@conversate/shared';
import { LanguageCode } from '@conversate/shared';
import ConversationChat from '@/components/conversation/conversation-chat';

// Simple Card components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, MessageCircle, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 - Beginner', description: 'Basic phrases and simple conversations' },
  { value: 'A2', label: 'A2 - Elementary', description: 'Everyday expressions and basic information' },
  { value: 'B1', label: 'B1 - Intermediate', description: 'Clear standard input on familiar matters' },
  { value: 'B2', label: 'B2 - Upper Intermediate', description: 'Complex text and abstract topics' },
  { value: 'C1', label: 'C1 - Advanced', description: 'Wide range of demanding, longer texts' },
  { value: 'C2', label: 'C2 - Proficient', description: 'Everything heard or read with ease' },
];

const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'es', label: 'Spanish', flag: '🇪🇸' },
  { value: 'fr', label: 'French', flag: '🇫🇷' },
  { value: 'tl', label: 'Tagalog', flag: '🇵🇭' },
];

const TOPICS = [
  { value: CONVERSATION_TOPICS.DAILY_LIFE, label: 'Daily Life', icon: '🏠' },
  { value: CONVERSATION_TOPICS.BUSINESS, label: 'Business', icon: '💼' },
  { value: CONVERSATION_TOPICS.TRAVEL, label: 'Travel', icon: '✈️' },
  { value: CONVERSATION_TOPICS.FOOD, label: 'Food', icon: '🍽️' },
  { value: CONVERSATION_TOPICS.CULTURE, label: 'Culture', icon: '🎭' },
  { value: CONVERSATION_TOPICS.EDUCATION, label: 'Education', icon: '📚' },
  { value: CONVERSATION_TOPICS.HEALTH, label: 'Health', icon: '🏥' },
  { value: CONVERSATION_TOPICS.TECHNOLOGY, label: 'Technology', icon: '💻' },
  { value: CONVERSATION_TOPICS.ENTERTAINMENT, label: 'Entertainment', icon: '🎬' },
  { value: CONVERSATION_TOPICS.FAMILY, label: 'Family', icon: '👨‍👩‍👧‍👦' },
];

export default function ConversationPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(uuidv4());
  const [sessionId] = useState(uuidv4());  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedLevel, setSelectedLevel] = useState('A1');
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic>(CONVERSATION_TOPICS.DAILY_LIFE);
  const [conversationStarted, setConversationStarted] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;    // Add user message to chat
    const userMessage: ConversationMessage = {
      id: uuidv4(),
      sessionId,
      speaker: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {      const request: ConversationRequest = {
        message,
        conversationId,
        sessionId,
        language: selectedLanguage as LanguageCode,
        cefrLevel: selectedLevel as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2',
        topic: selectedTopic,
      };

      const response = await fetch('/api/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data: ConversationResponse = await response.json();      // Add AI response to chat
      const aiMessage: ConversationMessage = {
        id: uuidv4(),
        sessionId,
        speaker: 'ai',
        content: data.message,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
        // Add error message
      const errorMessage: ConversationMessage = {
        id: uuidv4(),
        sessionId,
        speaker: 'ai',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, sessionId, selectedLanguage, selectedLevel, selectedTopic]);  const handleSpeechInput = useCallback(() => {
    // Speech input is handled by the ConversationChat component
    // The transcript is automatically set in the input field
  }, []);

  const startConversation = () => {
    setConversationStarted(true);
      // Add welcome message
    const welcomeMessage: ConversationMessage = {
      id: uuidv4(),
      sessionId,
      speaker: 'ai',
      content: getWelcomeMessage(selectedLanguage, selectedLevel, selectedTopic),
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const getWelcomeMessage = (language: string, level: string, topic: string) => {
    const topicName = TOPICS.find(t => t.value === topic)?.label || 'general conversation';
    
    const welcomeMessages: Record<string, Record<string, string>> = {
      'en': {
        'A1': `Hello! I'm excited to practice English with you. Let's talk about ${topicName}. How are you today?`,
        'A2': `Hi there! I'm here to help you practice English. We'll focus on ${topicName}. What would you like to start with?`,
        'B1': `Welcome! I'm ready to have an engaging conversation about ${topicName} to help improve your English. What interests you most about this topic?`,
        'B2': `Hello! Let's dive into an interesting discussion about ${topicName}. I'm here to challenge you and help refine your English skills. What's your perspective on this subject?`,
        'C1': `Greetings! I'm looking forward to an intellectually stimulating conversation about ${topicName}. Let's explore the nuances and complexities of this topic together.`,
        'C2': `Welcome to our advanced discussion! Let's engage in a sophisticated exploration of ${topicName}, examining multiple perspectives and subtle distinctions.`,
      },
      'es': {
        'A1': `¡Hola! Me emociona practicar español contigo. Hablemos sobre ${topicName}. ¿Cómo estás hoy?`,
        'A2': `¡Hola! Estoy aquí para ayudarte a practicar español. Nos enfocaremos en ${topicName}. ¿Con qué te gustaría empezar?`,
      },
      'fr': {
        'A1': `Bonjour ! Je suis ravi de pratiquer le français avec vous. Parlons de ${topicName}. Comment allez-vous aujourd'hui ?`,
        'A2': `Salut ! Je suis là pour vous aider à pratiquer le français. Nous nous concentrerons sur ${topicName}. Par quoi aimeriez-vous commencer ?`,
      },
      'tl': {
        'A1': `Kumusta! Excited ako na mag-practice tayo ng Tagalog. Pag-usapan natin ang ${topicName}. Kumusta ka ngayon?`,
        'A2': `Hello! Nandito ako para tulungan ka mag-practice ng Tagalog. Focus natin sa ${topicName}. Ano ang gusto mong simulan?`,
      },
    };

    return welcomeMessages[language]?.[level] || welcomeMessages['en']['A1'];
  };

  if (!conversationStarted) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold mb-2">Start a Conversation</h1>
          <p className="text-muted-foreground">
            Choose your language, level, and topic to begin practicing
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Conversation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Language Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Target Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Level Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Your Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CEFR_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <div className="font-medium">{level.label}</div>
                        <div className="text-xs text-muted-foreground">{level.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Topic Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Conversation Topic</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TOPICS.map((topic) => (                  <Button
                    key={topic.value}
                    variant={selectedTopic === topic.value ? "default" : "outline"}
                    className="justify-start h-auto p-3"
                    onClick={() => setSelectedTopic(topic.value as ConversationTopic)}
                  >
                    <span className="mr-2">{topic.icon}</span>
                    <span className="text-sm">{topic.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary and Start Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-medium mb-2">Ready to start?</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {LANGUAGES.find(l => l.value === selectedLanguage)?.label}
                  </Badge>
                  <Badge variant="secondary">
                    Level {selectedLevel}
                  </Badge>
                  <Badge variant="secondary">
                    {TOPICS.find(t => t.value === selectedTopic)?.label}
                  </Badge>
                </div>
              </div>
              <Button onClick={startConversation} size="lg" className="w-full md:w-auto">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Conversation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px-64px)]">
      <div className="flex-shrink-0 border-b bg-background p-4">
        <div className="container mx-auto flex items-center justify-between">          <Button
            variant="ghost"
            onClick={() => setConversationStarted(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/progress')}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Progress
            </Button>
            <Badge variant="outline">
              {LANGUAGES.find(l => l.value === selectedLanguage)?.flag} {LANGUAGES.find(l => l.value === selectedLanguage)?.label}
            </Badge>
            <Badge variant="outline">Level {selectedLevel}</Badge>
            <Badge variant="outline">
              {TOPICS.find(t => t.value === selectedTopic)?.icon} {TOPICS.find(t => t.value === selectedTopic)?.label}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="flex-1 container mx-auto pb-4">
        <ConversationChat
          messages={messages}
          onSendMessage={sendMessage}
          onSpeechInput={handleSpeechInput}
          isLoading={isLoading}
          language={selectedLanguage}
          cefrLevel={selectedLevel}
        />
      </div>
    </div>
  );
}
