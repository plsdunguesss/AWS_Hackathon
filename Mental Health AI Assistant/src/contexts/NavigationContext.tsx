import { createContext, useContext, useState, ReactNode } from 'react';
import { setNavigationState, getNavigationState } from '../utils/navigation';

export interface BreadcrumbItem {
  label: string;
  path: string;
}

export interface NavigationFlow {
  current: string;
  next: string[];
  prev: string | null;
  title: string;
}

interface NavigationContextType {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (item: BreadcrumbItem) => void;
  goBack: () => void;
  canGoBack: boolean;
  setNavigationData: (data: any) => void;
  getNavigationData: () => any;
  navigationFlow: NavigationFlow | null;
  setNavigationFlow: (flow: NavigationFlow) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [navigationFlow, setNavigationFlow] = useState<NavigationFlow | null>(null);

  const addBreadcrumb = (item: BreadcrumbItem) => {
    setBreadcrumbs(prev => [...prev, item]);
  };

  const goBack = () => {
    if (breadcrumbs.length > 1) {
      setBreadcrumbs(prev => prev.slice(0, -1));
      // Navigate to previous breadcrumb
      const previousPath = breadcrumbs[breadcrumbs.length - 2]?.path;
      if (previousPath) {
        window.history.pushState(null, '', previousPath);
      }
    } else if (navigationFlow?.prev) {
      // Use navigation flow if available
      window.history.pushState(null, '', navigationFlow.prev);
    }
  };

  const canGoBack = breadcrumbs.length > 1 || !!navigationFlow?.prev;

  const setNavigationData = (data: any) => {
    const currentPath = window.location.pathname;
    setNavigationState({ previousPath: currentPath, data });
  };

  const getNavigationData = () => {
    const state = getNavigationState();
    return state?.data || null;
  };

  return (
    <NavigationContext.Provider value={{
      breadcrumbs,
      setBreadcrumbs,
      addBreadcrumb,
      goBack,
      canGoBack,
      setNavigationData,
      getNavigationData,
      navigationFlow,
      setNavigationFlow
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}