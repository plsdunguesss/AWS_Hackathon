import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressPage as ProgressComponent } from '../components/ProgressPage';
import { Layout } from '../components/Layout';
import { useNavigation } from '../contexts/NavigationContext';

export function ProgressPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Progress', path: '/progress' }
    ]);
  }, [setBreadcrumbs]);

  return (
    <Layout 
      title="Progress Tracking"
      onBack={() => navigate('/dashboard')}
    >
      <ProgressComponent onBack={() => navigate('/dashboard')} />
    </Layout>
  );
}