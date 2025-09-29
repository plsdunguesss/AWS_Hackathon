import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Bot, User, AlertTriangle, Heart, Clock, Mic, MicOff, MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface ChatPageProps {
  onBack: () => void;
}

type MessageType = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  suggestions?: string[];
  resources?: Array<{
    title: string;
    url: string;
    type: 'article' | 'exercise' | 'resource';
  }>;
}

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    type: 'system',
    content: 'Welcome to MindCare AI Assistant. This is a safe space to discuss your mental health.',
    timestamp: new Date(Date.now() - 5000)
  },
  {
    id: '2',
    type: 'assistant',
    content: "Hi there! I'm here to provide support and guidance for your mental health journey. How are you feeling today?",
    timestamp: new Date(Date.now() - 3000),
    suggestions: [
      "I'm feeling anxious about something",
      "I've been having trouble sleeping",
      "I'm feeling overwhelmed with work",
      "I just want to check in"
    ]
  }
];

const quickReplies = [
  "I'm feeling anxious",
  "I need coping strategies",
  "I'm having a tough day",
  "I want to practice mindfulness",
  "I need crisis support"
];

const aiResponses = {
  anxiety: {
    content: "I understand you're feeling anxious. That's a very common experience, and I'm here to help. Can you tell me more about what's making you feel anxious right now? Sometimes talking through it can help us identify patterns and coping strategies.",
    suggestions: [
      "It's about work stress",
      "I'm worried about relationships",
      "It's general anxiety",
      "I don't know what's causing it"
    ],
    resources: [
      { title: "5-4-3-2-1 Grounding Technique", url: "#", type: "exercise" as const },
      { title: "Understanding Anxiety", url: "#", type: "article" as const }
    ]
  },
  coping: {
    content: "Here are some evidence-based coping strategies that many people find helpful. Remember, different techniques work for different people, so it's worth trying a few to see what resonates with you.",
    suggestions: [
      "Tell me about breathing exercises",
      "I want to try mindfulness",
      "Physical exercise options",
      "Cognitive techniques"
    ],
    resources: [
      { title: "Progressive Muscle Relaxation", url: "#", type: "exercise" as const },
      { title: "Mindful Breathing Guide", url: "#", type: "exercise" as const },
      { title: "Cognitive Restructuring", url: "#", type: "article" as const }
    ]
  },
  tough_day: {
    content: "I'm sorry you're having a tough day. It takes courage to reach out when things are difficult. You're not alone in this, and it's okay to have challenging days. What's been the most difficult part of today for you?",
    suggestions: [
      "Everything feels overwhelming",
      "I feel isolated and alone",
      "I can't concentrate on anything",
      "I'm feeling really sad"
    ]
  },
  crisis: {
    content: "I'm concerned about your wellbeing. If you're having thoughts of self-harm or suicide, please reach out for immediate help. You can call 988 (Suicide Prevention Lifeline) or text HOME to 741741. Would you like me to provide more crisis resources?",
    suggestions: [
      "Yes, show me crisis resources",
      "I need to talk to someone now",
      "I'm safe, just need support",
      "Help me find professional help"
    ],
    resources: [
      { title: "Crisis Text Line", url: "#", type: "resource" as const },
      { title: "National Suicide Prevention Lifeline", url: "#", type: "resource" as const }
    ]
  }
};

export function ChatPage({ onBack }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase();
    let response = aiResponses.anxiety; // default

    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
      response = aiResponses.anxiety;
    } else if (lowerMessage.includes('coping') || lowerMessage.includes('strategies')) {
      response = aiResponses.coping;
    } else if (lowerMessage.includes('tough') || lowerMessage.includes('difficult') || lowerMessage.includes('hard')) {
      response = aiResponses.tough_day;
    } else if (lowerMessage.includes('crisis') || lowerMessage.includes('harm') || lowerMessage.includes('suicide')) {
      response = aiResponses.crisis;
    } else {
      // Generic supportive response
      response = {
        content: "Thank you for sharing that with me. I hear you, and your feelings are valid. Can you tell me more about what you're experiencing? I'm here to listen and support you.",
        suggestions: [
          "I need help with anxiety",
          "I want coping strategies",
          "I'm feeling depressed",
          "I need someone to talk to"
        ]
      };
    }

    return {
      id: Date.now().toString(),
      type: 'assistant',
      content: response.content,
      timestamp: new Date(),
      suggestions: response.suggestions,
      resources: response.resources
    };
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage);
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would handle speech-to-text
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">MindCare AI Assistant</h2>
                  <p className="text-sm text-muted-foreground">Online • Always here to help</p>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Crisis Alert */}
      <div className="container max-w-4xl mx-auto px-4 pt-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Crisis Support:</strong> If you're having thoughts of self-harm, call 988 immediately. 
            This AI assistant is not a replacement for professional care.
          </AlertDescription>
        </Alert>
      </div>

      {/* Messages */}
      <div className="flex-1 container max-w-4xl mx-auto px-4 py-4">
        <ScrollArea className="h-full">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.type !== 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className={message.type === 'system' ? 'bg-muted' : 'bg-primary text-primary-foreground'}>
                      {message.type === 'system' ? <AlertTriangle className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[80%] ${message.type === 'user' ? 'ml-auto' : ''}`}>
                  <Card className={`p-3 ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : message.type === 'system'
                      ? 'bg-muted'
                      : 'bg-card'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {message.timestamp && (
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </Card>

                  {/* Suggestions */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-2"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Resources */}
                  {message.resources && message.resources.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium">Helpful Resources:</p>
                      {message.resources.map((resource, index) => (
                        <Card key={index} className="p-2 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-2">
                            {resource.type === 'exercise' && <Heart className="h-4 w-4 text-green-600" />}
                            {resource.type === 'article' && <Clock className="h-4 w-4 text-blue-600" />}
                            {resource.type === 'resource' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                            <span className="text-sm">{resource.title}</span>
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {resource.type}
                            </Badge>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-secondary">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="p-3 bg-card">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Quick Replies */}
      <div className="container max-w-4xl mx-auto px-4 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickReplies.map((reply, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="whitespace-nowrap flex-shrink-0"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Input Area */}
      <div className="container max-w-4xl mx-auto px-4 py-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... (Press Enter to send)"
              className="pr-12 min-h-[44px] resize-none"
              rows={1}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 ${
                      isRecording ? 'text-red-600' : 'text-muted-foreground'
                    }`}
                    onClick={toggleRecording}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isRecording ? 'Stop recording' : 'Voice input'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="h-11 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          MindCare AI provides support but is not a replacement for professional care. 
          Always consult healthcare providers for medical advice.
        </p>
      </div>
    </div>
  );
}