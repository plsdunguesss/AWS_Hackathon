import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResourcesPage as ResourcesComponent } from '../components/ResourcesPage';
import { Layout } from '../components/Layout';
import { useNavigation } from '../contexts/NavigationContext';

export function ResourcesPage() {
  const navigate = useNavigate();
  const { setBreadcrumbs } = useNavigation();

  useEffect(() => {
    setBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Resources', path: '/resources' }
    ]);
  }, [setBreadcrumbs]);

  return (
    <Layout 
      title="Mental Health Resources"
      onBack={() => navigate('/')}
    >
      <ResourcesComponent onBack={() => navigate('/')} />
    </Layout>
  );
}