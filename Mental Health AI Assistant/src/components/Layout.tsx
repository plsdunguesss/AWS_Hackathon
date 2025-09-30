import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { MobileNavigation } from './ui/mobile-navigation';
import { ResponsiveContainer } from './ui/responsive-container';
import { useNavigation } from '../contexts/NavigationContext';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
  backPath?: string;
  onBack?: () => void;
  title?: string;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl';
}

export function Layout({ 
  children, 
  showBackButton = true, 
  backPath,
  onBack,
  title,
  className = "",
  maxWidth = '6xl'
}: LayoutProps) {
  const { canGoBack, goBack } = useNavigation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    } else if (canGoBack) {
      goBack();
    } else {
      navigate('/');
    }
  };


  
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <ResponsiveContainer maxWidth={maxWidth} padding="md">
        {/* Mobile and Desktop Header */}
        {showBackButton && (
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <MobileNavigation className="ml-2" />
            </div>
            
            {title && (
              <h1 className="text-lg md:text-2xl font-bold text-center flex-1 mx-4">
                {title}
              </h1>
            )}
            
            <div className="w-16 md:w-20" /> {/* Spacer for balance */}
          </div>
        )}
        
        <BreadcrumbNavigation />
        
        <div className="mt-4 md:mt-6">
          {children}
        </div>
      </ResponsiveContainer>
    </div>
  );
}