import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function ResponsiveContainer({ 
  children, 
  className = "",
  maxWidth = '6xl',
  padding = 'md'
}: ResponsiveContainerProps) {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'xl': return 'max-w-xl';
      case '2xl': return 'max-w-2xl';
      case '4xl': return 'max-w-4xl';
      case '6xl': return 'max-w-6xl';
      default: return 'max-w-6xl';
    }
  };

  const getPaddingClass = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'px-2 py-2';
      case 'md': return 'px-4 py-4';
      case 'lg': return 'px-6 py-6';
      default: return 'px-4 py-4';
    }
  };

  return (
    <div className={cn(
      'container mx-auto w-full',
      getMaxWidthClass(),
      getPaddingClass(),
      className
    )}>
      {children}
    </div>
  );
}