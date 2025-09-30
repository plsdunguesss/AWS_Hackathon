import { Brain, Heart, MessageCircle, BarChart3, Settings, TrendingUp, Users, Shield } from 'lucide-react';
import { LoadingSpinner, CardSkeleton, ListItemSkeleton, ChartSkeleton } from './loading-spinner';
import { Card } from './card';

interface PageLoaderProps {
  type?: 'chat' | 'dashboard' | 'progress' | 'settings' | 'assessment' | 'default';
  text?: string;
  subText?: string;
}

export function PageLoader({ type = 'default', text, subText }: PageLoaderProps) {
  const getLoaderConfig = () => {
    switch (type) {
      case 'chat':
        return {
          icon: MessageCircle,
          defaultText: 'Connecting to AI Assistant...',
          defaultSubText: 'Setting up your secure conversation',
          variant: 'chat' as const,
        };
      case 'dashboard':
        return {
          icon: BarChart3,
          defaultText: 'Loading your dashboard...',
          defaultSubText: 'Gathering your latest progress data',
          variant: 'analytics' as const,
        };
      case 'progress':
        return {
          icon: TrendingUp,
          defaultText: 'Analyzing your progress...',
          defaultSubText: 'Processing your mental health journey data',
          variant: 'progress' as const,
        };
      case 'settings':
        return {
          icon: Settings,
          defaultText: 'Loading your settings...',
          defaultSubText: 'Retrieving your profile and preferences',
          variant: 'settings' as const,
        };
      case 'assessment':
        return {
          icon: Brain,
          defaultText: 'Preparing assessment...',
          defaultSubText: 'Setting up your mental health evaluation',
          variant: 'brain' as const,
        };
      default:
        return {
          icon: Heart,
          defaultText: 'Loading...',
          defaultSubText: 'Please wait while we prepare your experience',
          variant: 'heart' as const,
        };
    }
  };

  const config = getLoaderConfig();

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center">
      <LoadingSpinner 
        size="xl" 
        text={text || config.defaultText} 
        subText={subText || config.defaultSubText} 
        variant={config.variant}
      />
    </div>
  );
}

// Skeleton loaders for different page types
export function DashboardSkeleton() {
  return (
    <div className="bg-muted/30">
      {/* Header skeleton */}
      <div className="border-b bg-card mb-6">
        <div className="px-4 py-4">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-64"></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 space-y-6">
        {/* Quick actions skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Main content skeleton */}
        <div className="grid lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header skeleton */}
      <div className="border-b bg-card p-4">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-10 h-10 bg-muted rounded-full"></div>
          <div>
            <div className="h-4 bg-muted rounded w-32 mb-1"></div>
            <div className="h-3 bg-muted rounded w-24"></div>
          </div>
        </div>
      </div>

      {/* Messages skeleton */}
      <div className="flex-1 p-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input skeleton */}
      <div className="border-t bg-card p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="bg-muted/30">
      {/* Header skeleton */}
      <div className="border-b bg-card mb-6">
        <div className="px-4 py-4">
          <div className="animate-pulse flex items-center justify-between">
            <div>
              <div className="h-6 bg-muted rounded w-48 mb-2"></div>
              <div className="h-4 bg-muted rounded w-64"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-muted rounded w-24"></div>
              <div className="h-8 bg-muted rounded w-8"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 space-y-6">
        {/* Metrics skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>

        {/* Chart skeleton */}
        <ChartSkeleton />

        {/* Insights skeleton */}
        <div className="grid lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <div className="bg-muted/30">
      {/* Header skeleton */}
      <div className="border-b bg-card mb-6">
        <div className="px-4 py-4">
          <div className="animate-pulse">
            <div className="h-6 bg-muted rounded w-32 mb-2"></div>
            <div className="h-4 bg-muted rounded w-48"></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">
        {/* Tabs skeleton */}
        <div className="animate-pulse mb-6">
          <div className="flex gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded w-20"></div>
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-5 bg-muted rounded w-40"></div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Generic content skeleton
export function ContentSkeleton({ 
  rows = 3, 
  showHeader = true,
  showActions = false 
}: { 
  rows?: number; 
  showHeader?: boolean;
  showActions?: boolean;
}) {
  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>
      )}
      
      {showActions && (
        <div className="animate-pulse flex gap-2 mb-4">
          <div className="h-8 bg-muted rounded w-20"></div>
          <div className="h-8 bg-muted rounded w-24"></div>
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}