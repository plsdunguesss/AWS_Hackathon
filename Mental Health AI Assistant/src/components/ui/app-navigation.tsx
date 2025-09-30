import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';

// Navigation flow mapping for smooth user experience
const navigationFlows = {
  '/': {
    next: ['/get-started', '/assessment', '/chat', '/learn-more'],
    title: 'Welcome to MindCare AI'
  },
  '/get-started': {
    next: ['/assessment', '/dashboard'],
    prev: '/',
    title: 'Get Started'
  },
  '/assessment': {
    next: ['/results'],
    prev: '/get-started',
    title: 'Mental Health Assessment'
  },
  '/results': {
    next: ['/dashboard', '/chat', '/professionals'],
    prev: '/assessment',
    title: 'Assessment Results'
  },
  '/chat': {
    next: ['/dashboard', '/progress'],
    prev: '/',
    title: 'AI Assistant Chat'
  },
  '/dashboard': {
    next: ['/chat', '/progress', '/settings'],
    prev: '/',
    title: 'Dashboard'
  },
  '/progress': {
    next: ['/dashboard', '/chat'],
    prev: '/dashboard',
    title: 'Progress Tracking'
  },
  '/settings': {
    next: ['/dashboard'],
    prev: '/dashboard',
    title: 'Settings'
  },
  '/professionals': {
    next: ['/dashboard'],
    prev: '/results',
    title: 'Mental Health Professionals'
  },
  '/resources': {
    next: ['/dashboard'],
    prev: '/',
    title: 'Mental Health Resources'
  },
  '/find-help': {
    next: ['/professionals'],
    prev: '/',
    title: 'Find Help'
  }
};

export function AppNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setBreadcrumbs, setNavigationFlow } = useNavigation();

  useEffect(() => {
    const currentPath = location.pathname;
    const flow = navigationFlows[currentPath as keyof typeof navigationFlows];
    
    if (flow) {
      // Set breadcrumbs based on navigation flow
      const breadcrumbs = [];
      
      // Add home breadcrumb for non-home pages
      if (currentPath !== '/') {
        breadcrumbs.push({ label: 'Home', path: '/' });
      }
      
      // Add current page breadcrumb
      breadcrumbs.push({ 
        label: flow.title, 
        path: currentPath 
      });
      
      setBreadcrumbs(breadcrumbs);
      
      // Set navigation flow for context
      setNavigationFlow({
        current: currentPath,
        next: flow.next || [],
        prev: flow.prev || null,
        title: flow.title
      });
    }
  }, [location.pathname, setBreadcrumbs, setNavigationFlow]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      // Update navigation context when user uses browser navigation
      const currentPath = location.pathname;
      const flow = navigationFlows[currentPath as keyof typeof navigationFlows];
      
      if (flow) {
        setNavigationFlow({
          current: currentPath,
          next: flow.next || [],
          prev: flow.prev || null,
          title: flow.title
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, setNavigationFlow]);

  return null; // This is a utility component that doesn't render anything
}

// Helper function to get suggested next steps based on current page
export function getSuggestedNextSteps(currentPath: string): Array<{path: string, label: string, description: string}> {
  const suggestions = {
    '/': [
      { path: '/get-started', label: 'Get Started', description: 'Begin your mental health journey' },
      { path: '/assessment', label: 'Quick Assessment', description: 'Take a brief mental health screening' },
      { path: '/chat', label: 'Chat with AI', description: 'Start a conversation with our AI assistant' }
    ],
    '/get-started': [
      { path: '/assessment', label: 'Take Assessment', description: 'Complete your mental health screening' },
      { path: '/dashboard', label: 'Go to Dashboard', description: 'View your personalized dashboard' }
    ],
    '/assessment': [
      { path: '/results', label: 'View Results', description: 'See your assessment results and recommendations' }
    ],
    '/results': [
      { path: '/chat', label: 'Start Chatting', description: 'Begin conversations with our AI assistant' },
      { path: '/dashboard', label: 'View Dashboard', description: 'Access your personalized dashboard' },
      { path: '/professionals', label: 'Find Help', description: 'Connect with mental health professionals' }
    ],
    '/chat': [
      { path: '/dashboard', label: 'View Progress', description: 'Check your mental health progress' },
      { path: '/progress', label: 'Detailed Analytics', description: 'View detailed progress analytics' }
    ],
    '/dashboard': [
      { path: '/chat', label: 'Continue Chatting', description: 'Resume conversations with AI assistant' },
      { path: '/progress', label: 'View Progress', description: 'See detailed progress tracking' },
      { path: '/settings', label: 'Adjust Settings', description: 'Customize your experience' }
    ]
  };

  return suggestions[currentPath as keyof typeof suggestions] || [];
}