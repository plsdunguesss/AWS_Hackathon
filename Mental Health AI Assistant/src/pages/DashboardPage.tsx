import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardPage as DashboardComponent } from '../components/DashboardPage';
import { Layout } from '../components/Layout';
import { useNavigation } from '../contexts/NavigationContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard' }
    ]);
  }, [setBreadcrumbs]);

  return (
    <Layout 
      title="Dashboard"
      onBack={() => navigate('/')}
    >
      <DashboardComponent
        onBack={() => navigate('/')}
        onStartChat={() => navigate('/chat')}
        onViewResources={() => navigate('/resources')}
        onStartAssessment={() => navigate('/assessment')}
        onViewProfessionals={() => navigate('/professionals')}
        onViewProgress={() => navigate('/progress')}
        onViewSettings={() => navigate('/settings')}
      />
    </Layout>
  );
}