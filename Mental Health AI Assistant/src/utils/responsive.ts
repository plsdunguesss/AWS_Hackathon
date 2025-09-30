import { useEffect, useState } from 'react';

// Breakpoint definitions matching Tailwind CSS defaults
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Hook to detect current screen size
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState<{
    width: number;
    height: number;
    breakpoint: Breakpoint | 'xs';
  }>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    breakpoint: 'xs'
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let breakpoint: Breakpoint | 'xs' = 'xs';
      
      if (width >= breakpoints['2xl']) {
        breakpoint = '2xl';
      } else if (width >= breakpoints.xl) {
        breakpoint = 'xl';
      } else if (width >= breakpoints.lg) {
        breakpoint = 'lg';
      } else if (width >= breakpoints.md) {
        breakpoint = 'md';
      } else if (width >= breakpoints.sm) {
        breakpoint = 'sm';
      }
      
      setScreenSize({ width, height, breakpoint });
    };

    handleResize(); // Set initial size
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

// Hook to check if screen is mobile
export function useIsMobile() {
  const { breakpoint } = useScreenSize();
  return breakpoint === 'xs' || breakpoint === 'sm';
}

// Hook to check if screen is tablet
export function useIsTablet() {
  const { breakpoint } = useScreenSize();
  return breakpoint === 'md';
}

// Hook to check if screen is desktop
export function useIsDesktop() {
  const { breakpoint } = useScreenSize();
  return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
}

// Utility function to get responsive classes
export function getResponsiveClasses(config: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}): string {
  const classes = [];
  
  if (config.base) classes.push(config.base);
  if (config.sm) classes.push(`sm:${config.sm}`);
  if (config.md) classes.push(`md:${config.md}`);
  if (config.lg) classes.push(`lg:${config.lg}`);
  if (config.xl) classes.push(`xl:${config.xl}`);
  if (config['2xl']) classes.push(`2xl:${config['2xl']}`);
  
  return classes.join(' ');
}

// Utility function to get responsive values
export function getResponsiveValue<T>(
  values: {
    base?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    '2xl'?: T;
  },
  currentBreakpoint: Breakpoint | 'xs'
): T | undefined {
  // Return the most specific value for the current breakpoint
  switch (currentBreakpoint) {
    case '2xl':
      return values['2xl'] ?? values.xl ?? values.lg ?? values.md ?? values.sm ?? values.base;
    case 'xl':
      return values.xl ?? values.lg ?? values.md ?? values.sm ?? values.base;
    case 'lg':
      return values.lg ?? values.md ?? values.sm ?? values.base;
    case 'md':
      return values.md ?? values.sm ?? values.base;
    case 'sm':
      return values.sm ?? values.base;
    default:
      return values.base;
  }
}

// Hook for responsive values
export function useResponsiveValue<T>(values: {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}): T | undefined {
  const { breakpoint } = useScreenSize();
  return getResponsiveValue(values, breakpoint);
}

// Utility for responsive grid columns
export function getResponsiveGridCols(config: {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}): string {
  const classes = [];
  
  if (config.base) classes.push(`grid-cols-${config.base}`);
  if (config.sm) classes.push(`sm:grid-cols-${config.sm}`);
  if (config.md) classes.push(`md:grid-cols-${config.md}`);
  if (config.lg) classes.push(`lg:grid-cols-${config.lg}`);
  if (config.xl) classes.push(`xl:grid-cols-${config.xl}`);
  if (config['2xl']) classes.push(`2xl:grid-cols-${config['2xl']}`);
  
  return classes.join(' ');
}

// Utility for responsive spacing
export function getResponsiveSpacing(config: {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}, type: 'p' | 'm' | 'px' | 'py' | 'mx' | 'my' | 'pt' | 'pb' | 'pl' | 'pr' | 'mt' | 'mb' | 'ml' | 'mr' = 'p'): string {
  const classes = [];
  
  if (config.base) classes.push(`${type}-${config.base}`);
  if (config.sm) classes.push(`sm:${type}-${config.sm}`);
  if (config.md) classes.push(`md:${type}-${config.md}`);
  if (config.lg) classes.push(`lg:${type}-${config.lg}`);
  if (config.xl) classes.push(`xl:${type}-${config.xl}`);
  if (config['2xl']) classes.push(`2xl:${type}-${config['2xl']}`);
  
  return classes.join(' ');
}

// Utility for responsive text sizes
export function getResponsiveTextSize(config: {
  base?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  xl?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  '2xl'?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
}): string {
  const classes = [];
  
  if (config.base) classes.push(`text-${config.base}`);
  if (config.sm) classes.push(`sm:text-${config.sm}`);
  if (config.md) classes.push(`md:text-${config.md}`);
  if (config.lg) classes.push(`lg:text-${config.lg}`);
  if (config.xl) classes.push(`xl:text-${config.xl}`);
  if (config['2xl']) classes.push(`2xl:text-${config['2xl']}`);
  
  return classes.join(' ');
}

// Touch and gesture utilities for mobile
export function useTouchGestures() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    return {
      isLeftSwipe,
      isRightSwipe,
      isUpSwipe,
      isDownSwipe,
      distanceX: Math.abs(distanceX),
      distanceY: Math.abs(distanceY)
    };
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    touchStart,
    touchEnd
  };
}

// Accessibility utilities for responsive design
export function getAccessibleTouchTarget(isMobile: boolean): string {
  // Ensure touch targets are at least 44px on mobile
  return isMobile ? 'min-h-[44px] min-w-[44px]' : '';
}

export function getAccessibleTextSize(isMobile: boolean): string {
  // Ensure text is readable on mobile devices
  return isMobile ? 'text-base' : 'text-sm';
}