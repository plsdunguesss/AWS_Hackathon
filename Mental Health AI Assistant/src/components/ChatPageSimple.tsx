import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertTriangle, Heart, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { useSession } from "../hooks/useSession";
import { apiService, RiskScore } from "../services/api";

interface ChatPageProps {
  onBack: () => void;
}

type MessageType = 'user' | 'assistant' | 'system';

interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  riskScore?: RiskScore;
  requiresReferral?: boolean;
  suggestions?: string[];
  resources?: Array<{
    title: string;
    url: string;
    type: 'article' | 'exercise' | 'resource';
  }>;
}

const getInitialMessages = (): ChatMessage[] => [
  {
    id: 'welcome',
    type: 'system',
    content: 'Welcome to MindCare AI Assistant. This is a safe space to discuss your mental health.',
    timestamp: new Date()
  },
  {
    id: 'greeting',
    type: 'assistant',
    content: "Hi there! I'm here to provide support and guidance for your mental health journey. How are you feeling today?",
    timestamp: new Date(),
    suggestions: [
      "I'm feeling anxious about something",
      "I've been having trouble sleeping",
      "I'm feeling overwhelmed with work",
      "I just want to check in"
    ]
  }
];

export function ChatPageSimple({ onBack }: ChatPageProps) {
  const { session, loading: sessionLoading, error: sessionError } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages());
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentRiskLevel, setCurrentRiskLevel] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation history when session is ready
  useEffect(() => {
    if (session) {
      loadConversationHistory();
    }
  }, [session]);

  const loadConversationHistory = async () => {
    if (!session) return;

    try {
      const response = await apiService.getConversationHistory(session.id);
      if (response.success && response.data?.messages) {
        const apiMessages = response.data.messages;
        
        if (apiMessages.length === 0) {
          // No existing conversation, show initial messages
          setMessages(getInitialMessages());
        } else {
          // Convert API messages to ChatMessage format
          const chatMessages: ChatMessage[] = apiMessages.map(msg => ({
            id: msg.id,
            type: msg.sender as MessageType,
            content: msg.content,
            timestamp: new Date(msg.timestamp)
          }));
          setMessages(chatMessages);
        }
      } else {
        setApiError(response.error || 'Failed to load conversation history');
        setMessages(getInitialMessages());
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
      setApiError('Failed to load conversation history');
      setMessages(getInitialMessages());
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session || isTyping) return;

    const messageContent = inputMessage.trim();
    setInputMessage("");
    setIsTyping(true);
    setApiError(null);

    // Add user message immediately for better UX
    const tempUserMessage: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, tempUserMessage]);

    try {
      const response = await apiService.sendMessage(session.id, messageContent);
      
      if (response.success && response.data?.conversation) {
        const { userMessage, aiResponse } = response.data.conversation;
        
        // Replace temp message with real messages
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMessage.id);
          const newMessages: ChatMessage[] = [
            {
              id: userMessage.id,
              type: 'user',
              content: userMessage.content,
              timestamp: new Date(userMessage.timestamp)
            },
            {
              id: aiResponse.id,
              type: 'assistant',
              content: aiResponse.content,
              timestamp: new Date(aiResponse.timestamp)
            }
          ];
          return [...filtered, ...newMessages];
        });

        // Perform risk assessment
        await performRiskAssessment(session.id, userMessage.id, userMessage.content);

      } else {
        // Handle API error response
        const errorMsg = response.error || 'Failed to send message';
        setApiError(errorMsg);
        
        // Replace temp message with error state
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMessage.id);
          const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            type: 'user',
            content: messageContent,
            timestamp: new Date()
          };
          const errorMsg: ChatMessage = {
            id: `error-${Date.now()}`,
            type: 'system',
            content: "I'm having trouble processing your message right now. Please try again in a moment. If you're in crisis, please contact emergency services or call 988.",
            timestamp: new Date()
          };
          return [...filtered, userMsg, errorMsg];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Network error. Please check your connection.';
      setApiError(errorMessage);
      
      // Replace temp message with error state
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== tempUserMessage.id);
        const userMsg: ChatMessage = {
          id: `user-${Date.now()}`,
          type: 'user',
          content: messageContent,
          timestamp: new Date()
        };
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          type: 'system',
          content: "I'm having trouble connecting right now. Please try again in a moment. If you're in crisis, please contact emergency services or call 988.",
          timestamp: new Date()
        };
        return [...filtered, userMsg, errorMsg];
      });
    } finally {
      setIsTyping(false);
    }
  };

  const performRiskAssessment = async (sessionId: string, messageId: string, content: string) => {
    try {
      const riskResponse = await apiService.assessRisk(sessionId, messageId, content);
      if (riskResponse.success && riskResponse.data?.assessment) {
        const { riskScore, requiresReferral } = riskResponse.data.assessment;
        setCurrentRiskLevel(riskScore.overallRisk);

        // Handle high-risk situations
        if (riskScore.overallRisk >= 85 || requiresReferral) {
          const referralMessage: ChatMessage = {
            id: `referral-${Date.now()}`,
            type: 'system',
            content: "Based on our conversation, I'm concerned about your wellbeing. Speaking with a mental health professional could provide you with additional support. Would you like help finding resources?",
            timestamp: new Date(),
            requiresReferral: true,
            resources: [
              { title: "📞 988 Suicide & Crisis Lifeline", url: "https://988lifeline.org", type: "resource" as const },
              { title: "💬 Crisis Text Line - Text HOME to 741741", url: "https://crisistextline.org", type: "resource" as const },
              { title: "👥 Find a Mental Health Professional", url: "#", type: "resource" as const }
            ]
          };
          setMessages(prev => [...prev, referralMessage]);
        }
      }
    } catch (riskError) {
      console.error('Risk assessment failed:', riskError);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleResourceClick = (resource: { title: string; url: string; type: string }) => {
    if (resource.url !== '#') {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show loading state while session is initializing
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Starting your session...</p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 max-w-md">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Session Error</h3>
            <p className="text-muted-foreground mb-4">{sessionError}</p>
            <Button onClick={onBack}>Go Back</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">MindCare AI Assistant</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentRiskLevel > 0 && (
                <Badge variant={currentRiskLevel > 70 ? "destructive" : currentRiskLevel > 40 ? "secondary" : "default"}>
                  Risk Level: {currentRiskLevel.toFixed(0)}%
                </Badge>
              )}
              <Badge variant="outline">Session Active</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex flex-col h-[calc(100vh-200px)]">
          {/* Messages */}
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type !== 'user' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>
                        {message.type === 'assistant' ? <Bot className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                    <Card className={`p-3 ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : message.type === 'system'
                        ? 'bg-muted'
                        : 'bg-card'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      
                      {/* Suggestions */}
                      {message.suggestions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="text-xs"
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {/* Resources */}
                      {message.resources && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium">Resources:</p>
                          {message.resources.map((resource, index) => (
                            <Button
                              key={index}
                              variant="link"
                              size="sm"
                              onClick={() => handleResourceClick(resource)}
                              className="text-xs p-0 h-auto justify-start"
                            >
                              {resource.title}
                            </Button>
                          ))}
                        </div>
                      )}
                    </Card>
                    
                    <p className="text-xs text-muted-foreground mt-1 px-3">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  
                  {message.type === 'user' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback>
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

          {/* Error Alert */}
          {apiError && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          {/* Input Area */}
          <div className="border-t pt-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                disabled={isTyping}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || isTyping}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-2 text-center">
              This AI assistant provides support but is not a replacement for professional mental health care.
              In crisis situations, please contact emergency services or call 988.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}