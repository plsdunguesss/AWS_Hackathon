// Navigation utility functions for managing page transitions and state

export interface NavigationState {
  previousPath?: string;
  data?: any;
}

// Store navigation state in sessionStorage
export const setNavigationState = (state: NavigationState) => {
  sessionStorage.setItem('navigationState', JSON.stringify(state));
};

// Get navigation state from sessionStorage
export const getNavigationState = (): NavigationState | null => {
  const stored = sessionStorage.getItem('navigationState');
  return stored ? JSON.parse(stored) : null;
};

// Clear navigation state
export const clearNavigationState = () => {
  sessionStorage.removeItem('navigationState');
};

// Common navigation paths
export const ROUTES = {
  HOME: '/',
  CHAT: '/chat',
  DASHBOARD: '/dashboard',
  SETTINGS: '/settings',
  PROGRESS: '/progress',
  ASSESSMENT: '/assessment',
  RESULTS: '/results',
  PROFESSIONALS: '/professionals',
  RESOURCES: '/resources',
  FIND_HELP: '/find-help',
  SIGN_IN: '/sign-in',
  GET_STARTED: '/get-started',
  LEARN_MORE: '/learn-more'
} as const;

// Helper function to get the appropriate back path based on current route
export const getBackPath = (currentPath: string): string => {
  switch (currentPath) {
    case ROUTES.SETTINGS:
    case ROUTES.PROGRESS:
      return ROUTES.DASHBOARD;
    case ROUTES.RESULTS:
      return ROUTES.ASSESSMENT;
    case ROUTES.PROFESSIONALS:
      // Could come from results or find-help, check navigation state
      const navState = getNavigationState();
      return navState?.previousPath || ROUTES.HOME;
    default:
      return ROUTES.HOME;
  }
};