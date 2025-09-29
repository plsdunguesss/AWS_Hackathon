import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
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
  
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <div className={`container ${getMaxWidthClass()} mx-auto px-4 py-6`}>
        {showBackButton && (
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {title && (
              <h1 className="text-2xl font-bold text-center flex-1 mr-16">
                {title}
              </h1>
            )}
          </div>
        )}
        
        <BreadcrumbNavigation />
        
        {children}
      </div>
    </div>
  );
}