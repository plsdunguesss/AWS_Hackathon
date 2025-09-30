import { ChevronRight, Home } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigation } from '../contexts/NavigationContext';
import { useNavigate } from 'react-router-dom';

export function BreadcrumbNavigation() {
  const { breadcrumbs } = useNavigation();
  const navigate = useNavigate();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="h-auto p-1 hover:text-foreground"
      >
        <Home className="h-4 w-4" />
      </Button>
      
      {breadcrumbs.map((item, index) => (
        <div key={item.path} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(item.path)}
            className={`h-auto p-1 ${
              index === breadcrumbs.length - 1 
                ? 'text-foreground font-medium' 
                : 'hover:text-foreground'
            }`}
            disabled={index === breadcrumbs.length - 1}
          >
            {item.label}
          </Button>
        </div>
      ))}
    </nav>
  );
}