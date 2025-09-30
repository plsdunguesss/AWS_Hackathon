import { CheckCircle, Heart, Star, Trophy, Zap } from 'lucide-react';
import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { Card } from './card';
import { Badge } from './badge';
import { cn } from '../../lib/utils';

interface SuccessFeedbackProps {
  type?: 'default' | 'mood' | 'achievement' | 'milestone' | 'connection';
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  showIcon?: boolean;
  autoHide?: boolean;
  duration?: number;
}

export function SuccessFeedback({
  type = 'default',
  title,
  message,
  action,
  className,
  showIcon = true,
  autoHide = false,
  duration = 3000,
}: SuccessFeedbackProps) {
  const getConfig = () => {
    switch (type) {
      case 'mood':
        return {
          icon: Heart,
          color: 'border-green-200 bg-green-50',
          iconColor: 'text-green-600',
          textColor: 'text-green-800',
          defaultTitle: 'Mood Saved',
        };
      case 'achievement':
        return {
          icon: Trophy,
          color: 'border-yellow-200 bg-yellow-50',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800',
          defaultTitle: 'Achievement Unlocked!',
        };
      case 'milestone':
        return {
          icon: Star,
          color: 'border-purple-200 bg-purple-50',
          iconColor: 'text-purple-600',
          textColor: 'text-purple-800',
          defaultTitle: 'Milestone Reached!',
        };
      case 'connection':
        return {
          icon: Zap,
          color: 'border-blue-200 bg-blue-50',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-800',
          defaultTitle: 'Connected',
        };
      default:
        return {
          icon: CheckCircle,
          color: 'border-green-200 bg-green-50',
          iconColor: 'text-green-600',
          textColor: 'text-green-800',
          defaultTitle: 'Success',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Alert className={cn(config.color, className)}>
      {showIcon && <Icon className={cn('h-4 w-4', config.iconColor)} />}
      <AlertDescription className={config.textColor}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {(title || config.defaultTitle) && (
              <strong className="block mb-1">{title || config.defaultTitle}</strong>
            )}
            <span>{message}</span>
          </div>
          {action && (
            <Button
              size="sm"
              variant="outline"
              onClick={action.onClick}
              className="ml-4 text-xs"
            >
              {action.label}
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

// Inline success message
export function InlineSuccess({ 
  message, 
  className 
}: { 
  message: string; 
  className?: string; 
}) {
  return (
    <div className={cn('flex items-center gap-2 text-green-600', className)}>
      <CheckCircle className="h-4 w-4" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

// Success card for major achievements
export function SuccessCard({
  title,
  description,
  icon: IconComponent,
  badge,
  actions,
  className,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  }>;
  className?: string;
}) {
  const Icon = IconComponent || Trophy;

  return (
    <Card className={cn('p-6 text-center', className)}>
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-green-600" />
      </div>
      
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      
      {badge && (
        <Badge className="mb-4">{badge}</Badge>
      )}
      
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.onClick}
              size="sm"
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </Card>
  );
}

// Progress success indicator
export function ProgressSuccess({
  current,
  total,
  label,
  celebrateOnComplete = true,
}: {
  current: number;
  total: number;
  label: string;
  celebrateOnComplete?: boolean;
}) {
  const percentage = Math.round((current / total) * 100);
  const isComplete = current >= total;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {current}/{total}
        </span>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-500',
            isComplete ? 'bg-green-500' : 'bg-primary'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {isComplete && celebrateOnComplete && (
        <div className="flex items-center gap-2 text-green-600 mt-2">
          <Trophy className="h-4 w-4" />
          <span className="text-sm font-medium">Complete!</span>
        </div>
      )}
    </div>
  );
}

// Streak success indicator
export function StreakSuccess({
  days,
  type = 'check-in',
  showCelebration = true,
}: {
  days: number;
  type?: string;
  showCelebration?: boolean;
}) {
  const milestones = [7, 14, 30, 60, 90, 180, 365];
  const nextMilestone = milestones.find(m => m > days);
  const isMilestone = milestones.includes(days);

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Zap className={cn(
          'h-5 w-5',
          isMilestone ? 'text-yellow-500' : 'text-orange-500'
        )} />
        <span className="text-2xl font-bold">{days}</span>
        <span className="text-muted-foreground">day streak</span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-2">
        {type} streak going strong!
      </p>
      
      {isMilestone && showCelebration && (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          🎉 {days}-Day Milestone!
        </Badge>
      )}
      
      {nextMilestone && (
        <p className="text-xs text-muted-foreground mt-2">
          {nextMilestone - days} days until {nextMilestone}-day milestone
        </p>
      )}
    </div>
  );
}