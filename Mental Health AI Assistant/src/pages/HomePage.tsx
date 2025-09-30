import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { UXEnhancements } from '../components/ui/ux-enhancements';
import { SafetyMonitor } from '../components/ui/safety-monitor';
import { useNavigation } from '../contexts/NavigationContext';

export function HomePage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();

  useEffect(() => {
    setBreadcrumbs([{ label: 'Home', path: '/' }]);
  }, [setBreadcrumbs]);

  const handleNavigate = (view: string) => {
    switch (view) {
      case 'home':
        navigate('/');
        break;
      case 'assessment':
        navigate('/assessment');
        break;
      case 'resources':
        navigate('/resources');
        break;
      case 'findhelp':
        navigate('/find-help');
        break;
      case 'signin':
        navigate('/sign-in');
        break;
      case 'getstarted':
        navigate('/get-started');
        break;
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'chat':
        navigate('/chat');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <>
      <Header onNavigate={handleNavigate} />
      <HeroSection 
        onStartAssessment={() => navigate('/assessment')}
        onLearnMore={() => navigate('/learn-more')}
        onViewDashboard={() => navigate('/dashboard')}
      />
      
      {/* Safety monitoring for critical issues */}
      <div className="container mx-auto px-4 py-6">
        <SafetyMonitor />
        
        {/* UX enhancements for better user experience */}
        <div className="mt-8">
          <UXEnhancements 
            showSuggestions={true}
            showQuickActions={true}
            showProgressIndicator={true}
          />
        </div>
      </div>
    </>
  );
}