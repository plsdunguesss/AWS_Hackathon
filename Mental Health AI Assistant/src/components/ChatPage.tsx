import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, AlertTriangle, Heart, Clock, Mic, MicOff, MoreHorizontal, Wifi, WifiOff } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
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

const quickReplies = [
  "I'm feeling anxious",
  "I need coping strategies",
  "I'm having a tough day",
  "I want to practice mindfulness",
  "I need crisis support"
];

export function ChatPage({ onBack }: ChatPageProps) {
  const { session, loading: sessionLoading, error: sessionError } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [currentRiskLevel, setCurrentRiskLevel] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<Date | null>(null);
  const [safetyMonitoringActive, setSafetyMonitoringActive] = useState(true);
  const [conversationRiskTrend, setConversationRiskTrend] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const safetyMonitorRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setApiError(null);
      if (session) {
        checkBackendHealth();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionStatus('disconnected');
      setApiError('You are currently offline. Messages will be sent when connection is restored.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [session]);

  // Backend health check
  const checkBackendHealth = useCallback(async () => {
    if (!session) return;

    try {
      const response = await apiService.checkHealth();
      if (response.success) {
        setConnectionStatus('connected');
        setApiError(null);
        setRetryCount(0);
      } else {
        setConnectionStatus('disconnected');
        setApiError('Backend service is unavailable. Please try again later.');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      setApiError('Unable to connect to the backend service.');
    }
  }, [session]);

  // Polling for new messages
  const pollForNewMessages = useCallback(async () => {
    if (!session || connectionStatus !== 'connected') return;

    try {
      const response = await apiService.getConversationHistory(session.id, 10);
      if (response.success && response.data?.messages) {
        const apiMessages = response.data.messages;
        
        // Check if there are new messages since last poll
        if (apiMessages.length > 0) {
          const latestMessage = apiMessages[0];
          const latestTimestamp = new Date(latestMessage.timestamp);
          
          if (!lastMessageTimestamp || latestTimestamp > lastMessageTimestamp) {
            // Convert API messages to ChatMessage format
            const chatMessages: ChatMessage[] = apiMessages.map(msg => ({
              id: msg.id,
              type: msg.sender as MessageType,
              content: msg.content,
              timestamp: new Date(msg.timestamp)
            }));
            
            // Only update if we have new messages
            setMessages(prev => {
              const existingIds = new Set(prev.map(m => m.id));
              const newMessages = chatMessages.filter(m => !existingIds.has(m.id));
              
              if (newMessages.length > 0) {
                return [...prev, ...newMessages].sort((a, b) => 
                  a.timestamp.getTime() - b.timestamp.getTime()
                );
              }
              return prev;
            });
            
            setLastMessageTimestamp(latestTimestamp);
          }
        }
      }
    } catch (error) {
      console.error('Error polling for messages:', error);
      // Don't show error for polling failures to avoid spam
    }
  }, [session, connectionStatus, lastMessageTimestamp]);

  // Load conversation history when session is ready
  useEffect(() => {
    if (session) {
      loadConversationHistory();
      checkBackendHealth();
    }
  }, [session, checkBackendHealth]);

  // Start health check interval
  useEffect(() => {
    if (session && isOnline) {
      healthCheckIntervalRef.current = setInterval(checkBackendHealth, 30000); // Check every 30 seconds
      
      return () => {
        if (healthCheckIntervalRef.current) {
          clearInterval(healthCheckIntervalRef.current);
        }
      };
    }
  }, [session, isOnline, checkBackendHealth]);

  // Start polling for new messages
  useEffect(() => {
    if (session && connectionStatus === 'connected') {
      pollingIntervalRef.current = setInterval(pollForNewMessages, 2000); // Poll every 2 seconds
      
      return () => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      };
    }
  }, [session, connectionStatus, pollForNewMessages]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
      if (safetyMonitorRef.current) {
        clearInterval(safetyMonitorRef.current);
      }
    };
  }, []);

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

  const handleSendMessage = async (retryAttempt = 0) => {
    if (!inputMessage.trim() || !session || isTyping) return;

    // Check network connectivity
    if (!isOnline) {
      setApiError('You are currently offline. Please check your internet connection.');
      return;
    }

    // Check backend connectivity
    if (connectionStatus === 'disconnected') {
      setApiError('Unable to connect to the service. Please try again later.');
      return;
    }

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
      // Send message to backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await apiService.sendMessage(session.id, messageContent);
      clearTimeout(timeoutId);
      
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

        // Update last message timestamp for polling
        setLastMessageTimestamp(new Date(aiResponse.timestamp));

        // Perform risk assessment with safety monitoring
        await performRiskAssessmentWithSafetyCheck(session.id, userMessage.id, userMessage.content);

        // Reset retry count on success
        setRetryCount(0);
        setConnectionStatus('connected');

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

        // Attempt retry for certain errors
        if (retryAttempt < 2 && (response.error?.includes('timeout') || response.error?.includes('network'))) {
          setTimeout(() => {
            setInputMessage(messageContent);
            handleSendMessage(retryAttempt + 1);
          }, 2000 * (retryAttempt + 1)); // Exponential backoff
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle different types of errors
      let errorMessage = 'Network error. Please check your connection.';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Unable to connect to the service. Please check your internet connection.';
          setConnectionStatus('disconnected');
        }
      }
      
      setApiError(errorMessage);
      setRetryCount(prev => prev + 1);
      
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

      // Attempt retry for network errors
      if (retryAttempt < 2 && retryCount < 3) {
        setTimeout(() => {
          setInputMessage(messageContent);
          handleSendMessage(retryAttempt + 1);
        }, 3000 * (retryAttempt + 1)); // Exponential backoff
      }
    } finally {
      setIsTyping(false);
    }
  };

  // Safety monitoring for conversation patterns
  const monitorConversationSafety = useCallback(() => {
    if (!safetyMonitoringActive || conversationRiskTrend.length < 3) return;

    const recentRisks = conversationRiskTrend.slice(-3);
    const isEscalating = recentRisks.every((risk, index) => 
      index === 0 || risk >= recentRisks[index - 1]
    );

    const averageRisk = recentRisks.reduce((sum, risk) => sum + risk, 0) / recentRisks.length;

    // Check for escalating risk pattern
    if (isEscalating && averageRisk > 60) {
      const escalationMessage: ChatMessage = {
        id: `escalation-warning-${Date.now()}`,
        type: 'system',
        content: "I've noticed our conversation has been touching on some increasingly difficult topics. I want to make sure you have the support you need. How are you feeling right now?",
        timestamp: new Date(),
        suggestions: [
          "I'm feeling overwhelmed",
          "I need someone to talk to",
          "I'm having thoughts of self-harm",
          "I'm okay, just processing things",
          "Show me crisis resources"
        ]
      };
      setMessages(prev => [...prev, escalationMessage]);
    }

    // Check for sustained high risk
    if (averageRisk > 80) {
      const sustainedRiskMessage: ChatMessage = {
        id: `sustained-risk-${Date.now()}`,
        type: 'system',
        content: "I'm consistently concerned about your wellbeing based on our conversation. Please consider reaching out to a mental health professional or crisis support service. Your safety is important.",
        timestamp: new Date(),
        requiresReferral: true,
        resources: [
          { title: "📞 988 Suicide & Crisis Lifeline", url: "https://988lifeline.org", type: "resource" as const },
          { title: "💬 Crisis Text Line - Text HOME to 741741", url: "https://crisistextline.org", type: "resource" as const },
          { title: "👥 Find a Mental Health Professional", url: "#", type: "resource" as const }
        ]
      };
      setMessages(prev => [...prev, sustainedRiskMessage]);
    }
  }, [safetyMonitoringActive, conversationRiskTrend]);

  // Start safety monitoring
  useEffect(() => {
    if (safetyMonitoringActive && session) {
      safetyMonitorRef.current = setInterval(monitorConversationSafety, 10000); // Check every 10 seconds
      
      return () => {
        if (safetyMonitorRef.current) {
          clearInterval(safetyMonitorRef.current);
        }
      };
    }
  }, [safetyMonitoringActive, session, monitorConversationSafety]);

  // Enhanced risk assessment with safety monitoring and crisis detection
  const performRiskAssessmentWithSafetyCheck = async (sessionId: string, messageId: string, content: string) => {
    try {
      const riskResponse = await apiService.assessRisk(sessionId, messageId, content);
      if (riskResponse.success && riskResponse.data?.assessment) {
        const { riskScore, requiresReferral } = riskResponse.data.assessment;
        setCurrentRiskLevel(riskScore.overallRisk);

        // Update conversation risk trend for safety monitoring
        setConversationRiskTrend(prev => {
          const updated = [...prev, riskScore.overallRisk];
          return updated.slice(-10); // Keep last 10 risk scores
        });

        // Immediate crisis detection - highest priority
        if (riskScore.overallRisk >= 95 || riskScore.indicators.suicidalIdeation > 80) {
          const immediateCrisisMessage: ChatMessage = {
            id: `immediate-crisis-${Date.now()}`,
            type: 'system',
            content: "🚨 **IMMEDIATE CRISIS SUPPORT NEEDED** 🚨\n\nI'm extremely concerned about your safety right now. Please reach out for immediate help - you don't have to face this alone.\n\n**If you're in immediate danger:**",
            timestamp: new Date(),
            requiresReferral: true,
            suggestions: [
              "🚨 Call 911 - Emergency Services",
              "📞 Call 988 - Suicide & Crisis Lifeline",
              "💬 Text HOME to 741741 - Crisis Text Line",
              "🏥 Go to nearest emergency room",
              "✅ I'm safe now, but need support"
            ],
            resources: [
              { title: "🚨 Emergency Services - Call 911", url: "#", type: "resource" as const },
              { title: "📞 988 Suicide & Crisis Lifeline", url: "https://988lifeline.org", type: "resource" as const },
              { title: "💬 Crisis Text Line - Text HOME to 741741", url: "https://crisistextline.org", type: "resource" as const },
              { title: "🏥 Find Nearest Emergency Room", url: "#", type: "resource" as const },
              { title: "📋 National Suicide Prevention Resources", url: "https://suicidepreventionlifeline.org", type: "resource" as const }
            ]
          };
          setMessages(prev => [...prev, immediateCrisisMessage]);
          
          // Add follow-up supportive message
          setTimeout(() => {
            const supportMessage: ChatMessage = {
              id: `support-${Date.now()}`,
              type: 'system',
              content: "Your life has value and meaning. Crisis support specialists are trained to help people through exactly what you're experiencing right now. Please reach out - help is available 24/7.",
              timestamp: new Date()
            };
            setMessages(prev => [...prev, supportMessage]);
          }, 2000);
          
        } else if (riskScore.indicators.suicidalIdeation > 60 || riskScore.indicators.selfHarmRisk > 70) {
          // High-risk crisis detection
          const crisisMessage: ChatMessage = {
            id: `crisis-${Date.now()}`,
            type: 'system',
            content: "⚠️ I'm very concerned about what you've shared. Your safety and wellbeing are the most important things right now. Please consider reaching out for professional support.",
            timestamp: new Date(),
            requiresReferral: true,
            suggestions: [
              "📞 Call 988 (Suicide & Crisis Lifeline)",
              "💬 Text HOME to 741741 (Crisis Text Line)",
              "🏥 I need immediate help",
              "👥 I want to talk to a professional",
              "✅ I'm safe, just need to talk"
            ],
            resources: [
              { title: "📞 988 Suicide & Crisis Lifeline", url: "https://988lifeline.org", type: "resource" as const },
              { title: "💬 Crisis Text Line - Text HOME to 741741", url: "https://crisistextline.org", type: "resource" as const },
              { title: "🏥 Emergency Services - Call 911", url: "#", type: "resource" as const },
              { title: "👥 Find a Mental Health Professional", url: "#", type: "resource" as const },
              { title: "📚 Mental Health Resources", url: "#", type: "resource" as const }
            ]
          };
          setMessages(prev => [...prev, crisisMessage]);
          
        } else if (requiresReferral || riskScore.overallRisk >= 85) {
          // Standard referral for elevated risk
          const referralMessage: ChatMessage = {
            id: `referral-${Date.now()}`,
            type: 'system',
            content: "Based on our conversation, I'm concerned about your wellbeing. Speaking with a mental health professional could provide you with additional support and coping strategies. Would you like help finding resources?",
            timestamp: new Date(),
            requiresReferral: true,
            suggestions: [
              "👥 Yes, show me professional resources",
              "📞 I need crisis support now",
              "✅ I'm safe, just need to talk",
              "🔍 Help me find a therapist",
              "📚 Show me self-help resources"
            ],
            resources: [
              { title: "👥 Find a Mental Health Professional", url: "#", type: "resource" as const },
              { title: "📞 Crisis Text Line - Text HOME to 741741", url: "https://crisistextline.org", type: "resource" as const },
              { title: "📞 National Suicide Prevention Lifeline - 988", url: "https://988lifeline.org", type: "resource" as const },
              { title: "📚 Mental Health America Resources", url: "https://mhanational.org", type: "resource" as const },
              { title: "🧘 Crisis Coping Strategies", url: "#", type: "article" as const }
            ]
          };
          setMessages(prev => [...prev, referralMessage]);
        }

        // Additional safety monitoring for concerning patterns
        if (riskScore.indicators.depressionMarkers > 80 && riskScore.indicators.socialIsolation > 70) {
          setTimeout(() => {
            const supportMessage: ChatMessage = {
              id: `support-pattern-${Date.now()}`,
              type: 'system',
              content: "I notice you might be feeling isolated and struggling with difficult emotions. Remember that reaching out for support is a sign of strength, not weakness. You don't have to go through this alone.",
              timestamp: new Date(),
              suggestions: [
                "💬 Tell me more about how you're feeling",
                "🤝 I'd like support connecting with others",
                "📞 Show me crisis resources",
                "🧘 Help me with coping strategies"
              ]
            };
            setMessages(prev => [...prev, supportMessage]);
          }, 3000);
        }
      }
    } catch (riskError) {
      console.error('Risk assessment failed:', riskError);
      
      // Fallback safety message if risk assessment fails
      const fallbackSafetyMessage: ChatMessage = {
        id: `safety-fallback-${Date.now()}`,
        type: 'system',
        content: "I want to make sure you have access to support resources. If you're experiencing thoughts of self-harm or suicide, please reach out for help immediately.",
        timestamp: new Date(),
        resources: [
          { title: "📞 988 Suicide & Crisis Lifeline", url: "https://988lifeline.org", type: "resource" as const },
          { title: "💬 Crisis Text Line - Text HOME to 741741", url: "https://crisistextline.org", type: "resource" as const },
          { title: "🚨 Emergency Services - Call 911", url: "#", type: "resource" as const }
        ]
      };
      setMessages(prev => [...prev, fallbackSafetyMessage]);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Handle crisis-specific suggestions
    if (suggestion.includes('Call 911') || suggestion.includes('🚨')) {
      // Show immediate crisis support
      const emergencyMessage: ChatMessage = {
        id: `emergency-guidance-${Date.now()}`,
        type: 'system',
        content: "🚨 **EMERGENCY GUIDANCE** 🚨\n\nIf you're in immediate danger:\n• Call 911 immediately\n• Go to your nearest emergency room\n• Call 988 for crisis support\n\nYour safety is the top priority. Emergency responders are trained to help.",
        timestamp: new Date(),
        resources: [
          { title: "🚨 Call 911 - Emergency Services", url: "tel:911", type: "resource" as const },
          { title: "📞 Call 988 - Crisis Lifeline", url: "tel:988", type: "resource" as const }
        ]
      };
      setMessages(prev => [...prev, emergencyMessage]);
      return;
    }

    if (suggestion.includes('988') || suggestion.includes('Crisis Lifeline')) {
      const crisisGuidanceMessage: ChatMessage = {
        id: `crisis-guidance-${Date.now()}`,
        type: 'system',
        content: "📞 **988 Suicide & Crisis Lifeline**\n\nYou can call or chat 24/7 with trained crisis counselors who can:\n• Provide immediate support\n• Help you through a crisis\n• Connect you with local resources\n• Just listen when you need someone to talk to\n\n**Call: 988** or visit 988lifeline.org to chat online.",
        timestamp: new Date(),
        resources: [
          { title: "📞 Call 988 Now", url: "tel:988", type: "resource" as const },
          { title: "💬 Chat Online at 988lifeline.org", url: "https://988lifeline.org", type: "resource" as const }
        ]
      };
      setMessages(prev => [...prev, crisisGuidanceMessage]);
      return;
    }

    if (suggestion.includes('741741') || suggestion.includes('Crisis Text Line')) {
      const textCrisisMessage: ChatMessage = {
        id: `text-crisis-guidance-${Date.now()}`,
        type: 'system',
        content: "💬 **Crisis Text Line**\n\nText **HOME** to **741741** to connect with a trained crisis counselor.\n\n• Available 24/7\n• Free and confidential\n• Text-based support\n• Trained volunteers ready to help\n\nJust text HOME to 741741 to start a conversation.",
        timestamp: new Date(),
        resources: [
          { title: "💬 Text HOME to 741741", url: "sms:741741?body=HOME", type: "resource" as const },
          { title: "Learn More at crisistextline.org", url: "https://crisistextline.org", type: "resource" as const }
        ]
      };
      setMessages(prev => [...prev, textCrisisMessage]);
      return;
    }

    // For other suggestions, add to input
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleResourceClick = (resource: { title: string; url: string; type: string }) => {
    if (resource.url.startsWith('tel:')) {
      // For phone numbers, show confirmation
      const confirmMessage: ChatMessage = {
        id: `call-confirm-${Date.now()}`,
        type: 'system',
        content: `Ready to call ${resource.title}?\n\nClick the link below to make the call, or dial the number directly from your phone.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMessage]);
    } else if (resource.url.startsWith('sms:')) {
      // For text messages, show guidance
      const textMessage: ChatMessage = {
        id: `text-guidance-${Date.now()}`,
        type: 'system',
        content: `To text Crisis Text Line:\n\n1. Open your text messaging app\n2. Text **HOME** to **741741**\n3. A trained counselor will respond\n\nOr click the link below if your device supports it.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, textMessage]);
    }
    
    // Open the resource link
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

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would handle speech-to-text
  };

  // Show loading state while session is initializing
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-lg font-medium">Initializing MindCare AI...</p>
          <p className="text-sm text-muted-foreground">Setting up your secure session</p>
        </div>
      </div>
    );
  }

  // Show error state if session failed to initialize
  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-lg font-medium mb-2">Connection Error</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {sessionError || 'Unable to connect to MindCare AI. Please check that the backend server is running.'}
          </p>
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Chat Header */}
      <div className="border-b bg-card mb-4">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium">MindCare AI Assistant</h2>
                <div className="flex items-center gap-2">
                  {connectionStatus === 'connected' && isOnline && (
                    <>
                      <Wifi className="h-3 w-3 text-green-600" />
                      <p className="text-sm text-green-600">Connected • Always here to help</p>
                    </>
                  )}
                  {connectionStatus === 'connecting' && (
                    <>
                      <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse" />
                      <p className="text-sm text-yellow-600">Connecting...</p>
                    </>
                  )}
                  {(connectionStatus === 'disconnected' || !isOnline) && (
                    <>
                      <WifiOff className="h-3 w-3 text-red-600" />
                      <p className="text-sm text-red-600">
                        {!isOnline ? 'Offline' : 'Connection issues'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {safetyMonitoringActive && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <Heart className="h-3 w-3 mr-1" />
                        Safety Active
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Continuous safety monitoring is active</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              {currentRiskLevel > 0 && (
                <Badge variant={currentRiskLevel >= 85 ? "destructive" : currentRiskLevel >= 50 ? "secondary" : "outline"}>
                  Risk: {currentRiskLevel}%
                </Badge>
              )}
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Crisis Alert */}
      <div className="px-4 pt-4">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Crisis Support:</strong> If you're having thoughts of self-harm, call 988 immediately. 
            This AI assistant is not a replacement for professional care.
          </AlertDescription>
        </Alert>
        
        {/* API Error Alert */}
        {apiError && (
          <Alert className="border-orange-200 bg-orange-50 mt-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <strong>Connection Issue:</strong> {apiError}
                  {retryCount > 0 && (
                    <span className="block text-sm mt-1">
                      Retry attempts: {retryCount}/3
                    </span>
                  )}
                </div>
                {connectionStatus === 'disconnected' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkBackendHealth}
                    className="ml-2"
                  >
                    Retry Connection
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4">
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
                      ? message.requiresReferral 
                        ? 'bg-red-50 border-red-200'
                        : 'bg-muted'
                      : 'bg-card'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    
                    {message.riskScore && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <p className="font-medium">Risk Assessment:</p>
                        <p>Overall Risk: {message.riskScore.overallRisk}%</p>
                        {message.riskScore.recommendsProfessionalHelp && (
                          <p className="text-red-600 font-medium">Professional help recommended</p>
                        )}
                      </div>
                    )}
                    
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
                        <Card 
                          key={index} 
                          className="p-2 hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-blue-500"
                          onClick={() => handleResourceClick(resource)}
                        >
                          <div className="flex items-center gap-2">
                            {resource.type === 'exercise' && <Heart className="h-4 w-4 text-green-600" />}
                            {resource.type === 'article' && <Clock className="h-4 w-4 text-blue-600" />}
                            {resource.type === 'resource' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                            <span className="text-sm font-medium">{resource.title}</span>
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
      <div className="px-4 pb-2">
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
      <div className="px-4 py-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here... (Press Enter to send)"
              className="pr-12 min-h-[44px]"
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
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isTyping || !isOnline || connectionStatus === 'disconnected'}
            className="h-11 px-4"
          >
            {isTyping ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span className="text-xs">Sending...</span>
              </div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            MindCare AI provides support but is not a replacement for professional care.
          </p>
          <div className="flex items-center gap-1 text-xs">
            {connectionStatus === 'connected' && isOnline ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-green-600">Online</span>
              </>
            ) : connectionStatus === 'connecting' ? (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                <span className="text-yellow-600">Connecting</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-red-600">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}