import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, ArrowLeft, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface ChatPageProps {
  onBack: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
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
    timestamp: new Date()
  }
];

export function ChatPageDirect({ onBack }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages());
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const messageContent = inputMessage.trim();
    console.log('Sending message:', messageContent);
    setInputMessage("");
    setIsTyping(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: messageContent,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send message directly to AI using test endpoint
      const response = await fetch('http://localhost:5000/api/conversation/test-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('AI Response received:', data);
        
        // Add AI response
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          type: 'assistant',
          content: data.aiResponse || "I'm here to help you. Can you tell me more about how you're feeling?",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Chat API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Backend connection failed`);
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Add fallback response
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: "I'm having trouble connecting right now, but I'm here to listen. Your feelings are valid and important. If you're in crisis, please contact emergency services or call 988.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
                        <Bot className="h-4 w-4" />
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