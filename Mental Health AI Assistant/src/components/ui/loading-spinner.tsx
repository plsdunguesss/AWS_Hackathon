import { Loader2, Brain, Heart, MessageCircle, BarChart3, Settings, TrendingUp } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  subText?: string;
  variant?: 'default' | 'brain' | 'heart' | 'chat' | 'analytics' | 'settings' | 'progress';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

const iconMap = {
  default: Loader2,
  brain: Brain,
  heart: Heart,
  chat: MessageCircle,
  analytics: BarChart3,
  settings: Settings,
  progress: TrendingUp,
};

export function LoadingSpinner({ 
  size = 'md', 
  className, 
  text, 
  subText, 
  variant = 'default' 
}: LoadingSpinnerProps) {
  const Icon = iconMap[variant];
  const spinClass = variant === 'default' ? 'animate-spin' : 'animate-pulse';

  if (text || subText) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3">
        <Icon className={cn(sizeClasses[size], 'text-primary', spinClass, className)} />
        {text && <p className="text-lg font-medium text-center">{text}</p>}
        {subText && <p className="text-sm text-muted-foreground text-center">{subText}</p>}
      </div>
    );
  }

  return (
    <Icon className={cn(sizeClasses[size], 'text-primary', spinClass, className)} />
  );
}

// Full page loading component
export function PageLoader({ 
  text = 'Loading...', 
  subText,
  variant = 'default' 
}: Omit<LoadingSpinnerProps, 'size' | 'className'>) {
  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center">
      <LoadingSpinner 
        size="xl" 
        text={text} 
        subText={subText} 
        variant={variant}
      />
    </div>
  );
}

// Inline loading component
export function InlineLoader({ 
  text = 'Loading...', 
  size = 'sm' 
}: Pick<LoadingSpinnerProps, 'text' | 'size'>) {
  return (
    <div className="flex items-center space-x-2">
      <LoadingSpinner size={size} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

// Card loading skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-muted rounded-lg p-6 space-y-4">
        <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-muted-foreground/20 rounded"></div>
          <div className="h-3 bg-muted-foreground/20 rounded w-5/6"></div>
        </div>
        <div className="h-8 bg-muted-foreground/20 rounded w-1/3"></div>
      </div>
    </div>
  );
}

// List item skeleton
export function ListItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse flex items-center space-x-4">
          <div className="w-10 h-10 bg-muted rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-muted rounded-lg p-6">
        <div className="h-4 bg-muted-foreground/20 rounded w-1/3 mb-4"></div>
        <div className="h-48 bg-muted-foreground/20 rounded"></div>
      </div>
    </div>
  );
}